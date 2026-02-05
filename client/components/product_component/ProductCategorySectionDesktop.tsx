"use client";

import React from "react";

import CategoryList from "./CategoryList";
import CategoryAddModalButton from "./CategoryAddModalButton";
import { CategoryProvider } from "./CategoryContext";

const ProductCategorySectionDesktop = () => {
  return (
    <CategoryProvider>
      <div className="relative w-1/4 h-screen bg-gray-200 dark:bg-gray-800 -ml-6 overflow-hidden max-lg:hidden">
        <div className="flex flex-col justify-center mt-5 px-5 h-full">
          <h1 className="text-2xl font-bold mb-5 dark:text-white">Product Category</h1>
          <CategoryList isAdmin={true} />
        </div>
        <div className="absolute bottom-0 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 h-20 rounded-md shadow-lg flex justify-center items-center">
          <CategoryAddModalButton />
        </div>
      </div>
    </CategoryProvider>
  );
};

export default ProductCategorySectionDesktop;
