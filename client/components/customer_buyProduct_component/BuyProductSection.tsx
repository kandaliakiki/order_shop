"use client";

import React from "react";
import BuyProductForm from "./BuyProductForm";
import { ProductProvider } from "../product_component/ProductContext";
import CustomerProductCategory from "./CustomerProductCategory";
import CustomerProductSection from "./CustomerProductSection";
import { RestaurantOrderingInterface } from "./restaurant-ordering-interface";
import CartItemSection from "./CartItemSection";
import { CartProvider } from "./CartContext";

const BuyProductSection = () => {
  return (
    <div className="flex  ">
      <CartProvider>
        <CustomerProductCategory></CustomerProductCategory>
        <CustomerProductSection></CustomerProductSection>
        <CartItemSection></CartItemSection>
      </CartProvider>
    </div>
  );
};

export default BuyProductSection;
