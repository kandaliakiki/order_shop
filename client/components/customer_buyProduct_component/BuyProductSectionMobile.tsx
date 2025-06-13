import React from "react";
import CustomerProductCategory from "./CustomerProductCategory";
import CustomerProductSection from "./CustomerProductSection";
import CartItemSection from "./CartItemSection";
import MobileHeader from "../layout_components/MobileHeader";
import CategoryGridMobile from "../product_component/CategoryGridMobile";
import CustomerProductSearch from "./CustomerProductSearch";
import CustomerProductList from "./CustomerProductList";

const BuyProductSectionDesktop = () => {
  return (
    <div className="max-lg:block hidden  ">
      <div className="bg-white">
        <MobileHeader title="Choose Products" isAdmin={false}></MobileHeader>
        <div className="md:px-4 pb-2">
          <CategoryGridMobile></CategoryGridMobile>
          <CustomerProductSearch />
        </div>
      </div>
      <CustomerProductList></CustomerProductList>
      <CartItemSection></CartItemSection>
    </div>
  );
};

export default BuyProductSectionDesktop;
