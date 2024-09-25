import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { Product, useProducts } from "./ProductContext"; // Import the context hook

const FetchedProductCard = () => {
  const { products } = useProducts(); // Use the context to get products

  return (
    <>
      {products.map((product: Product) => (
        <ProductCard
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
