import React, { useState, useEffect } from "react";
import CategoryCard from "./CategoryCard";
import { useCategories } from "./CategoryContext";

const CategoryList = ({ isAdmin }: { isAdmin: boolean }) => {
  const { categories, getProductCountByCategoryId } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredCategories, setFilteredCategories] = useState(categories);

  useEffect(() => {
    const storedCategory = localStorage.getItem("selectedCategory");
    if (storedCategory) {
      setSelectedCategory(storedCategory);
    }
    window.addEventListener("clearSelectedCategory", () => {
      setSelectedCategory("");
      // ...
    });
    window.addEventListener("updateSelectedCategory", () => {
      setSelectedCategory(localStorage.getItem("selectedCategory"));
      // ...
    });

    const fetchFilteredCategories = async () => {
      if (!isAdmin) {
        const categoryCounts = await Promise.all(
          categories.map(category => getProductCountByCategoryId(category._id))
        );
        const filtered = categories.filter((_, index) => categoryCounts[index] > 0);
        setFilteredCategories(filtered);
      } else {
        setFilteredCategories(categories);
      }
    };

    fetchFilteredCategories();
  }, [categories, isAdmin]);

  return (
    <div className="overflow-y-scroll h-screen scrollbar-hide mb-24">
      <CategoryCard
        _id=""
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
