import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Product } from "./ProductContext";
import ProductIngredientsBadge from "./ProductIngredientsBadge";
import IngredientStockStatus from "../ingredient_component/IngredientStockStatus";
import { AlertTriangle } from "lucide-react";

interface ProductIngredientsModalProps {
  product: Product;
  trigger?: React.ReactNode;
}

const ProductIngredientsModal = ({
  product,
  trigger,
}: ProductIngredientsModalProps) => {
  const ingredients = (product as any).ingredients || [];

  if (ingredients.length === 0) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <div>
            <ProductIngredientsBadge product={product} />
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ingredients for {product.name}</DialogTitle>
          <DialogDescription>
            View all ingredients required for this product and their stock status.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          {ingredients.map((ing: any, index: number) => {
            const ingredient = ing.ingredient;
            if (!ingredient) return null;

            const isLowStock =
              ingredient.currentStock < ingredient.minimumStock &&
              ingredient.currentStock > 0;
            const isOutOfStock = ingredient.currentStock === 0;

            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  isOutOfStock
                    ? "bg-red-50 border-red-200"
                    : isLowStock
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-base">
                        {ingredient.name}
                      </h4>
                      {(isLowStock || isOutOfStock) && (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-700">
                        <span className="font-medium">Required:</span> {ing.quantity}{" "}
                        {ing.unit}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Available:</span>{" "}
                        {ingredient.currentStock} {ingredient.unit}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Minimum:</span>{" "}
                        {ingredient.minimumStock} {ingredient.unit}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <IngredientStockStatus
                      currentStock={ingredient.currentStock}
                      minimumStock={ingredient.minimumStock}
                    />
                  </div>
                </div>
                {isOutOfStock && (
                  <div className="mt-2 text-xs text-red-600 font-medium">
                    ⚠️ This ingredient is out of stock
                  </div>
                )}
                {isLowStock && !isOutOfStock && (
                  <div className="mt-2 text-xs text-yellow-600 font-medium">
                    ⚠️ This ingredient is low in stock
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductIngredientsModal;

