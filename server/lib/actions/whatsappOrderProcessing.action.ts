import { AIService } from "../services/ai.service";
import { OrderGenerationService } from "../services/orderGeneration.service";
import { IngredientStockCalculationService } from "../services/ingredientStockCalculation.service";
import { StockDeductionService } from "../services/stockDeduction.service";
import { StockReservationService } from "../services/stockReservation.service";
import { WhatsAppMessageFormatter } from "../services/whatsappMessageFormatter.service";
import { updateOrderStatus } from "./order.action";
import {
  updateMessageAnalysis,
  linkMessageToOrder,
} from "./whatsappMessage.action";
import { fetchProducts } from "./product.action";
import { fetchOrderById } from "./order.action";
import { ExtractedOrderData } from "../services/ai.service";
import { GeneratedOrderResult } from "../services/orderGeneration.service";
import Order from "../models/order.model";

export interface ProcessWhatsAppMessageResult {
  success: boolean;
  orderId?: string;
  error?: string;
  whatsappResponse?: string; // The message to send back to customer
}

/** Structured data from conversational flow; when provided, order is built from this instead of re-parsing message */
export interface ConversationalCollectedData {
  products: Array<{ name: string; quantity: number }>;
  deliveryDate?: string;
  deliveryAddress?: string;
  fulfillmentType?: "pickup" | "delivery";
  pickupTime?: string;
}

/**
 * Process WhatsApp message: Analyze with AI, generate order, check stock, and respond.
 * When collectedData is provided (from conversational flow), order is built from it so pickupTime/fulfillmentType are persisted.
 */
export async function processWhatsAppMessageForOrder(
  messageBody: string,
  whatsappNumber: string,
  whatsappMessageMongoId: string, // MongoDB _id (for order generation)
  twilioMessageId: string, // Twilio messageId/SID (for message updates)
  skipStockCheck: boolean = false, // If true, just create order without stock checks/reservations
  collectedData?: ConversationalCollectedData // When set, use this for order instead of AI-parsing messageBody
): Promise<ProcessWhatsAppMessageResult> {
  try {
    let aiAnalysis: ExtractedOrderData;

    if (collectedData && collectedData.products && collectedData.products.length > 0) {
      // Build order from conversational collected data so pickupTime, fulfillmentType, etc. are persisted
      aiAnalysis = {
        products: collectedData.products.map((p) => ({
          name: p.name,
          quantity: p.quantity,
          confidence: 1,
        })),
        deliveryDate: collectedData.deliveryDate,
        deliveryAddress: collectedData.deliveryAddress,
        fulfillmentType: collectedData.fulfillmentType,
        pickupTime: collectedData.pickupTime,
        confidence: 1,
      };
    } else {
      // Step 1: AI Analysis
      const availableProducts = await fetchProductsForAI();
      aiAnalysis = await analyzeMessageWithAI(
        messageBody,
        availableProducts
      );
    }

    // Step 2: Generate Order (initially with "New Order" status)
    const orderResult = await generateOrderFromAnalysis(
      aiAnalysis,
      whatsappNumber,
      whatsappMessageMongoId
    );

    if (!orderResult.success || !orderResult.order) {
      await updateMessageAnalysis(twilioMessageId, {
        extractedData: aiAnalysis,
        confidence: aiAnalysis.confidence,
        error: orderResult.errors?.join(", ") || "Failed to generate order",
      });
      return {
        success: false,
        error: orderResult.errors?.join(", ") || "Failed to generate order",
        whatsappResponse:
          "❌ Sorry, we couldn't process your order. Please try again or contact us.",
      };
    }

    // Step 3: Link message to order
    await linkMessageToOrder(twilioMessageId, orderResult.order._id.toString());

    let whatsappResponse: string;

    if (!skipStockCheck) {
      // Step 4: Calculate ingredient requirements
      const stockCalculationService = new IngredientStockCalculationService();
      const order = await fetchOrderById(orderResult.order.orderId);
      const stockCalculation =
        await stockCalculationService.calculateOrderIngredientRequirements(order);

      // Step 4.5: Store stock calculation in order metadata (before deduction)
      const stockCalculationMetadata = {
        calculatedAt: new Date(),
        allIngredientsSufficient: stockCalculation.allIngredientsSufficient,
        requirements: stockCalculation.requirements.map((req) => ({
          ingredientId: req.ingredientId,
          ingredientName: req.ingredientName,
          unit: req.unit,
          requiredQuantity: req.requiredQuantity,
          stockAtTimeOfOrder: req.currentStock, // Store stock level BEFORE deduction
          wasSufficient: req.isSufficient,
        })),
        warnings: stockCalculation.warnings,
      };

      // Update order with stock calculation metadata
      await Order.findOneAndUpdate(
        { orderId: orderResult.order.orderId },
        { stockCalculationMetadata },
        { new: true }
      );

      // Step 5: Check stock and process accordingly
      const messageFormatter = new WhatsAppMessageFormatter();

      if (stockCalculation.allIngredientsSufficient) {
        // All ingredients sufficient: RESERVE stock (don't deduct yet)
        const stockReservationService = new StockReservationService();
        const order = await fetchOrderById(orderResult.order.orderId);
        const reservationResult = await stockReservationService.reserveStockForOrder(
          stockCalculation.requirements,
          order.pickupDate
        );

        if (reservationResult.success) {
          // Keep status as "New Order" (already set)
          // Stock is reserved but not deducted - will be deducted when status changes to "On Process"
          const frontendBaseUrl =
            process.env.FRONTEND_BASE_URL || process.env.NEXT_PUBLIC_FRONTEND_URL;
          whatsappResponse = messageFormatter.formatOrderConfirmationMessage(
            orderResult.order.orderId,
            undefined, // No lot usage metadata yet (will be set when actually deducted)
            frontendBaseUrl
          );
          console.log("✅ Order confirmed, stock reserved (will be deducted when processing)");
        } else {
          // Reservation failed (shouldn't happen if all sufficient, but handle it)
          await updateOrderStatus(orderResult.order.orderId, "Pending");
          whatsappResponse = messageFormatter.formatOutOfStockMessage(
            orderResult.order.orderId,
            stockCalculation.requirements.filter((r) => !r.isSufficient)
          );
          console.warn("⚠️ Stock reservation failed, order marked as Pending");
        }
      } else {
        // Insufficient ingredients: Mark as Pending, don't deduct stock
        await updateOrderStatus(orderResult.order.orderId, "Pending");
        const insufficientIngredients = stockCalculation.requirements.filter(
          (r) => !r.isSufficient
        );
        whatsappResponse = messageFormatter.formatOutOfStockMessage(
          orderResult.order.orderId,
          insufficientIngredients
        );
        console.log("⚠️ Order marked as Pending due to insufficient stock");
      }
    } else {
      // Skip all stock checks/reservations: confirm with customer-only message (no admin/stock wording)
      const messageFormatter = new WhatsAppMessageFormatter();
      const frontendBaseUrl =
        process.env.FRONTEND_BASE_URL || process.env.NEXT_PUBLIC_FRONTEND_URL;
      whatsappResponse = messageFormatter.formatCustomerOrderConfirmation({
        orderId: orderResult.order.orderId,
        fulfillmentType: orderResult.order.fulfillmentType,
        pickupTime: orderResult.order.pickupTime,
        frontendBaseUrl,
      });
      console.log("✅ Order created without stock checks (skipStockCheck=true)");
    }

    // Step 6: Update message analysis
    await updateMessageAnalysis(twilioMessageId, {
      extractedData: aiAnalysis,
      confidence: aiAnalysis.confidence,
    });

    return {
      success: true,
      orderId: orderResult.order.orderId,
      whatsappResponse,
    };
  } catch (error: any) {
    console.error("❌ Error processing WhatsApp message for order:", error);
    await updateMessageAnalysis(twilioMessageId, {
      error: error.message || "AI analysis failed",
    });
    return {
      success: false,
      error: error.message || "Processing failed",
      whatsappResponse:
        "❌ Sorry, an error occurred while processing your order. Please contact us.",
    };
  }
}

/**
 * Fetch products and format for AI context
 */
async function fetchProductsForAI(): Promise<
  Array<{ name: string; price: number }>
> {
  const products = await fetchProducts();
  return products.map((p) => ({
    name: p.name,
    price: p.price,
  }));
}

/**
 * Analyze WhatsApp message with AI to extract order information
 */
async function analyzeMessageWithAI(
  messageBody: string,
  availableProducts: Array<{ name: string; price: number }>
): Promise<ExtractedOrderData> {
  const aiService = new AIService();
  const aiAnalysis = await aiService.analyzeWhatsAppMessage(
    messageBody,
    availableProducts
  );

  console.log("🤖 AI Analysis Result:", JSON.stringify(aiAnalysis, null, 2));
  return aiAnalysis;
}

/**
 * Generate order from AI analysis results
 */
async function generateOrderFromAnalysis(
  aiAnalysis: ExtractedOrderData,
  whatsappNumber: string,
  whatsappMessageId: string
): Promise<GeneratedOrderResult> {
  const orderGenerationService = new OrderGenerationService();
  return await orderGenerationService.generateOrder(
    aiAnalysis,
    whatsappNumber,
    whatsappMessageId
  );
}

/**
 * Update WhatsApp message with analysis results and order status
 */
async function updateMessageWithAnalysisResults(
  whatsappMessageId: string,
  aiAnalysis: ExtractedOrderData,
  orderResult: GeneratedOrderResult
): Promise<void> {
  if (orderResult.success && orderResult.order) {
    await updateMessageAnalysis(whatsappMessageId, {
      extractedData: aiAnalysis,
      confidence: aiAnalysis.confidence,
    });
    console.log("✅ Order generated:", orderResult.order.orderId);
  } else {
    const errorMessage =
      orderResult.errors?.join(", ") || "No products could be matched";
    await updateMessageAnalysis(whatsappMessageId, {
      extractedData: aiAnalysis,
      confidence: aiAnalysis.confidence,
      error: errorMessage,
    });
    console.error("❌ Failed to generate order:", orderResult.errors);
  }
}
