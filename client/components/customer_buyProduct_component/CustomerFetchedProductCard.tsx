import React, { useEffect, useState } from "react";
import { Product, useProducts } from "../product_component/ProductContext";
import CustomerProductCard from "./CustomerProductCard";

const FetchedProductCard = () => {
  const { products } = useProducts(); // Use the context to get products

  return (
    <>
      {products.map((product: Product) => (
        <CustomerProductCard
          productId={product.productId}
          key={product.name}
          _id={product._id}
          category={product.category}
          name={product.name}
          price={product.price}
          imageUrl={product.imageUrl}
        />
      ))}
    </>
  );
};

export default FetchedProductCard;
