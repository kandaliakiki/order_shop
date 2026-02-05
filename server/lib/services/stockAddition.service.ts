import { connectToDB } from "../mongoose";
import Ingredient from "../models/ingredient.model";
import IngredientLot from "../models/ingredientLot.model";
import { AIService } from "./ai.service";
import { addDays, differenceInDays, format } from "date-fns";

export interface StockAdditionResult {
  success: boolean;
  message: string;
}

export class StockAdditionService {
  private aiService = new AIService();

  async processStockAddition(
    message: string,
    whatsappNumber: string
  ): Promise<StockAdditionResult> {
    try {
      await connectToDB();

      // 1. Parse user input with AI
      const parsed = await this.aiService.parseStockAddition(message);

      if (!parsed.ingredientName || parsed.quantity <= 0) {
        return {
          success: false,
          message: `❌ Could not parse stock information. Please provide ingredient name and quantity.\nExample: "/stock 10kg flour"`,
        };
      }

      // 2. Find ingredient (fuzzy match)
      const ingredient = await this.findIngredient(parsed.ingredientName);
      if (!ingredient) {
        return {
          success: false,
          message: `❌ Ingredient "${parsed.ingredientName}" not found. Please check the name and try again.`,
        };
      }

      // 3. Calculate expiry date with priority logic
      // Priority: user-specified > ingredient.defaultExpiryDays > AI prediction > safe default (30 days)
      const { expiryDate, expirySource } = await this.calculateExpiryDate(
        ingredient,
        parsed.expiryDays
      );

      // 4. Create lot
      const lot = await IngredientLot.create({
        ingredient: ingredient._id,
        quantity: parsed.quantity,
        unit: parsed.unit || ingredient.unit,
        expiryDate: expiryDate,
        purchaseDate: new Date(),
        supplier: parsed.supplier,
        cost: parsed.cost,
        currentStock: parsed.quantity, // New lot, full quantity available
        expirySource: expirySource, // Track how expiry was determined
      });

      // 5. Update ingredient total stock
      ingredient.currentStock += parsed.quantity;
      await ingredient.save();

      // 6. Format response
      const expiryDays = this.getDaysUntilExpiry(expiryDate);
      const expiryDateStr = format(expiryDate, "MMM dd, yyyy");

      let response = `✅ Added ${parsed.quantity}${parsed.unit || ingredient.unit} ${ingredient.name}\n`;
      response += `📦 Lot ID: ${lot.lotId}\n`;
      response += `📅 Expiry: ${expiryDateStr} (${expiryDays} days)`;
      
      // Add note if AI failed and defaulted to 30 days
      if (expirySource === "default") {
        response += `\n⚠️ Note: Expiry date defaulted to 30 days (AI prediction unavailable)`;
      }
      
      response += `\n📊 Total Stock: ${ingredient.currentStock}${ingredient.unit}`;

      if (parsed.supplier) {
        response += `\n🏪 Supplier: ${parsed.supplier}`;
      }

      if (parsed.cost) {
        response += `\n💰 Cost: $${parsed.cost.toFixed(2)}`;
      }

      return {
        success: true,
        message: response,
      };
    } catch (error: any) {
      console.error("Error processing stock addition:", error);
      return {
        success: false,
        message: `❌ Error: ${error.message || "Failed to add stock"}`,
      };
    }
  }

  private async findIngredient(name: string): Promise<any> {
    // Try exact match first
    let ingredient = await Ingredient.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (ingredient) return ingredient;

    // Try partial match
    ingredient = await Ingredient.findOne({
      name: { $regex: new RegExp(name, "i") },
    });

    return ingredient;
  }

  private async calculateExpiryDate(
    ingredient: any,
    customExpiryDays?: number
  ): Promise<{ expiryDate: Date; expirySource: "user" | "database" | "ai" | "default" }> {
    // PRIORITY 1: User-specified expiry (from WhatsApp)
    if (customExpiryDays) {
      return {
        expiryDate: addDays(new Date(), customExpiryDays),
        expirySource: "user",
      };
    }

    // PRIORITY 2: Ingredient's defaultExpiryDays (from database)
    if (ingredient.defaultExpiryDays && ingredient.defaultExpiryDays > 0) {
      return {
        expiryDate: addDays(new Date(), ingredient.defaultExpiryDays),
        expirySource: "database",
      };
    }

    // PRIORITY 3: AI Prediction (only if ingredient.defaultExpiryDays is NOT set)
    try {
      const predictedDays = await this.aiService.predictExpiryDays(ingredient.name);
      return {
        expiryDate: addDays(new Date(), predictedDays),
        expirySource: "ai",
      };
    } catch (error) {
      console.error("AI prediction failed, using safe default (30 days):", error);
      // PRIORITY 4: Safe default (30 days) if AI fails
      return {
        expiryDate: addDays(new Date(), 30),
        expirySource: "default",
      };
    }
  }

  private getDaysUntilExpiry(expiryDate: Date): number {
    return Math.ceil(
      (expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
  }
}
