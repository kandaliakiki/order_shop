"use client";

import {
  ChevronRight,
  Minus,
  Plus,
  PlusCircle,
  ShoppingCart,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useCart } from "./CartContext";
import { Input } from "../ui/input";
import CustomerInfoModal from "./CustomerInfoModal";
import { formatPrice } from "@/constants";

const CartItemSection = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const {
    cartItems,
    addOne,
    decreaseOne,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

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

  const decreaseOneOrRemove = (productId: string, quantity: number) => {
    if (quantity === 1) {
      removeFromCart(productId);
    } else {
      decreaseOne(productId);
    }
  };

  const handleFormSubmit = async (data: {
    name: string;
    phoneNumber: string;
  }) => {
    const { name, phoneNumber } = data;

    const orderData = {
      customerName: name,
      phoneNumber,
      items: cartItems,
      subtotal,
      tax,
      total,
      status: "New Order",
      createdAt: new Date(),
    };

    console.log(orderData);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
      const response = await fetch(`${backendUrl}/api/createOrder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const newOrder = await response.json();
      console.log("Order created:", newOrder);
      clearCart(); // Optionally clear the cart after order creation
      setIsOrderModalOpen(false);
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  return (
    <div className="text-white">
      {/* Backdrop (only visible when cart is open) */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 z-10" onClick={closeCart} />
      )}

      {/* Order Panel (Sliding) */}
      <div
        className={cn(
          "fixed top-0 right-0 w-80 h-full bg-gray-800 shadow-lg transition-transform duration-300 ease-in-out z-20",
          isCartOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Close Button (Chevron) - Only visible when cart is open */}
        {isCartOpen && (
          <button
            onClick={closeCart}
            className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center shadow-md "
            aria-label="Close order panel"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">Cart</h2>
              <p className="text-zinc-400 text-sm">Your Orders</p>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            {cartItems.length === 0 ? (
              <p className="text-center text-zinc-400 mt-10">
                Nothing in the cart yet. Start adding your favorite items!
              </p>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-3 mb-4 pb-4 border-b border-zinc-700"
                >
                  <div className="w-16 h-16 bg-zinc-700 rounded-lg overflow-hidden">
                    <Image
                      src={item.imageUrl}
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
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>

                    <div className="flex items-center mt-2">
                      <button
                        onClick={() =>
                          decreaseOneOrRemove(item.productId, item.quantity)
                        }
                        className="w-6 h-6 bg-rose-600 rounded-full flex items-center justify-center shadow-md hover:bg-rose-900 transition-colors"
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        <Minus className="w-4 h-4 text-white   " />
                      </button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            item.productId,
                            parseInt(e.target.value)
                          )
                        }
                        className="w-12 text-center mx-2 bg-black text-white flex items-center justify-center cart_input  "
                        min="1"
                      />
                      <button
                        onClick={() => addOne(item.productId)}
                        className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center shadow-md hover:bg-teal-700 transition-colors"
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        <Plus className="w-4 h-4 text-white " />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Order Summary */}
          <div className="mt-4">
            <div className="flex justify-between mb-2">
              <span className="text-zinc-400">Sub Total</span>
              <span className="font-bold">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-zinc-400">Tax ( 10% )</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="border-t border-zinc-700 my-4"></div>
            <div className="flex justify-between mb-6">
              <span>Total</span>
              <span className="font-bold">{formatPrice(total)}</span>
            </div>
            <Button
              className="w-full bg-teal-600 hover:bg-teal-700"
              onClick={() => setIsOrderModalOpen(true)}
              disabled={cartItems.length === 0}
            >
              Order
            </Button>
          </div>
        </div>
      </div>

      {!isCartOpen && (
        <button
          onClick={openCart}
          className="fixed bottom-6 right-6 w-14 h-14 bg-teal-500 rounded-full flex items-center justify-center shadow-md shadow-teal-700/70 z-20"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-white text-red-500 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            {cartItems.reduce((total, item) => total + item.quantity, 0)}
          </span>
        </button>
      )}

      <CustomerInfoModal
        isOpen={isOrderModalOpen}
        setIsOpen={setIsOrderModalOpen}
        cartItems={cartItems}
        subtotal={subtotal}
        tax={tax}
        total={total}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default CartItemSection;
