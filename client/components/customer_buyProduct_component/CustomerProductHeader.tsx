"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import ProductAddModalButton from "../product_component/ProductAddModalButton";
import { useProducts } from "../product_component/ProductContext";

const ProductHeader = () => {
  const { handleSearchChange, searchText } = useProducts();

  return (
    <div className="flex items-center gap-2 p-1 w-1/4">
      <form
        className="search_input_order flex flex-1 gap-3"
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
    </div>
  );
};

export default ProductHeader;
