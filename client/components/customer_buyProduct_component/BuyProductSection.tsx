"use client";

import React from "react";
import BuyProductForm from "./BuyProductForm";
import { ProductProvider } from "../product_component/ProductContext";
import CustomerProductCategory from "./CustomerProductCategory";
import CustomerProductSection from "./CustomerProductSection";
import { RestaurantOrderingInterface } from "./restaurant-ordering-interface";
import CartItemSection from "./CartItemSection";

const BuyProductSection = () => {
  return (
    // <div>
    //   <ProductProvider>
    //     <BuyProductForm></BuyProductForm>
    //   </ProductProvider>
    // </div>

    <div className="flex  ">
      <CustomerProductCategory></CustomerProductCategory>
      <CustomerProductSection></CustomerProductSection>
      <CartItemSection></CartItemSection>
    </div>
  );
};

export default BuyProductSection;
