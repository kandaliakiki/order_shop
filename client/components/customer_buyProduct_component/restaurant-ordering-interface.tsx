"use client";

import { useState } from "react";
import {
  ShoppingCart,
  Home,
  MenuIcon,
  History,
  Gift,
  Settings,
  Search,
  PlusCircle,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function RestaurantOrderingInterface() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Burger");
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Double Burger",
      quantity: 2,
      price: 10.99,
      extras: ["Extra Sauce"],
    },
    {
      id: 2,
      name: "Special Black Burger",
      quantity: 1,
      price: 7.39,
      extras: ["Without Cheese"],
    },
    {
      id: 3,
      name: "Spicy Burger",
      quantity: 1,
      price: 5.99,
      extras: ["Extra Sauce"],
    },
  ]);

  const categories = [
    { id: "burger", name: "Burger", icon: "🍔" },
    { id: "noodles", name: "Noodles", icon: "🍜" },
    { id: "drinks", name: "Drinks", icon: "🥤" },
    { id: "desserts", name: "Desserts", icon: "🍰" },
  ];

  const menuItems = [
    {
      id: 1,
      name: "Original Burger",
      price: 5.99,
      category: "Burger",
      items: 11,
    },
    {
      id: 2,
      name: "Double Burger",
      price: 10.99,
      category: "Burger",
      items: 11,
    },
    { id: 3, name: "Cheese Burger", price: 6.99, category: "Burger", items: 9 },
    {
      id: 4,
      name: "Double Cheese Burger",
      price: 12.99,
      category: "Burger",
      items: 11,
    },
    { id: 5, name: "Spicy Burger", price: 5.99, category: "Burger", items: 11 },
    {
      id: 6,
      name: "Special Black Burger",
      price: 7.39,
      category: "Burger",
      items: 11,
    },
    {
      id: 7,
      name: "Spicy Cheese Burger",
      price: 8.0,
      category: "Burger",
      items: 9,
    },
    {
      id: 8,
      name: "Jumbo Cheese Burger",
      price: 15.99,
      category: "Burger",
      items: 11,
    },
  ];

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

  const addToCart = (item: any) => {
    // Check if item is already in cart
    const existingItemIndex = cartItems.findIndex(
      (cartItem) => cartItem.id === item.id
    );

    if (existingItemIndex >= 0) {
      // Item exists, increase quantity
      const updatedCartItems = [...cartItems];
      updatedCartItems[existingItemIndex].quantity += 1;
      setCartItems(updatedCartItems);
    } else {
      // Item doesn't exist, add new item
      setCartItems([...cartItems, { ...item, quantity: 1, extras: [] }]);
    }
  };

  const decreaseQuantity = (itemId: any) => {
    const existingItemIndex = cartItems.findIndex((item) => item.id === itemId);

    if (existingItemIndex >= 0) {
      const updatedCartItems = [...cartItems];
      if (updatedCartItems[existingItemIndex].quantity > 1) {
        // Decrease quantity if more than 1
        updatedCartItems[existingItemIndex].quantity -= 1;
        setCartItems(updatedCartItems);
      } else {
        // Remove item if quantity is 1
        removeFromCart(itemId);
      }
    }
  };

  const removeFromCart = (itemId: any) => {
    setCartItems(cartItems.filter((item) => item.id !== itemId));
  };

  const getItemQuantityInCart = (itemId: any) => {
    const item = cartItems.find((item) => item.id === itemId);
    return item ? item.quantity : 0;
  };

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div className="flex h-screen bg-zinc-900 text-white">
      {/* Left Sidebar */}
      <div className="w-16 bg-zinc-800 flex flex-col items-center py-4">
        <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center mb-8">
          <span className="text-white text-xs font-bold">PF</span>
        </div>

        <div className="flex flex-col items-center gap-8 mt-4">
          <button className="w-12 h-12 flex flex-col items-center justify-center text-xs bg-red-500 rounded-lg">
            <Home className="w-5 h-5 mb-1" />
            <span>Home</span>
          </button>

          <button className="w-12 h-12 flex flex-col items-center justify-center text-xs text-zinc-400">
            <MenuIcon className="w-5 h-5 mb-1" />
            <span>Menu</span>
          </button>

          <button className="w-12 h-12 flex flex-col items-center justify-center text-xs text-zinc-400">
            <History className="w-5 h-5 mb-1" />
            <span>History</span>
          </button>

          <button className="w-12 h-12 flex flex-col items-center justify-center text-xs text-zinc-400">
            <Gift className="w-5 h-5 mb-1" />
            <span>Promos</span>
          </button>

          <button className="w-12 h-12 flex flex-col items-center justify-center text-xs text-zinc-400">
            <Settings className="w-5 h-5 mb-1" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Pakecho Restaurant</h1>
            <p className="text-zinc-400 text-sm">August 23, 2023</p>
          </div>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400"
              size={18}
            />
            <Input
              className="w-64 bg-zinc-800 border-none pl-10 text-zinc-300"
              placeholder="Search menu here..."
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-4 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.name)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-full",
                activeCategory === category.name ? "bg-red-500" : "bg-zinc-800"
              )}
            >
              <span className="text-xl">{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-4 gap-4">
          {menuItems.map((item) => {
            const quantityInCart = getItemQuantityInCart(item.id);

            return (
              <div
                key={item.id}
                className="bg-zinc-800 rounded-xl overflow-hidden"
              >
                <div className="h-32 bg-zinc-700 relative">
                  <Image
                    src={`/placeholder.svg?height=128&width=256&text=${item.name}`}
                    alt={item.name}
                    width={256}
                    height={128}
                    className="w-full h-full object-cover"
                  />

                  {/* Add to Cart Controls */}
                  <div className="absolute bottom-3 right-3">
                    {quantityInCart === 0 ? (
                      <button
                        onClick={() => addToCart(item)}
                        className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                        aria-label={`Add ${item.name} to cart`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="flex items-center bg-red-500 rounded-full h-8 px-1 shadow-md">
                        <button
                          onClick={() => decreaseQuantity(item.id)}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          {quantityInCart === 1 ? (
                            <Trash2 className="w-3 h-3" />
                          ) : (
                            <Minus className="w-3 h-3" />
                          )}
                        </button>

                        <span className="w-6 text-center text-xs font-bold">
                          {quantityInCart}
                        </span>

                        <button
                          onClick={() => addToCart(item)}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium mb-1">{item.name}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-red-500 font-bold">
                      ${item.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {item.items} items
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
            <Button variant="outline" size="sm" className="text-xs">
              Add-On
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-zinc-400">
                <ShoppingCart className="w-12 h-12 mb-2 opacity-50" />
                <p>Your cart is empty</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
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

                    {item.extras.map((extra, index) => (
                      <div
                        key={index}
                        className="flex items-center text-sm text-zinc-400 mt-1"
                      >
                        <PlusCircle className="w-3 h-3 mr-1" />
                        <span>{extra}</span>
                      </div>
                    ))}

                    {/* Quantity Controls in Cart */}
                    <div className="flex items-center mt-2">
                      <div className="flex items-center bg-zinc-700 rounded-full h-7 px-1">
                        <button
                          onClick={() => decreaseQuantity(item.id)}
                          className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-zinc-600 transition-colors"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          {item.quantity === 1 ? (
                            <Trash2 className="w-3 h-3" />
                          ) : (
                            <Minus className="w-3 h-3" />
                          )}
                        </button>

                        <span className="w-5 text-center text-xs font-bold">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => addToCart(item)}
                          className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-zinc-600 transition-colors"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-2 text-zinc-400 hover:text-red-500 transition-colors"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Trash2 className="w-4 h-4" />
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
            <Button
              className="w-full bg-red-500 hover:bg-red-600"
              disabled={cartItems.length === 0}
            >
              Print bills
            </Button>
          </div>
        </div>
      </div>

      {/* Cart Button (Fixed Position) - Only visible when cart is closed */}
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
}
