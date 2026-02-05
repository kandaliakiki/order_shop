import Image from "next/image";
import React from "react";
import { useProducts } from "./ProductContext";

const ProductSearch = () => {
  const { handleSearchChange, searchText } = useProducts();
  return (
    <form
      className="search_input flex items-center flex-1 gap-3 max-md:py-2  max-md:w-10/12 max-md:shadow-none"
      onSubmit={(e) => e.preventDefault()}
    >
      <Image
        src="/assets/search.svg"
        alt="search logo"
        width={20}
        height={20}
        className="max-md:w-4 max-md:h-4 dark:hidden"
      ></Image>
      <Image
        src="/assets/search-white.svg"
        alt="search logo"
        width={20}
        height={20}
        className="max-md:w-4 max-md:h-4 hidden dark:block"
      ></Image>
      <input
        value={searchText}
        type="text"
        placeholder="Search Products"
        className="focus:outline-none focus:ring-0 max-md:text-sm"
        onChange={handleSearchChange}
      ></input>
    </form>
  );
};

export default ProductSearch;
