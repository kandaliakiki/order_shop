"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import ProductAddModalButton from "../product_component/ProductAddModalButton";
import { useProducts } from "../product_component/ProductContext";

const CustomerProductSearch = () => {
  const { handleSearchChange, searchText } = useProducts();

  return (
    <div className="gap-2 p-1 max-md:px-4">
      <form
        className="search_input flex items-center mx-auto gap-3 max-lg:py-2  max-lg:w-10/12 max-lg:shadow-none"
        onSubmit={(e) => e.preventDefault()}
      >
        <Image
          src="/assets/search.svg"
          alt="search logo"
          width={20}
          height={20}
          className="max-lg:w-4 max-lg:h-4 "
        ></Image>
        <input
          value={searchText}
          type="text"
          placeholder="Search Products"
          className="focus:outline-none focus:ring-0 max-lg:text-sm"
          onChange={handleSearchChange}
        ></input>
      </form>
    </div>
  );
};

export default CustomerProductSearch;
