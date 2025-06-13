import { useState, useEffect } from "react";
import { useCategories } from "./CategoryContext";

const useCategorySelection = (isAdmin: boolean) => {
  const {
    categories,
    getProductCountByCategoryId,
    fetchCategoryById,
    currentCategory,
    setCurrentCategory,
    ALL_CATEGORIES,
  } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [filteredCategories, setFilteredCategories] = useState(categories);

  useEffect(() => {
    const storedCategory = localStorage.getItem("selectedCategory");
    if (storedCategory) {
      setSelectedCategory(storedCategory);
    }
    window.addEventListener("clearSelectedCategory", () => {
      setSelectedCategory("");
    });
    window.addEventListener("updateSelectedCategory", () => {
      setSelectedCategory(localStorage.getItem("selectedCategory") || "");
    });

    const fetchFilteredCategories = async () => {
      if (!isAdmin) {
        const categoryCounts = await Promise.all(
          categories.map((category) =>
            getProductCountByCategoryId(category._id)
          )
        );
        const filtered = categories.filter(
          (_, index) => categoryCounts[index] > 0
        );
        setFilteredCategories(filtered);
      } else {
        setFilteredCategories(categories);
      }
    };

    fetchFilteredCategories();
  }, [categories, isAdmin]);

  return {
    selectedCategory,
    setSelectedCategory,
    filteredCategories,
    getProductCountByCategoryId,
    fetchCategoryById,
    currentCategory,
    setCurrentCategory,
    ALL_CATEGORIES,
  };
};

export default useCategorySelection;
