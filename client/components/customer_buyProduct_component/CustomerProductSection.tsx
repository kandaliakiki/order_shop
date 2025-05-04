"use client";

import React from "react";
import { CategoryProvider } from "../product_component/CategoryContext";
import ProductHeader from "../product_component/ProductHeader";
import { ProductProvider } from "../product_component/ProductContext";
import ProductList from "../product_component/ProductList";
import CustomerProductList from "./CustomerProductList";

const ProductSection = () => {
  return (
    <CategoryProvider>
      <ProductProvider>
        <div className="  px-5 flex flex-col w-full  ">
          <div className="flex justify-between items-center mt-5">
            <h1 className="text-3xl  ">Manage Products</h1>
            <ProductHeader></ProductHeader>
          </div>
          <CustomerProductList></CustomerProductList>
        </div>
      </ProductProvider>
    </CategoryProvider>
  );
};

export default ProductSection;
