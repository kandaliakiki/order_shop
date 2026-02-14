import React, { useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { Product, useProducts } from "../product_component/ProductContext";
import ProductImage from "../product_component/ProductImage";
import ProductCardDropdown from "../product_component/ProductCardDropdown";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "./CartContext";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { formatPrice } from "@/constants";

const ProductCard: React.FC<Product> = ({
  productId,
  _id,
  category,
  name,
  price,
  imageUrl,
}) => {
  const { addToCart, cartItems, addOne, decreaseOne, removeFromCart } =
    useCart();

  const quantityInCart =
    cartItems.find((item) => item.productId === productId)?.quantity || 0;

  const decreaseOneOrRemove = (productId: string) => {
    if (quantityInCart === 1) {
      removeFromCart(productId);
    } else {
      decreaseOne(productId);
    }
  };

  return (
    <Card key={productId} className="overflow-hidden">
      <div className="relative">
        <div className="aspect-square w-full overflow-hidden">
          <ProductImage
            imageUrl={imageUrl}
            alt={name}
            width={300}
            height={300}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute bottom-3 right-3">
          {quantityInCart === 0 ? (
            <button
              onClick={() =>
                addToCart({ productId, name, price, imageUrl, quantity: 1 })
              }
              className="w-8 h-8 bg-teal-600 border-2 border-slate-400 rounded-full flex items-center justify-center shadow-md hover:bg-teal-700 transition-colors"
              aria-label={`Add ${name} to cart`}
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          ) : (
            <div className="flex items-center bg-teal-600 border-2 border-slate-400 rounded-full h-8 px-1 shadow-md">
              <button
                onClick={() => decreaseOneOrRemove(productId)}
                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-teal-700 transition-colors"
                aria-label={`Decrease quantity of ${name}`}
              >
                {quantityInCart === 1 ? (
                  <Trash2 className="w-3 h-3 text-white" />
                ) : (
                  <Minus className="w-3 h-3 text-white" />
                )}
              </button>

              <span className="w-6 text-center text-xs font-bold">
                {quantityInCart}
              </span>

              <button
                onClick={() => addOne(productId)}
                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-teal-700 transition-colors"
                aria-label={`Increase quantity of ${name}`}
              >
                <Plus className="w-3 h-3 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>
      <CardContent className="p-3">
        <div className="text-xs text-gray-500">{category.name}</div>
        <div className="font-medium">{name}</div>
        <div className="mt-1 text-lg font-bold">{formatPrice(price)}</div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
