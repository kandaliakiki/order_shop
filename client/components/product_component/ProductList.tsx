"use client";

import React, { useState } from "react";

import ProductListHeader from "./ProductListHeader";

import ProductListGridView from "./ProductListGridView";
import ProductListTableView from "./ProductListTableView";
import { useProducts } from "./ProductContext";
import CategoryGridMobile from "./CategoryGridMobile";
import CategoryAddModalButton from "./CategoryAddModalButton";

const ProductList = () => {
  const { isGridView } = useProducts();
  return (
    <div className=" flex flex-col h-[90vh] overflow-hidden  ">
      <div className="bg-gray-200  rounded-lg px-10 pt-3 mt-5 h-full pb-5  overflow-y-scroll scrollbar-hidden  ">
        <div className="max-lg:block hidden text-center">
          <CategoryGridMobile></CategoryGridMobile>
          <CategoryAddModalButton />
        </div>
        <ProductListHeader />
        {isGridView ? <ProductListGridView /> : <ProductListTableView />}
      </div>
    </div>
  );
};

export default ProductList;
