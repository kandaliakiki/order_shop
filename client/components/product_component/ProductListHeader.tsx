import React from "react";
import ProductListControls from "./ProductListControls";
import { useProducts } from "./ProductContext";

const ProductListHeader = () => {
  const { products } = useProducts();
  return (
    <div className="flex justify-between items-center py-7">
      <h1 className="text-2xl">All Products ({products.length})</h1>
      <div className="flex gap-2 justify-between items-center">
        <ProductListControls />
      </div>
    </div>
  );
};

export default ProductListHeader;
