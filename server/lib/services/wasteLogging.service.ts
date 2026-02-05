import { AIService } from "./ai.service";
import { connectToDB } from "../mongoose";
import Product from "../models/product.model";
import Ingredient from "../models/ingredient.model";
import WasteLog from "../models/wasteLog.model";

export interface WasteLoggingResult {
  success: boolean;
  message: string;
}

export class WasteLoggingService {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  async processWasteCommand(
    text: string,
    whatsappNumber: string
  ): Promise<WasteLoggingResult> {
    try {
      await connectToDB();

      // 1. AI extraction
      const extracted = await this.aiService.analyzeWasteMessage(text);

      if (extracted.items.length === 0) {
        return {
          success: false,
          message: "❌ No waste information found. Please specify item, quantity, and reason.\n\nExample: /waste 5 croissants burnt",
        };
      }

      // 2. For each item, decrement inventory
      const results: string[] = [];

      for (const item of extracted.items) {
        let decremented = false;

        // Check if it's a product
        const product = await Product.findOne({
          name: { $regex: new RegExp(item.name, "i") },
        }).populate("ingredients.ingredient");

        if (product && product.ingredients && product.ingredients.length > 0) {
          // Decrement ingredients for this product
          for (const ing of product.ingredients) {
            const ingredient = ing.ingredient as any;
            if (ingredient) {
              const totalToDeduct = ing.quantity * item.quantity;
              await Ingredient.findByIdAndUpdate(ingredient._id, {
                $inc: { currentStock: -totalToDeduct },
              });
            }
          }
          decremented = true;
        } else {
          // Check if it's an ingredient
          const ingredient = await Ingredient.findOne({
            name: { $regex: new RegExp(item.name, "i") },
          });

          if (ingredient) {
            await Ingredient.findByIdAndUpdate(ingredient._id, {
              $inc: { currentStock: -item.quantity },
            });
            decremented = true;
          }
        }

        if (decremented) {
          // Log waste entry
          await WasteLog.create({
            itemName: item.name,
            quantity: item.quantity,
            unit: item.unit,
            reason: item.reason,
            loggedBy: whatsappNumber,
            loggedAt: new Date(),
          });
          results.push(
            `✅ ${item.quantity} ${item.unit} ${item.name} (${item.reason})`
          );
        } else {
          results.push(`❌ ${item.name} not found`);
        }
      }

      return {
        success: true,
        message: `Waste Logged:\n${results.join("\n")}`,
      };
    } catch (error: any) {
      console.error("Error processing waste command:", error);
      return {
        success: false,
        message: `❌ Error logging waste: ${error.message}`,
      };
    }
  }
}
