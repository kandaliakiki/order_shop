import React from "react";
import CustomerFetchedProductCard from "./CustomerFetchedProductCard";

const ProductListGridView = () => {
  return (
    <div
      className="grid gap-5 w-full min-w-[1500px] 
                   grid-cols-6"
    >
      <CustomerFetchedProductCard />
      {/* Add more FetchedProductCard components as needed */}
    </div>
  );
};

export default ProductListGridView;
