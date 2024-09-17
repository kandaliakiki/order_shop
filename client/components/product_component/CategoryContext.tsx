import React, { createContext, useContext, useEffect, useState } from "react";

export interface Category {
  _id: string; // Assuming you have an ID field
  name: string;
  imageUrl: string;
}

interface CategoryContextType {
  categories: Category[];
  fetchCategories: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined
);

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

  useEffect(() => {
    fetchCategories(); // Fetch categories on initial load
  }, []);

  return (
    <CategoryContext.Provider value={{ categories, fetchCategories }}>
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
