import { AIService } from "../services/ai.service";
import { OrderGenerationService } from "../services/orderGeneration.service";
import { IngredientStockCalculationService } from "../services/ingredientStockCalculation.service";
import { StockDeductionService } from "../services/stockDeduction.service";
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

/**
 * Process WhatsApp message: Analyze with AI, generate order, check stock, and respond
 */
export async function processWhatsAppMessageForOrder(
  messageBody: string,
  whatsappNumber: string,
  whatsappMessageMongoId: string, // MongoDB _id (for order generation)
  twilioMessageId: string // Twilio messageId/SID (for message updates)
): Promise<ProcessWhatsAppMessageResult> {
  try {
    // Step 1: AI Analysis
    const availableProducts = await fetchProductsForAI();
    const aiAnalysis = await analyzeMessageWithAI(
      messageBody,
      availableProducts
    );

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
    let whatsappResponse: string;

    if (stockCalculation.allIngredientsSufficient) {
      // All ingredients sufficient: Deduct stock and confirm order
      const stockDeductionService = new StockDeductionService();
      const deductionResult = await stockDeductionService.deductStockForOrder(
        stockCalculation.requirements
      );

      if (deductionResult.success) {
        // Keep status as "New Order" (already set)
        whatsappResponse = messageFormatter.formatOrderConfirmationMessage(
          orderResult.order.orderId
        );
        console.log("✅ Order confirmed, stock deducted");
      } else {
        // Deduction failed (shouldn't happen if all sufficient, but handle it)
        await updateOrderStatus(orderResult.order.orderId, "Pending");
        whatsappResponse = messageFormatter.formatOutOfStockMessage(
          orderResult.order.orderId,
          stockCalculation.requirements.filter((r) => !r.isSufficient)
        );
        console.warn("⚠️ Stock deduction failed, order marked as Pending");
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
