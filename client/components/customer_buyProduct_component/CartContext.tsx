// client/components/cart_component/CartContext.tsx
import React, { createContext, useContext, useState } from "react";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  addOne: (productId: string) => void;
  decreaseOne: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCartItems((prevItems) => {
      return [
        ...prevItems.filter(
          (cartItem) => cartItem.productId !== item.productId
        ),
        { ...item, quantity: 1 },
      ];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((cartItem) => cartItem.productId !== productId)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const addOne = (productId: string) => {
    setCartItems((prevItems) =>
      prevItems.map((cartItem) =>
        cartItem.productId === productId
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      )
    );
  };

  const decreaseOne = (productId: string) => {
    setCartItems((prevItems) =>
      prevItems.map((cartItem) =>
        cartItem.productId === productId && cartItem.quantity > 1
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      )
    );
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCartItems((prevItems) =>
      prevItems.map((cartItem) =>
        cartItem.productId === productId
          ? { ...cartItem, quantity: Math.max(1, quantity) }
          : cartItem
      )
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        addOne,
        decreaseOne,
        updateQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
