"use client";

import React from "react";
import ProductHeader from "./ProductHeader";
import ProductList from "./ProductList";
import { CategoryProvider } from "./CategoryContext";
import { ProductProvider } from "./ProductContext";

const ProductSection = () => {
  return (
    <CategoryProvider>
      <ProductProvider>
        <div className="w-full  px-5 flex flex-col  ">
          <div className="flex justify-between items-center mt-5">
            <h1 className="text-3xl  ">Manage Products</h1>
            <ProductHeader></ProductHeader>
          </div>
          <ProductList></ProductList>
        </div>
      </ProductProvider>
    </CategoryProvider>
  );
};

export default ProductSection;
