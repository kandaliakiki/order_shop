"use client";

import React from "react";
import ProductAddModalButton from "./ProductAddModalButton";
import FetchedProduct from "./FetchedProduct";
import ProductListHeader from "./ProductListHeader";
import Image from "next/image";

const ProductList = () => {
  return (
    <div className=" flex flex-col h-[90vh] overflow-hidden  ">
      <div className="bg-gray-200  rounded-lg px-10 pt-3 mt-5 h-full pb-5  overflow-y-scroll scrollbar-hide  ">
        <ProductListHeader />
        <div className="grid grid-cols-6 gap-5  ">
          <ProductAddModalButton>
            <div className="rounded-lg aspect-[3/4] outline-dashed outline-teal-600 outline-4  flex flex-col items-center justify-center cursor-pointer">
              <Image
                alt="add new product button"
                src="/assets/add-product.svg"
                height={48}
                width={48}
              ></Image>
              <p className="text-xl">Add New Product</p>
            </div>
          </ProductAddModalButton>
          <FetchedProduct></FetchedProduct>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
