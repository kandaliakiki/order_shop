import Image from "next/image";
import React, { useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { Product, useProducts } from "../product_component/ProductContext";
import ProductCardDropdown from "../product_component/ProductCardDropdown";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "./CartContext";

const ProductCard: React.FC<Product> = ({
  productId,
  _id,
  category,
  name,
  price,
  imageUrl,
}) => {
  const { addToCart, cartItems, addOne, decreaseOne } = useCart();

  const quantityInCart =
    cartItems.find((item) => item.productId === productId)?.quantity || 0;

  return (
    <div className="w-52 h-72 xl:w-60 xl:h-80 rounded-xl overflow-hidden border-2 bg-white border-gray-300 shadow-lg flex flex-col items-start">
      <div className="w-full h-40 relative">
        <Image
          alt="product image"
          src={imageUrl}
          fill
          className="object-cover "
        />
        <div className="absolute bottom-3 right-3">
          {quantityInCart === 0 ? (
            <button
              onClick={() => addToCart({ productId, name, price, quantity: 1 })}
              className="w-8 h-8 bg-teal-600 border-2 border-slate-400 rounded-full flex items-center justify-center shadow-md hover:bg-teal-700 transition-colors"
              aria-label={`Add ${name} to cart`}
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          ) : (
            <div className="flex items-center bg-teal-600 border-2 border-slate-400 rounded-full h-8 px-1 shadow-md">
              <button
                onClick={() => decreaseOne(productId)}
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
      <div className="p-3">
        <p className="text-gray-500 mt-5">{category.name}</p>
        <p className="text-lg">{name}</p>
        <p className="text-xl mt-5 font-bold">${price}</p>
      </div>
    </div>
  );
};

export default ProductCard;
