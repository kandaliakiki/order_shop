import { fetchProducts } from "../actions/product.action";
import { OrderData } from "../models/order.model";

export interface IngredientRequirement {
  ingredientId: string;
  ingredientName: string;
  unit: string;
  requiredQuantity: number; // Total needed for this order
  currentStock: number;
  minimumStock: number;
  isSufficient: boolean;
  shortage: number; // How much is missing (0 if sufficient)
}

export interface StockCalculationResult {
  orderId: string;
  allIngredientsSufficient: boolean;
  requirements: IngredientRequirement[];
  warnings: string[]; // Products without ingredients
}

export class IngredientStockCalculationService {
  /**
   * Calculate ingredient requirements for an order
   */
  async calculateOrderIngredientRequirements(
    order: OrderData
  ): Promise<StockCalculationResult> {
    const requirements: IngredientRequirement[] = [];
    const warnings: string[] = [];
    const ingredientMap = new Map<string, IngredientRequirement>();

    // Get all products from database
    const allProducts = await fetchProducts();

    // Process each order item
    for (const orderItem of order.items) {
      // Find product in database by name
      const product = allProducts.find(
        (p) =>
          p.name.toLowerCase().trim() === orderItem.name.toLowerCase().trim()
      );

      if (!product) {
        warnings.push(`Product "${orderItem.name}" not found in database`);
        continue;
      }

      // Check if product has ingredients
      if (!product.ingredients || product.ingredients.length === 0) {
        warnings.push(
          `Product "${orderItem.name}" has no ingredients configured`
        );
        continue;
      }

      // Calculate ingredient requirements for this product
      for (const productIngredient of product.ingredients) {
        const ingredient = productIngredient.ingredient;
        const ingredientId = ingredient._id.toString();

        // Calculate required quantity: order quantity × ingredient quantity per product
        const requiredQuantity =
          orderItem.quantity * productIngredient.quantity;

        // Check if we already have this ingredient in our map
        if (ingredientMap.has(ingredientId)) {
          // Add to existing requirement
          const existing = ingredientMap.get(ingredientId)!;
          existing.requiredQuantity += requiredQuantity;
        } else {
          // Create new requirement entry
          const requirement: IngredientRequirement = {
            ingredientId,
            ingredientName: ingredient.name,
            unit: productIngredient.unit, // Use unit from product ingredient config
            requiredQuantity,
            currentStock: ingredient.currentStock,
            minimumStock: ingredient.minimumStock,
            isSufficient: false, // Will calculate below (considering reservedStock)
            shortage: 0, // Will calculate below
          };
          ingredientMap.set(ingredientId, requirement);
        }
      }
    }

    // Calculate sufficiency and shortages (considering reservedStock)
    for (const requirement of ingredientMap.values()) {
      // Get fresh ingredient data to check reservedStock
      const freshIngredient = await (await import("../models/ingredient.model")).default.findById(requirement.ingredientId);
      const reservedStock = freshIngredient?.reservedStock || 0;
      const availableStock = requirement.currentStock - reservedStock;
      
      requirement.isSufficient = availableStock >= requirement.requiredQuantity;
      requirement.shortage = requirement.isSufficient
        ? 0
        : requirement.requiredQuantity - availableStock;
      requirements.push(requirement);
    }

    // Sort by shortage (most critical first)
    requirements.sort((a, b) => b.shortage - a.shortage);

    return {
      orderId: order.orderId || "",
      allIngredientsSufficient: requirements.every((r) => r.isSufficient),
      requirements,
      warnings,
    };
  }
}
