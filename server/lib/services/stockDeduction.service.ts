import { connectToDB } from "../mongoose";
import Ingredient from "../models/ingredient.model";
import { IngredientRequirement } from "./ingredientStockCalculation.service";

export interface StockDeductionResult {
  success: boolean;
  deductedIngredients: Array<{
    ingredientId: string;
    ingredientName: string;
    quantityDeducted: number;
    newStock: number;
  }>;
  errors: string[];
}

export class StockDeductionService {
  /**
   * Deduct ingredient stock for an order
   * Only deducts if all ingredients are sufficient
   */
  async deductStockForOrder(
    requirements: IngredientRequirement[]
  ): Promise<StockDeductionResult> {
    await connectToDB();

    const deductedIngredients = [];
    const errors: string[] = [];

    // Check if all ingredients are sufficient first
    const allSufficient = requirements.every((r) => r.isSufficient);

    if (!allSufficient) {
      return {
        success: false,
        deductedIngredients: [],
        errors: ["Cannot deduct stock: insufficient ingredients"],
      };
    }

    // Deduct stock for each ingredient
    for (const requirement of requirements) {
      try {
        const ingredient = await Ingredient.findById(requirement.ingredientId);

        if (!ingredient) {
          errors.push(`Ingredient "${requirement.ingredientName}" not found`);
          continue;
        }

        // Calculate new stock
        const newStock = ingredient.currentStock - requirement.requiredQuantity;

        // Update ingredient stock
        ingredient.currentStock = newStock;
        await ingredient.save();

        deductedIngredients.push({
          ingredientId: requirement.ingredientId,
          ingredientName: requirement.ingredientName,
          quantityDeducted: requirement.requiredQuantity,
          newStock: ingredient.currentStock,
        });

        console.log(
          `✅ Deducted ${requirement.requiredQuantity} ${requirement.unit} of ${requirement.ingredientName}. New stock: ${ingredient.currentStock} ${requirement.unit}`
        );
      } catch (error: any) {
        console.error(
          `❌ Error deducting stock for ${requirement.ingredientName}:`,
          error
        );
        errors.push(
          `Failed to deduct stock for ${requirement.ingredientName}: ${error.message}`
        );
      }
    }

    return {
      success: errors.length === 0,
      deductedIngredients,
      errors,
    };
  }
}
