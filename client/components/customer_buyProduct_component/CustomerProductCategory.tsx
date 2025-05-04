"use client";

import React from "react";
import { CategoryProvider } from "../product_component/CategoryContext";
import CategoryAddModalButton from "../product_component/CategoryAddModalButton";
import CategoryList from "../product_component/CategoryList";


const ProductCategorySection = () => {
  return (
    <CategoryProvider>
      <div className="relative w-1/4 h-screen bg-gray-200 -ml-6 overflow-hidden ">
        <div className="flex flex-col justify-center mt-5 px-5  h-full ">
          <h1 className="text-2xl font-bold mb-5">Product Category</h1>
          <CategoryList isAdmin={false} />
        </div>
   
      </div>
    </CategoryProvider>
  );
};

export default ProductCategorySection;
