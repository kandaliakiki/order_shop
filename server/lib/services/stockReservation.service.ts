import { connectToDB } from "../mongoose";
import Ingredient from "../models/ingredient.model";
import { IngredientRequirement } from "./ingredientStockCalculation.service";

export interface StockReservationResult {
  success: boolean;
  reservedIngredients: Array<{
    ingredientId: string;
    ingredientName: string;
    quantityReserved: number;
    newReservedStock: number;
    availableStock: number;
  }>;
  errors: string[];
}

export class StockReservationService {
  /**
   * Reserve ingredient stock for an order (without deducting)
   * This reserves stock so it can't be used by other orders
   * Stock is only deducted when order status changes to "On Process"
   */
  async reserveStockForOrder(
    requirements: IngredientRequirement[],
    pickupDate?: Date
  ): Promise<StockReservationResult> {
    await connectToDB();

    const reservedIngredients = [];
    const errors: string[] = [];

    // Check if all ingredients are sufficient (considering reserved stock)
    for (const requirement of requirements) {
      const ingredient = await Ingredient.findById(requirement.ingredientId);
      if (!ingredient) {
        errors.push(`Ingredient "${requirement.ingredientName}" not found`);
        continue;
      }

      // Calculate available stock: currentStock - reservedStock
      const availableStock = ingredient.currentStock - (ingredient.reservedStock || 0);

      if (availableStock < requirement.requiredQuantity) {
        errors.push(
          `Insufficient stock for ${requirement.ingredientName}. Required: ${requirement.requiredQuantity} ${requirement.unit}, Available: ${availableStock} ${requirement.unit}`
        );
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        reservedIngredients: [],
        errors,
      };
    }

    // Reserve stock for each ingredient
    for (const requirement of requirements) {
      try {
        const ingredient = await Ingredient.findById(requirement.ingredientId);
        if (!ingredient) {
          errors.push(`Ingredient "${requirement.ingredientName}" not found`);
          continue;
        }

        // Add to reserved stock
        const currentReserved = ingredient.reservedStock || 0;
        ingredient.reservedStock = currentReserved + requirement.requiredQuantity;
        await ingredient.save();

        const availableStock = ingredient.currentStock - ingredient.reservedStock;

        reservedIngredients.push({
          ingredientId: requirement.ingredientId,
          ingredientName: requirement.ingredientName,
          quantityReserved: requirement.requiredQuantity,
          newReservedStock: ingredient.reservedStock,
          availableStock: availableStock,
        });

        console.log(
          `✅ Reserved ${requirement.requiredQuantity} ${requirement.unit} of ${requirement.ingredientName}. Reserved: ${ingredient.reservedStock} ${requirement.unit}, Available: ${availableStock} ${requirement.unit}`
        );
      } catch (error: any) {
        console.error(
          `❌ Error reserving stock for ${requirement.ingredientName}:`,
          error
        );
        errors.push(
          `Failed to reserve stock for ${requirement.ingredientName}: ${error.message}`
        );
      }
    }

    return {
      success: errors.length === 0,
      reservedIngredients,
      errors,
    };
  }

  /**
   * Release reserved stock (e.g., when order is cancelled)
   */
  async releaseReservedStock(
    requirements: IngredientRequirement[]
  ): Promise<{ success: boolean; errors: string[] }> {
    await connectToDB();

    const errors: string[] = [];

    for (const requirement of requirements) {
      try {
        const ingredient = await Ingredient.findById(requirement.ingredientId);
        if (!ingredient) {
          errors.push(`Ingredient "${requirement.ingredientName}" not found`);
          continue;
        }

        // Release reserved stock
        const currentReserved = ingredient.reservedStock || 0;
        ingredient.reservedStock = Math.max(0, currentReserved - requirement.requiredQuantity);
        await ingredient.save();

        console.log(
          `✅ Released ${requirement.requiredQuantity} ${requirement.unit} of ${requirement.ingredientName}. Reserved: ${ingredient.reservedStock} ${requirement.unit}`
        );
      } catch (error: any) {
        console.error(
          `❌ Error releasing stock for ${requirement.ingredientName}:`,
          error
        );
        errors.push(
          `Failed to release stock for ${requirement.ingredientName}: ${error.message}`
        );
      }
    }

    return {
      success: errors.length === 0,
      errors,
    };
  }
}
