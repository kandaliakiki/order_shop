import React from "react";
import { Package, AlertTriangle } from "lucide-react";
import { Badge } from "../ui/badge";
import { Product } from "./ProductContext";

interface ProductIngredientsBadgeProps {
  product: Product;
}

const ProductIngredientsBadge = ({
  product,
}: ProductIngredientsBadgeProps) => {
  const ingredients = (product as any).ingredients || [];
  const ingredientCount = ingredients.length;

  if (ingredientCount === 0) {
    return null;
  }

  // Check stock status of ingredients
  let hasLowStock = false;
  let hasOutOfStock = false;

  ingredients.forEach((ing: any) => {
    const ingredient = ing.ingredient;
    if (ingredient) {
      if (ingredient.currentStock === 0) {
        hasOutOfStock = true;
      } else if (ingredient.currentStock < ingredient.minimumStock) {
        hasLowStock = true;
      }
    }
  });

  // Determine badge style based on stock status
  let badgeClass = "bg-blue-50 text-blue-700 border-blue-200";
  if (hasOutOfStock) {
    badgeClass = "bg-red-50 text-red-700 border-red-200";
  } else if (hasLowStock) {
    badgeClass = "bg-yellow-50 text-yellow-700 border-yellow-200";
  }

  return (
    <Badge
      className={`${badgeClass} border flex items-center gap-1`}
    >
      {hasOutOfStock || hasLowStock ? (
        <AlertTriangle className="h-3 w-3" />
      ) : (
        <Package className="h-3 w-3" />
      )}
      <span className="text-xs font-medium">
        {ingredientCount} {ingredientCount === 1 ? "ingredient" : "ingredients"}
      </span>
    </Badge>
  );
};

export default ProductIngredientsBadge;

