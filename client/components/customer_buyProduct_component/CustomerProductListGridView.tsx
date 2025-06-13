import React from "react";
import CustomerFetchedProductCard from "./CustomerFetchedProductCard";

const ProductListGridView = () => {
  return (
    <div className="flex-1 ">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        <CustomerFetchedProductCard />
        {/* Add more FetchedProductCard components as needed */}
      </div>
    </div>
  );
};

export default ProductListGridView;
