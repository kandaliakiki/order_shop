import React, { useEffect, useState } from "react";
import { useProducts } from "../product_component/ProductContext";
import { useCategories } from "../product_component/CategoryContext";
import CustomerProductListControls from "./CustomerProductListControls";

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
    <div className="flex justify-between items-center lg:py-7 max-lg:mb-4">
      <h1 className="text-2xl max-lg:text-lg">
        {categoryName} ({products.length})
      </h1>
      <div className="flex gap-2 justify-between items-center">
        <CustomerProductListControls />
      </div>
    </div>
  );
};

export default ProductListHeader;
