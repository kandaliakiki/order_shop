"use client";

import React, { useState } from "react";

import ProductListHeader from "./ProductListHeader";

import ProductListGridView from "./ProductListGridView";
import ProductListTableView from "./ProductListTableView";
import { useProducts } from "./ProductContext";

const ProductList = () => {
  const { isGridView } = useProducts();
  return (
    <div className=" flex flex-col h-[90vh] overflow-hidden  ">
      <div className="bg-gray-200  rounded-lg px-10 pt-3 mt-5 h-full pb-5  overflow-y-scroll scrollbar-hide  ">
        <ProductListHeader />
        {isGridView ? <ProductListGridView /> : <ProductListTableView />}
      </div>
    </div>
  );
};

export default ProductList;
