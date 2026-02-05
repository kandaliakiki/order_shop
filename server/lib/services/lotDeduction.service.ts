import { connectToDB } from "../mongoose";
import IngredientLot from "../models/ingredientLot.model";
import Ingredient from "../models/ingredient.model";
import { IngredientRequirement } from "./ingredientStockCalculation.service";

export interface LotUsageInfo {
  lotId: string; // MongoDB _id
  lotNumber: string; // "LOT-0001"
  ingredientId: string;
  ingredientName: string;
  quantityUsed: number;
  unit: string;
  expiryDate: Date;
  deductedAt: Date;
  status: "fully_used" | "partially_used";
}

export interface LotDeductionResult {
  success: boolean;
  lotsUsed: LotUsageInfo[];
  errors: string[];
}

export class LotDeductionService {
  /**
   * Find lots to use for an ingredient using FEFO (First Expired First Out)
   * If expiry dates are the same, use FIFO (First In First Out) based on purchase date
   */
  async findLotsToUse(
    ingredientId: string,
    requiredQuantity: number
  ): Promise<{
    lots: any[];
    totalAvailable: number;
  }> {
    await connectToDB();

    // Find all active lots for this ingredient (currentStock > 0, not expired)
    const now = new Date();
    const activeLots = await IngredientLot.find({
      ingredient: ingredientId,
      currentStock: { $gt: 0 },
      expiryDate: { $gt: now }, // Not expired
    })
      .populate("ingredient", "name unit")
      .sort({ expiryDate: 1, purchaseDate: 1 }); // FEFO: Sort by expiry (ascending), then purchase date (ascending)

    const totalAvailable = activeLots.reduce(
      (sum, lot) => sum + lot.currentStock,
      0
    );

    return {
      lots: activeLots,
      totalAvailable,
    };
  }

  /**
   * Deduct stock from lots using FEFO logic
   * Returns information about which lots were used
   */
  async deductFromLots(
    requirements: IngredientRequirement[]
  ): Promise<LotDeductionResult> {
    await connectToDB();

    const lotsUsed: LotUsageInfo[] = [];
    const errors: string[] = [];

    // Check if all ingredients are sufficient first
    const allSufficient = requirements.every((r) => r.isSufficient);

    if (!allSufficient) {
      return {
        success: false,
        lotsUsed: [],
        errors: ["Cannot deduct stock: insufficient ingredients"],
      };
    }

    // Process each ingredient requirement
    for (const requirement of requirements) {
      try {
        const ingredient = await Ingredient.findById(requirement.ingredientId);

        if (!ingredient) {
          errors.push(`Ingredient "${requirement.ingredientName}" not found`);
          continue;
        }

        // Find lots to use (FEFO)
        const { lots: availableLots, totalAvailable } =
          await this.findLotsToUse(
            requirement.ingredientId,
            requirement.requiredQuantity
          );

        if (totalAvailable < requirement.requiredQuantity) {
          errors.push(
            `Insufficient stock for ${requirement.ingredientName}. Required: ${requirement.requiredQuantity} ${requirement.unit}, Available: ${totalAvailable} ${requirement.unit}`
          );
          continue;
        }

        // Deduct from lots (FEFO order)
        let remainingToDeduct = requirement.requiredQuantity;
        const deductedAt = new Date();

        for (const lot of availableLots) {
          if (remainingToDeduct <= 0) break;

          const quantityToDeduct = Math.min(remainingToDeduct, lot.currentStock);
          const wasFullyUsed = lot.currentStock === quantityToDeduct;

          // Update lot stock
          lot.currentStock -= quantityToDeduct;
          await lot.save();

          // Track lot usage
          lotsUsed.push({
            lotId: lot._id.toString(),
            lotNumber: lot.lotId,
            ingredientId: requirement.ingredientId,
            ingredientName: requirement.ingredientName,
            quantityUsed: quantityToDeduct,
            unit: requirement.unit,
            expiryDate: lot.expiryDate,
            deductedAt,
            status: wasFullyUsed ? "fully_used" : "partially_used",
          });

          remainingToDeduct -= quantityToDeduct;

          console.log(
            `✅ Deducted ${quantityToDeduct} ${requirement.unit} from ${lot.lotId} (${requirement.ingredientName}). Remaining in lot: ${lot.currentStock} ${requirement.unit}`
          );
        }

        // Sync ingredient aggregate stock
        await this.syncIngredientStock(requirement.ingredientId);
      } catch (error: any) {
        console.error(
          `❌ Error deducting lots for ${requirement.ingredientName}:`,
          error
        );
        errors.push(
          `Failed to deduct lots for ${requirement.ingredientName}: ${error.message}`
        );
      }
    }

    return {
      success: errors.length === 0,
      lotsUsed,
      errors,
    };
  }

  /**
   * Sync ingredient aggregate stock with sum of all lot stocks
   */
  async syncIngredientStock(ingredientId: string): Promise<void> {
    await connectToDB();

    const lots = await IngredientLot.find({ ingredient: ingredientId });
    const totalStock = lots.reduce((sum, lot) => sum + lot.currentStock, 0);

    await Ingredient.findByIdAndUpdate(ingredientId, {
      currentStock: totalStock,
    });

    console.log(
      `✅ Synced ingredient stock: ${ingredientId} = ${totalStock} (sum of ${lots.length} lots)`
    );
  }

  /**
   * Get recommended lots for an ingredient (for bake sheet)
   * Returns lots sorted by expiry (FEFO) with availability info
   */
  async getRecommendedLots(
    ingredientId: string,
    requiredQuantity: number
  ): Promise<{
    lots: Array<{
      lotId: string;
      lotNumber: string;
      currentStock: number;
      expiryDate: Date;
      purchaseDate?: Date;
      isExpiringSoon: boolean; // Within 7 days
      isExpired: boolean;
    }>;
    totalAvailable: number;
    isSufficient: boolean;
  }> {
    await connectToDB();

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const lots = await IngredientLot.find({
      ingredient: ingredientId,
      currentStock: { $gt: 0 },
    })
      .sort({ expiryDate: 1, purchaseDate: 1 }) // FEFO
      .lean();

    const totalAvailable = lots.reduce((sum: number, lot: any) => sum + lot.currentStock, 0);

    const recommendedLots = lots.map((lot: any) => ({
      lotId: lot._id.toString(),
      lotNumber: lot.lotId,
      currentStock: lot.currentStock,
      expiryDate: lot.expiryDate,
      purchaseDate: lot.purchaseDate,
      isExpiringSoon:
        lot.expiryDate <= sevenDaysFromNow && lot.expiryDate > now,
      isExpired: lot.expiryDate <= now,
    }));

    return {
      lots: recommendedLots,
      totalAvailable,
      isSufficient: totalAvailable >= requiredQuantity,
    };
  }
}
