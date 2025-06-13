"use client";

import React from "react";
import { CategoryProvider } from "./CategoryContext";
import { ProductProvider } from "./ProductContext";
import ProductSectionDesktop from "./ProductSectionDesktop";
import ProductSectionMobile from "./ProductSectionMobile";

const ProductSection = () => {
  return (
    <CategoryProvider>
      <ProductProvider>
        <ProductSectionDesktop></ProductSectionDesktop>
        <ProductSectionMobile></ProductSectionMobile>
      </ProductProvider>
    </CategoryProvider>
  );
};

export default ProductSection;
