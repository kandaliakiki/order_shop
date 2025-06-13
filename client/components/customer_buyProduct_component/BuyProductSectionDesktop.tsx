import React from "react";
import CustomerProductCategory from "./CustomerProductCategory";
import CustomerProductSection from "./CustomerProductSection";
import CartItemSection from "./CartItemSection";

const BuyProductSectionDesktop = () => {
  return (
    <div className="flex  max-lg:hidden">
      <CustomerProductCategory></CustomerProductCategory>
      <CustomerProductSection></CustomerProductSection>
      <CartItemSection></CartItemSection>
    </div>
  );
};

export default BuyProductSectionDesktop;
