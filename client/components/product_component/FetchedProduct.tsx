"use client";

import React from "react";
import ProductCard from "./ProductCard";

interface Product {
  name: string;
  price: number;
  category: string;
  imageUrl: string; // Optional since it has a default value
}

const FetchedProduct = () => {
  const [products, setProducts] = React.useState<Product[]>([]); // Updated to use Product type

  React.useEffect(() => {
    const fetchProducts = async () => {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT; // Your backend URL
      try {
        const response = await fetch(`${backendUrl}/products`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, []);
  return (
    <>
      {products.map(
        (
          product: Product // Specify the type for 'product'
        ) => (
          <ProductCard
            key={product.name}
            category={product.category}
            name={product.name}
            price={product.price}
            imageUrl={product.imageUrl}
          />
        )
      )}
    </>
  );
};

export default FetchedProduct;
