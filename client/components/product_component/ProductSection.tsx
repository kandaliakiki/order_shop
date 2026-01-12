"use client";

import React from "react";
import { CategoryProvider } from "./CategoryContext";
import { ProductProvider } from "./ProductContext";
import { IngredientProvider } from "../ingredient_component/IngredientContext";
import ProductSectionDesktop from "./ProductSectionDesktop";
import ProductSectionMobile from "./ProductSectionMobile";

const ProductSection = () => {
  return (
    <CategoryProvider>
      <IngredientProvider>
        <ProductProvider>
          <ProductSectionDesktop></ProductSectionDesktop>
          <ProductSectionMobile></ProductSectionMobile>
        </ProductProvider>
      </IngredientProvider>
    </CategoryProvider>
  );
};

export default ProductSection;
