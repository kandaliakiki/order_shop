"use client";

import {
  ChevronRight,
  Minus,
  Plus,
  PlusCircle,
  ShoppingCart,
} from "lucide-react";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useCart } from "./CartContext";

const CartItemSection = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartItems, addOne, decreaseOne, updateQuantity } = useCart();

  const openCart = () => {
    setIsCartOpen(true);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div className="text-white">
      {/* Backdrop (only visible when cart is open) */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 z-10" onClick={closeCart} />
      )}

      {/* Order Panel (Sliding) */}
      <div
        className={cn(
          "fixed top-0 right-0 w-80 h-full bg-zinc-800 shadow-lg transition-transform duration-300 ease-in-out z-20",
          isCartOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Close Button (Chevron) - Only visible when cart is open */}
        {isCartOpen && (
          <button
            onClick={closeCart}
            className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
            aria-label="Close order panel"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Order</h2>
              <p className="text-zinc-400 text-sm">Table 31</p>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            {cartItems.map((item) => (
              <div
                key={item.productId}
                className="flex gap-3 mb-4 pb-4 border-b border-zinc-700"
              >
                <div className="w-16 h-16 bg-zinc-700 rounded-lg overflow-hidden">
                  <Image
                    src={`/placeholder.svg?height=64&width=64&text=${item.name.charAt(
                      0
                    )}`}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{item.name}</h3>
                    <span className="font-bold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center mt-2">
                    <button
                      onClick={() => decreaseOne(item.productId)}
                      className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      <Minus className="w-3 h-3 text-white" />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.productId, parseInt(e.target.value))
                      }
                      className="w-12 text-center mx-2 bg-zinc-800 text-white"
                      min="1"
                    />
                    <button
                      onClick={() => addOne(item.productId)}
                      className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md hover:bg-green-600 transition-colors"
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      <Plus className="w-3 h-3 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="mt-4">
            <div className="flex justify-between mb-2">
              <span className="text-zinc-400">Sub Total</span>
              <span className="font-bold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-zinc-400">Tax ( 10% )</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-zinc-700 my-4"></div>
            <div className="flex justify-between mb-6">
              <span>Total</span>
              <span className="font-bold">${total.toFixed(2)}</span>
            </div>
            <Button className="w-full bg-red-500 hover:bg-red-600">
              Print bills
            </Button>
          </div>
        </div>
      </div>

      {!isCartOpen && (
        <button
          onClick={openCart}
          className="fixed bottom-6 right-6 w-14 h-14 bg-red-500 rounded-full flex items-center justify-center shadow-lg z-20"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-white text-red-500 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            {cartItems.reduce((total, item) => total + item.quantity, 0)}
          </span>
        </button>
      )}
    </div>
  );
};

export default CartItemSection;
