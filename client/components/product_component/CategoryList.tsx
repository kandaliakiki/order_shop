import React from "react";
import CategoryCard from "./CategoryCard";
import { bakeryCategories } from "@/constants";
import { useCategories } from "./CategoryContext";

const CategoryList = () => {
  const { categories } = useCategories();
  return (
    <div className="overflow-y-scroll h-screen scrollbar-hide mb-24">
      {/* <CategoryCard count={2} imageUrl="" name="All Categories"></CategoryCard> */}
      {categories.map((category, index) => (
        <CategoryCard
          key={index}
          _id={category._id}
          count={2}
          imageUrl={category.imageUrl}
          name={category.name}
        ></CategoryCard>
      ))}
    </div>
  );
};

export default CategoryList;
