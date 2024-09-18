import React, { useState, useEffect } from "react";
import CategoryCard from "./CategoryCard";
import { useCategories } from "./CategoryContext";

const CategoryList = () => {
  const { categories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const storedCategory = localStorage.getItem("selectedCategory");
    if (storedCategory) {
      setSelectedCategory(storedCategory);
    }
    window.addEventListener("updateSelectedCategory", () => {
      setSelectedCategory("");
      // ...
    });
  }, []);

  return (
    <div className="overflow-y-scroll h-screen scrollbar-hide mb-24">
      <CategoryCard
        _id=""
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        count={2}
        imageUrl=""
        name="All Categories"
      ></CategoryCard>
      {categories.map((category, index) => (
        <CategoryCard
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
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
