import mongoose from "mongoose";
import { createOrder } from "../actions/order.action";
import { OrderData } from "../models/order.model";
import { ExtractedOrderData } from "./ai.service";
import { fetchProducts } from "../actions/product.action";

export interface GeneratedOrderResult {
  order: any; // Created order document
  success: boolean;
  errors?: string[];
  warnings?: string[];
}

export class OrderGenerationService {
  private readonly TAX_RATE = 0.1; // 10% tax (adjust as needed)

  /**
   * Find product in database by name (case-insensitive)
   */
  private findProductByName(products: any[], productName: string): any | null {
    const normalizedName = productName.toLowerCase().trim();
    return (
      products.find((p) => p.name.toLowerCase().trim() === normalizedName) ||
      null
    );
  }

  /**
   * Generate order from AI analysis results
   */
  async generateOrder(
    aiAnalysis: ExtractedOrderData,
    whatsappNumber: string,
    whatsappMessageId: string
  ): Promise<GeneratedOrderResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate we have at least one product
    if (!aiAnalysis.products || aiAnalysis.products.length === 0) {
      return {
        order: null,
        success: false,
        errors: ["No products found in the message"],
      };
    }

    // Get all products from database
    const allProducts = await fetchProducts();

    // Find products in database by name (AI already matched them)
    const orderItems = [];
    for (const extractedProduct of aiAnalysis.products) {
      const product = this.findProductByName(
        allProducts,
        extractedProduct.name
      );

      if (product) {
        orderItems.push({
          name: product.name,
          quantity: extractedProduct.quantity,
          price: product.price,
        });
      } else {
        // Product not found (shouldn't happen if AI matched correctly)
        warnings.push(
          `Product "${extractedProduct.name}" not found in database`
        );
        errors.push(`Could not find product: "${extractedProduct.name}"`);
      }
    }

    // If no valid products found, fail
    if (orderItems.length === 0) {
      return {
        order: null,
        success: false,
        errors: errors.length > 0 ? errors : ["No valid products found"],
      };
    }

    // Calculate totals
    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * this.TAX_RATE;
    const total = subtotal + tax;

    // Extract customer name from AI analysis or use default
    const customerName = aiAnalysis.customerName || "WhatsApp Customer";

    // Extract phone number (remove whatsapp: prefix if present)
    const phoneNumber = whatsappNumber.replace(/^whatsapp:/, "");

    // Create order data
    const orderData: OrderData = {
      customerName,
      phoneNumber,
      items: orderItems,
      subtotal,
      tax,
      total,
      status: "New Order",
      createdAt: new Date(),
      source: "whatsapp",
      whatsappNumber,
      whatsappMessageId: new mongoose.Types.ObjectId(whatsappMessageId),
      aiAnalysisMetadata: {
        confidence: aiAnalysis.confidence,
        extractionMethod: "ai_analysis",
        rawAnalysis: aiAnalysis,
      },
    };

    try {
      const order = await createOrder(orderData);

      return {
        order,
        success: true,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error: any) {
      console.error("Error creating order:", error);
      return {
        order: null,
        success: false,
        errors: [error.message || "Failed to create order"],
      };
    }
  }
}

