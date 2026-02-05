import React from "react";
import ProductHeader from "./ProductHeader";
import ProductList from "./ProductList";

const ProductSectionDesktop = () => {
  return (
    <div className="w-full  px-5 flex flex-col max-md:hidden">
      <div className="flex justify-between items-center mt-5">
        <h1 className="text-3xl dark:text-white">Manage Products</h1>
        <ProductHeader></ProductHeader>
      </div>
      <ProductList></ProductList>
    </div>
  );
};

export default ProductSectionDesktop;
