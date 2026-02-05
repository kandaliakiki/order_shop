import ProductCategorySectionDesktop from "@/components/product_component/ProductCategorySectionDesktop";
import ProductHeader from "@/components/product_component/ProductHeader";
import ProductList from "@/components/product_component/ProductList";
import ProductSection from "@/components/product_component/ProductSection";
import React from "react";

const page = () => {
  return (
    <div className="flex max-lg:flex-col p-3 md:p-5 md:px-2">
      <ProductCategorySectionDesktop></ProductCategorySectionDesktop>
      <ProductSection></ProductSection>
    </div>
  );
};

export default page;
