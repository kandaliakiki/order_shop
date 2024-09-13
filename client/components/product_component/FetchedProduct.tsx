"use client";

import React from "react";
import ProductCard from "./ProductCard";
import { useProducts } from "./ProductContext"; // Import the context hook

interface Product {
  name: string;
  price: number;
  category: string;
  imageUrl: string; // Optional since it has a default value
}

const FetchedProduct = () => {
  const { products } = useProducts(); // Use the context to get products

  return (
    <>
      {products.map((product: Product) => (
        <ProductCard
          key={product.name}
          category={product.category}
          name={product.name}
          price={product.price}
          imageUrl={product.imageUrl}
        />
      ))}
    </>
  );
};

export default FetchedProduct;
