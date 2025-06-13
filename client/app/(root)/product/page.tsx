import ProductCategorySectionDesktop from "@/components/product_component/ProductCategorySectionDesktop";
import ProductHeader from "@/components/product_component/ProductHeader";
import ProductList from "@/components/product_component/ProductList";
import ProductSection from "@/components/product_component/ProductSection";
import React from "react";

const page = () => {
  return (
    <div className="flex max-lg:flex-col  md:px-2   ">
      <ProductCategorySectionDesktop></ProductCategorySectionDesktop>
      <ProductSection></ProductSection>
    </div>
  );
};

export default page;
