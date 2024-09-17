"use client";

import React from "react";

import CategoryList from "./CategoryList";
import CategoryAddModalButton from "./CategoryAddModalButton";
import { CategoryProvider } from "./CategoryContext";

const ProductCategory = () => {
  return (
    <CategoryProvider>
      <div className="relative w-1/4 h-screen bg-gray-200 -ml-6 overflow-hidden ">
        <div className="flex flex-col justify-center mt-5 px-5  h-full ">
          <h1 className="text-2xl font-bold mb-5">Product Category</h1>
          <CategoryList />
        </div>
        <div className="absolute bottom-0 w-full bg-white border border-gray-200 h-20 rounded-md shadow-lg flex justify-center items-center">
          <CategoryAddModalButton />
        </div>
      </div>
    </CategoryProvider>
  );
};

export default ProductCategory;
