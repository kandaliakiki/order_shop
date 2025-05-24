import ProductCategorySection from "@/components/product_component/ProductCategory";
import ProductCategory from "@/components/product_component/ProductCategory";
import ProductHeader from "@/components/product_component/ProductHeader";
import ProductList from "@/components/product_component/ProductList";
import ProductSection from "@/components/product_component/ProductSection";
import React from "react";

const page = () => {
  return (
    <div className="flex px-2 sm:px-4  ">
      <ProductCategorySection></ProductCategorySection>
      <ProductSection></ProductSection>
    </div>
  );
};

export default page;
