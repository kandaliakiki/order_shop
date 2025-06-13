"use client";

import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import ProductAddModalButton from "./ProductAddModalButton";

import ProductSearch from "./ProductSearch";

const ProductHeader = () => {
  return (
    <div className="flex items-center gap-2 p-1 ">
      <ProductSearch />
      <ProductAddModalButton>
        <Button className="bg-teal-600 hover:bg-teal-700">
          <Image
            src="/assets/add-square.svg"
            alt="add logo"
            width={24}
            height={24}
            className="mr-2"
          ></Image>
          Add New Product{" "}
        </Button>
      </ProductAddModalButton>
    </div>
  );
};

export default ProductHeader;
