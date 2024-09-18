import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { Product, useProducts } from "./ProductContext"; // Import the context hook

const FetchedProduct = () => {
  const { products } = useProducts(); // Use the context to get products
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // useEffect(() => {
  //   const storedCategory = localStorage.getItem("selectedCategory");
  //   if (storedCategory) {
  //     setSelectedCategory(storedCategory);
  //   }

  //   const handleStorageChange = (event: StorageEvent) => {
  //     if (event.key === "selectedCategory") {
  //       setSelectedCategory(event.newValue);
  //     }
  //   };

  //   window.addEventListener("storage", handleStorageChange);

  //   return () => {
  //     window.removeEventListener("storage", handleStorageChange);
  //   };
  // }, []);

  return (
    <>
      {products.map((product: Product) => (
        <ProductCard
          selectedCategory={selectedCategory}
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

export default FetchedProduct;
