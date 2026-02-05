import { connectToDB } from "../mongoose";
import Ingredient from "../models/ingredient.model";
import { IngredientRequirement } from "./ingredientStockCalculation.service";
import { LotDeductionService, LotUsageInfo } from "./lotDeduction.service";

export interface StockDeductionResult {
  success: boolean;
  deductedIngredients: Array<{
    ingredientId: string;
    ingredientName: string;
    quantityDeducted: number;
    newStock: number;
  }>;
  lotUsageMetadata?: {
    lotsUsed: LotUsageInfo[];
    deductedAt: Date;
  };
  errors: string[];
}

export class StockDeductionService {
  private lotDeductionService: LotDeductionService;

  constructor() {
    this.lotDeductionService = new LotDeductionService();
  }

  /**
   * Deduct ingredient stock for an order using FEFO lot-based deduction
   * Only deducts if all ingredients are sufficient
   * Falls back to aggregate deduction if no lots exist
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

    // Try lot-based deduction first
    const lotDeductionResult =
      await this.lotDeductionService.deductFromLots(requirements);

    if (lotDeductionResult.success && lotDeductionResult.lotsUsed.length > 0) {
      // Lot-based deduction succeeded
      // Get updated stock for each ingredient
      for (const requirement of requirements) {
        const ingredient = await Ingredient.findById(requirement.ingredientId);
        if (ingredient) {
          deductedIngredients.push({
            ingredientId: requirement.ingredientId,
            ingredientName: requirement.ingredientName,
            quantityDeducted: requirement.requiredQuantity,
            newStock: ingredient.currentStock,
          });
        }
      }

      return {
        success: true,
        deductedIngredients,
        lotUsageMetadata: {
          lotsUsed: lotDeductionResult.lotsUsed,
          deductedAt: new Date(),
        },
        errors: [],
      };
    }

    // Fallback: Aggregate deduction (if no lots exist or lot deduction failed)
    console.log(
      "⚠️ Lot-based deduction not available, falling back to aggregate deduction"
    );

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
