"use client";

import React from "react";

import ProductAddModalButton from "./ProductAddModalButton";
import FetchedProduct from "./FetchedProduct";
import { ProductProvider } from "./ProductContext";
import { CategoryProvider } from "./CategoryContext";
import ProductListHeader from "./ProductListHeader";

const ProductList = () => {
  return (
    <div className=" flex flex-col h-[90vh] overflow-hidden  ">
      <div className="bg-gray-200  rounded-lg px-10 pt-3 mt-5 h-full pb-5  overflow-y-scroll scrollbar-hide  ">
        <CategoryProvider>
          <ProductProvider>
            <ProductListHeader />
            <div className="grid grid-cols-6 gap-5  ">
              <ProductAddModalButton></ProductAddModalButton>
              <FetchedProduct></FetchedProduct>
            </div>
          </ProductProvider>
        </CategoryProvider>
      </div>
    </div>
  );
};

export default ProductList;
