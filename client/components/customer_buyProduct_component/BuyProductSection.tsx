"use client";

import React from "react";
import { CartProvider } from "./CartContext";
import BuyProductSectionDesktop from "./BuyProductSectionDesktop";
import BuyProductSectionMobile from "./BuyProductSectionMobile";
import { CategoryProvider } from "../product_component/CategoryContext";
import { ProductProvider } from "../product_component/ProductContext";

const BuyProductSection = () => {
  return (
    <CartProvider>
      <CategoryProvider>
        <ProductProvider>
          <BuyProductSectionDesktop></BuyProductSectionDesktop>
          <BuyProductSectionMobile></BuyProductSectionMobile>
        </ProductProvider>
      </CategoryProvider>
    </CartProvider>
  );
};

export default BuyProductSection;
