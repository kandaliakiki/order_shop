import ProductCategory from "@/components/product_component/ProductCategory";
import ProductHeader from "@/components/product_component/ProductHeader";
import ProductList from "@/components/product_component/ProductList";
import React from "react";

const page = () => {
  return (
    <div className="flex  ">
      <ProductCategory></ProductCategory>

      <div className="w-full  px-5 flex flex-col  ">
        <div className="flex justify-between items-center mt-5">
          <h1 className="text-3xl  ">Manage Products</h1>
          <ProductHeader></ProductHeader>
        </div>
        <ProductList></ProductList>
      </div>
    </div>
  );
};

export default page;
