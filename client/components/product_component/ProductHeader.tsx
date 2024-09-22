"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import ProductAddModalButton from "./ProductAddModalButton";
import { useProducts } from "./ProductContext";

const ProductHeader = () => {
  const { handleSearchChange, searchText } = useProducts();

  return (
    <div className="flex items-center gap-2 p-1 ">
      <form
        className="search_input flex flex-1 gap-3"
        onSubmit={(e) => e.preventDefault()}
      >
        <Image
          src="/assets/search.svg"
          alt="search logo"
          width={20}
          height={20}
        ></Image>
        <input
          value={searchText}
          type="text"
          placeholder="Search Products"
          className="focus:outline-none focus:ring-0"
          onChange={handleSearchChange}
        ></input>
      </form>
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
