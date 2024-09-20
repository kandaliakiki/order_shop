"use client";

import React, { useState } from "react";
import ProductListControls from "./ProductListControls";
import Image from "next/image";
import ProductCard from "./ProductCard";
import { bakeryIngredients } from "@/constants";
import ProductAddModalButton from "./ProductAddModalButton";
import FetchedProduct from "./FetchedProduct";
import { ProductProvider } from "./ProductContext";
import { CategoryProvider } from "./CategoryContext";
import { Button } from "../ui/button";

const ProductList = () => {
  return (
    <div className=" flex flex-col h-[90vh] overflow-hidden  ">
      <div className="bg-gray-200  rounded-lg px-10 pt-3 mt-5 h-full pb-5  overflow-y-scroll scrollbar-hide  ">
        <CategoryProvider>
          <ProductProvider>
            <div className="flex justify-between items-center py-7">
              <h1 className="text-2xl">All Products (120)</h1>
              <div className="flex gap-2 justify-between items-center">
                <ProductListControls />
              </div>
            </div>
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
