import { AIService } from "./ai.service";
import { connectToDB } from "../mongoose";
import Product from "../models/product.model";
import Ingredient from "../models/ingredient.model";
import WasteLog from "../models/wasteLog.model";
import { LotDeductionService } from "./lotDeduction.service";
import { IngredientRequirement } from "./ingredientStockCalculation.service";

export interface WasteLoggingResult {
  success: boolean;
  message: string;
}

export class WasteLoggingService {
  private aiService: AIService;
  private lotDeductionService: LotDeductionService;

  constructor() {
    this.aiService = new AIService();
    this.lotDeductionService = new LotDeductionService();
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

      // 2. Convert waste items to ingredient requirements (for FEFO deduction)
      const ingredientRequirementsMap = new Map<string, IngredientRequirement>();
      const results: string[] = [];

      for (const item of extracted.items) {
        let found = false;

        // Check if it's a product
        const product = await Product.findOne({
          name: { $regex: new RegExp(item.name, "i") },
        }).populate("ingredients.ingredient");

        if (product && product.ingredients && product.ingredients.length > 0) {
          // Convert product waste to ingredient requirements
          for (const ing of product.ingredients) {
            const ingredient = ing.ingredient as any;
            if (ingredient) {
              const totalToDeduct = ing.quantity * item.quantity;
              const key = `${ingredient._id.toString()}_${ing.unit}`;
              
              // Check if ingredient already in requirements map
              if (ingredientRequirementsMap.has(key)) {
                const existingReq = ingredientRequirementsMap.get(key)!;
                existingReq.requiredQuantity += totalToDeduct;
                existingReq.isSufficient = existingReq.currentStock >= existingReq.requiredQuantity;
                existingReq.shortage = existingReq.isSufficient
                  ? 0
                  : existingReq.requiredQuantity - existingReq.currentStock;
              } else {
                // Fetch fresh ingredient data
                const freshIngredient = await Ingredient.findById(ingredient._id);
                if (freshIngredient) {
                  ingredientRequirementsMap.set(key, {
                    ingredientId: freshIngredient._id.toString(),
                    ingredientName: freshIngredient.name,
                    unit: ing.unit,
                    requiredQuantity: totalToDeduct,
                    currentStock: freshIngredient.currentStock,
                    minimumStock: freshIngredient.minimumStock,
                    isSufficient: freshIngredient.currentStock >= totalToDeduct,
                    shortage: freshIngredient.currentStock >= totalToDeduct
                      ? 0
                      : totalToDeduct - freshIngredient.currentStock,
                  });
                }
              }
            }
          }
          found = true;
        } else {
          // Check if it's an ingredient
          const ingredient = await Ingredient.findOne({
            name: { $regex: new RegExp(item.name, "i") },
          });

          if (ingredient) {
            const key = `${ingredient._id.toString()}_${item.unit}`;
            
            // Check if ingredient already in requirements map
            if (ingredientRequirementsMap.has(key)) {
              const existingReq = ingredientRequirementsMap.get(key)!;
              existingReq.requiredQuantity += item.quantity;
              existingReq.isSufficient = existingReq.currentStock >= existingReq.requiredQuantity;
              existingReq.shortage = existingReq.isSufficient
                ? 0
                : existingReq.requiredQuantity - existingReq.currentStock;
            } else {
              // Fetch fresh ingredient data
              const freshIngredient = await Ingredient.findById(ingredient._id);
              if (freshIngredient) {
                ingredientRequirementsMap.set(key, {
                  ingredientId: freshIngredient._id.toString(),
                  ingredientName: freshIngredient.name,
                  unit: item.unit,
                  requiredQuantity: item.quantity,
                  currentStock: freshIngredient.currentStock,
                  minimumStock: freshIngredient.minimumStock,
                  isSufficient: freshIngredient.currentStock >= item.quantity,
                  shortage: freshIngredient.currentStock >= item.quantity
                    ? 0
                    : item.quantity - freshIngredient.currentStock,
                });
              }
            }
            found = true;
          }
        }

        if (found) {
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

      // 3. Convert map to array and ensure all are marked as sufficient for waste deduction
      // (For waste, we deduct regardless of current stock level)
      const ingredientRequirements = Array.from(ingredientRequirementsMap.values()).map(req => ({
        ...req,
        isSufficient: true, // Force sufficient for waste - we deduct what we can
      }));

      // 4. Deduct from lots using FEFO (First Expired First Out)
      if (ingredientRequirements.length > 0) {
        const deductionResult = await this.lotDeductionService.deductFromLots(
          ingredientRequirements
        );

        if (!deductionResult.success && deductionResult.errors.length > 0) {
          console.warn("Some waste deductions failed:", deductionResult.errors);
          // Still return success but note the errors
          results.push(`\n⚠️ Note: Some stock deductions had issues. Please check manually.`);
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
