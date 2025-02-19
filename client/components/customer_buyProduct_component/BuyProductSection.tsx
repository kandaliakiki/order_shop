"use client";

import React from "react";
import BuyProductForm from "./BuyProductForm";
import { ProductProvider } from "../product_component/ProductContext";

const BuyProductSection = () => {
  return (
    <div>
      <ProductProvider>
        <BuyProductForm></BuyProductForm>
      </ProductProvider>
    </div>
  );
};

export default BuyProductSection;
