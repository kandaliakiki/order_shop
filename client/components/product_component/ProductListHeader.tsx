import React, { useEffect, useState } from "react";
import ProductListControls from "./ProductListControls";
import { useProducts } from "./ProductContext";
import { useCategories } from "./CategoryContext";

const ProductListHeader = () => {
  const { products } = useProducts();
  const { fetchCategoryById } = useCategories();
  const [categoryName, setCategoryName] = useState<string>("All Products");

  useEffect(() => {
    window.addEventListener("updateSelectedCategory", () => {
      // ...
      const selectedCategory = localStorage.getItem("selectedCategory");
      if (selectedCategory && selectedCategory.toLowerCase() !== "all") {
        fetchCategoryById(selectedCategory).then((category) => {
          if (category) {
            setCategoryName(category.name); // Assuming category has a 'name' property
          }
        });
      } else {
        setCategoryName("All Products");
      }
    });
  }, []);

  return (
    <div className="flex justify-between items-center md:py-7 max-md:mb-4">
      <h1 className="text-2xl max-md:text-lg">
        {categoryName} ({products.length})
      </h1>
      <div className="flex gap-2 justify-between items-center">
        <ProductListControls />
      </div>
    </div>
  );
};

export default ProductListHeader;
