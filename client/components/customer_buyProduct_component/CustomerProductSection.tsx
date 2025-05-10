"use client";

import React from "react";
import { CategoryProvider } from "../product_component/CategoryContext";
import { ProductProvider } from "../product_component/ProductContext";
import CustomerProductList from "./CustomerProductList";
import CustomerProductHeader from "./CustomerProductHeader";

const ProductSection = () => {
  return (
    <CategoryProvider>
      <ProductProvider>
        <div className="  px-5 flex flex-col w-full  ">
          <div className="flex justify-between items-center mt-5">
            <h1 className="text-3xl  ">Choose Products</h1>
            <CustomerProductHeader></CustomerProductHeader>
          </div>
          <CustomerProductList></CustomerProductList>
        </div>
      </ProductProvider>
    </CategoryProvider>
  );
};

export default ProductSection;
