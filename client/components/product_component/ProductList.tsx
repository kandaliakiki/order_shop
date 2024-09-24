"use client";

import React, { useState } from "react";
import ProductAddModalButton from "./ProductAddModalButton";
import FetchedProduct from "./FetchedProduct";
import ProductListHeader from "./ProductListHeader";
import Image from "next/image";
import ProductListGridView from "./ProductListGridView";
import ProductListTableView from "./ProductListTableView";

const ProductList = () => {
  const [isGrid, setIsGrid] = useState(true);
  return (
    <div className=" flex flex-col h-[90vh] overflow-hidden  ">
      <div className="bg-gray-200  rounded-lg px-10 pt-3 mt-5 h-full pb-5  overflow-y-scroll scrollbar-hide  ">
        <ProductListHeader />
        {isGrid ? <ProductListGridView /> : <ProductListTableView />}
      </div>
    </div>
  );
};

export default ProductList;
