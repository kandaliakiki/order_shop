import React, { useState, useEffect } from "react";
import CategoryCard from "./CategoryCard";
import { useCategories } from "./CategoryContext";
import useCategorySelection from "./useCategorySelection";

const CategoryList = ({ isAdmin }: { isAdmin: boolean }) => {
  const {
    selectedCategory,
    setSelectedCategory,
    filteredCategories,
    getProductCountByCategoryId,
  } = useCategorySelection(isAdmin);

  return (
    <div className="overflow-y-scroll h-screen scrollbar-hide mb-24">
      <CategoryCard
        _id="all"
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        imageUrl=""
        name="All Categories"
        getProductCountByCategoryId={getProductCountByCategoryId}
      ></CategoryCard>
      {filteredCategories.map((category, index) => (
        <CategoryCard
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          key={index}
          _id={category._id}
          imageUrl={category.imageUrl}
          name={category.name}
          getProductCountByCategoryId={getProductCountByCategoryId}
        ></CategoryCard>
      ))}
    </div>
  );
};

export default CategoryList;
