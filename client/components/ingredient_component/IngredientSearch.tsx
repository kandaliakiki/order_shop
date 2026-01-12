import Image from "next/image";
import React from "react";
import { useIngredients } from "./IngredientContext";

const IngredientSearch = () => {
  const { searchText, setSearchText } = useIngredients();
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
        className="max-md:w-4 max-md:h-4 "
      ></Image>
      <input
        value={searchText}
        type="text"
        placeholder="Search Ingredients"
        className="focus:outline-none focus:ring-0 max-md:text-sm"
        onChange={(e) => setSearchText(e.target.value)}
      ></input>
    </form>
  );
};

export default IngredientSearch;

