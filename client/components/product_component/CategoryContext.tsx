import React, { createContext, useContext, useEffect, useState } from "react";

export interface Category {
  _id: string; // Assuming you have an ID field
  name: string;
  imageUrl: string;
}

interface CategoryContextType {
  categories: Category[];
  fetchCategories: () => Promise<void>;
  getProductCountByCategoryId: (categoryId: string) => Promise<number>;
  fetchCategoryById: (id: string) => Promise<Category | null>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined
);

export const setCategoryId = (categoryId: string) => {
  localStorage.setItem("selectedCategory", categoryId);
  window.dispatchEvent(new Event("updateSelectedCategory"));
};

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchCategories = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
    try {
      const response = await fetch(`${backendUrl}/api/categories`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: Category[] = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const getProductCountByCategoryId = async (
    categoryId: string
  ): Promise<number> => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
    try {
      const response = await fetch(
        categoryId
          ? `${backendUrl}/api/products/count/${categoryId}`
          : `${backendUrl}/api/products/count`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data.count;
    } catch (error) {
      console.error("Error fetching product count by category ID:", error);
      throw error;
    }
  };

  const fetchCategoryById = async (id: string): Promise<Category | null> => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
    try {
      const response = await fetch(`${backendUrl}/api/category/${id}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const category: Category = await response.json();
      return category;
    } catch (error) {
      console.error("Failed to fetch category by ID:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchCategories(); // Fetch categories on initial load
    localStorage.setItem("selectedCategory", "");
    window.dispatchEvent(new Event("clearSelectedCategory"));
    window.addEventListener("addedOrDeletedProduct", () => {
      fetchCategories();
      // ...
    });
  }, []);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        fetchCategories,
        getProductCountByCategoryId,
        fetchCategoryById,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategories must be used within a CategoryProvider");
  }
  return context;
};
