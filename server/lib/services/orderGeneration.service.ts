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

    // Always use "WhatsApp Customer" for WhatsApp orders
    const customerName = "WhatsApp Customer";

    // Extract phone number (remove whatsapp: prefix if present)
    const phoneNumber = whatsappNumber.replace(/^whatsapp:/, "");

    // Parse pickup date if provided, otherwise will default to createdAt in pre-save hook
    let pickupDate: Date | undefined;
    if (aiAnalysis.deliveryDate) {
      try {
        // Parse the date string (should be YYYY-MM-DD format)
        const dateStr = aiAnalysis.deliveryDate.trim();
        
        // Validate format (YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          console.warn(`Invalid deliveryDate format: ${dateStr}, using default`);
          pickupDate = undefined;
        } else {
          // Create date at midnight UTC to avoid timezone issues
          pickupDate = new Date(dateStr + 'T00:00:00.000Z');
          
          // Validate date is not invalid and not in the past (allow today and future)
          if (isNaN(pickupDate.getTime())) {
            console.warn(`Invalid deliveryDate: ${dateStr}, using default`);
            pickupDate = undefined;
          } else {
            // Check if date is reasonable (not before 2020, not too far in future)
            const minDate = new Date('2020-01-01');
            const maxDate = new Date();
            maxDate.setFullYear(maxDate.getFullYear() + 2); // Allow up to 2 years in future
            
            if (pickupDate < minDate || pickupDate > maxDate) {
              console.warn(`DeliveryDate out of reasonable range: ${dateStr}, using default`);
              pickupDate = undefined;
            }
          }
        }
      } catch (error) {
        console.error(`Error parsing deliveryDate: ${aiAnalysis.deliveryDate}`, error);
        pickupDate = undefined; // Error parsing, will use default
      }
    }

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
      pickupDate, // Will default to createdAt if not provided
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

