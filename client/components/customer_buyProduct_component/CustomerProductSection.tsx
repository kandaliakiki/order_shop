import React from "react";
import CustomerProductList from "./CustomerProductList";
import CustomerProductSearch from "./CustomerProductSearch";

const ProductSection = () => {
  return (
    <div className="  px-5 flex flex-col w-full  ">
      <div className="flex justify-between items-center mt-5">
        <h1 className="text-3xl  ">Choose Products</h1>
        <CustomerProductSearch></CustomerProductSearch>
      </div>
      <CustomerProductList></CustomerProductList>
    </div>
  );
};

export default ProductSection;
