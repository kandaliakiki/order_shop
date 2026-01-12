import { AIService } from "../services/ai.service";
import { OrderGenerationService } from "../services/orderGeneration.service";
import {
  updateMessageAnalysis,
  linkMessageToOrder,
} from "./whatsappMessage.action";
import { fetchProducts } from "./product.action";
import { ExtractedOrderData } from "../services/ai.service";
import { GeneratedOrderResult } from "../services/orderGeneration.service";

export interface ProcessWhatsAppMessageResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

/**
 * Process WhatsApp message: Analyze with AI and generate order
 */
export async function processWhatsAppMessageForOrder(
  messageBody: string,
  whatsappNumber: string,
  whatsappMessageMongoId: string, // MongoDB _id (for order generation)
  twilioMessageId: string // Twilio messageId/SID (for message updates)
): Promise<ProcessWhatsAppMessageResult> {
  try {
    const availableProducts = await fetchProductsForAI();
    const aiAnalysis = await analyzeMessageWithAI(
      messageBody,
      availableProducts
    );
    const orderResult = await generateOrderFromAnalysis(
      aiAnalysis,
      whatsappNumber,
      whatsappMessageMongoId
    );

    await updateMessageWithAnalysisResults(
      twilioMessageId,
      aiAnalysis,
      orderResult
    );

    if (orderResult.success && orderResult.order) {
      await linkMessageToOrder(
        twilioMessageId,
        orderResult.order._id.toString()
      );
      return {
        success: true,
        orderId: orderResult.order.orderId,
      };
    }

    return {
      success: false,
      error: orderResult.errors?.join(", ") || "Failed to generate order",
    };
  } catch (error: any) {
    console.error("❌ Error processing WhatsApp message for order:", error);
    await updateMessageAnalysis(twilioMessageId, {
      error: error.message || "AI analysis failed",
    });
    return {
      success: false,
      error: error.message || "Processing failed",
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

