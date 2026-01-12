import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Product } from "./ProductContext";
import ProductIngredientsBadge from "./ProductIngredientsBadge";
import IngredientStockStatus from "../ingredient_component/IngredientStockStatus";

interface ProductIngredientsPopoverProps {
  product: Product;
}

const ProductIngredientsPopover = ({
  product,
}: ProductIngredientsPopoverProps) => {
  const ingredients = (product as any).ingredients || [];

  if (ingredients.length === 0) {
    return (
      <span className="text-xs text-gray-400">No ingredients</span>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="outline-none">
          <ProductIngredientsBadge product={product} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-1">
          <h4 className="font-semibold text-sm mb-3">
            Ingredients for {product.name}
          </h4>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {ingredients.map((ing: any, index: number) => {
              const ingredient = ing.ingredient;
              if (!ingredient) return null;

              return (
                <div
                  key={index}
                  className="py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{ingredient.name}</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {ing.quantity} {ing.unit}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <IngredientStockStatus
                        currentStock={ingredient.currentStock}
                        minimumStock={ingredient.minimumStock}
                      />
                      <p className="text-xs text-gray-500">
                        Stock: {ingredient.currentStock} {ingredient.unit}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ProductIngredientsPopover;

