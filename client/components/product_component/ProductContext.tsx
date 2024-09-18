import React, { createContext, useContext, useState, useEffect } from "react";
import { Category } from "./CategoryContext";

export interface Product {
  selectedCategory: string | null;
  _id: string; // Changed id to _id
  name: string;
  price: number;
  category: Category;
  imageUrl: string;
}

interface ProductContextType {
  products: Product[];
  fetchProducts: () => Promise<void>; // Added fetchProducts to the context type
  deleteProduct: (id: string) => Promise<void>;
  fetchProductById: (id: string) => Promise<Product | null>;
  fetchProductsByCategoryId: (categoryId: string) => Promise<Product[]>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
    try {
      const response = await fetch(`${backendUrl}/products`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: Product[] = await response.json(); // Now data can be directly assigned
      setProducts(data); // No need for mapping
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const deleteProduct = async (id: string) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
    try {
      const response = await fetch(`${backendUrl}/api/deleteProduct/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete product");
      }
      // Optionally, you can update the state to remove the deleted product
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product._id !== id)
      );
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const fetchProductById = async (id: string): Promise<Product | null> => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
    try {
      const response = await fetch(`${backendUrl}/api/product/${id}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const product: Product = await response.json();
      return product; // Return the fetched product
    } catch (error) {
      console.error("Failed to fetch product by ID:", error);
      return null; // Return null in case of error
    }
  };

  const fetchProductsByCategoryId = async (categoryId: string) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
    try {
      const response = await fetch(
        `${backendUrl}/api/products/category/${categoryId}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const products: Product[] = await response.json();
      setProducts(products);
      return products;
    } catch (error) {
      console.error("Failed to fetch products by category ID:", error);
      return []; // Return an empty array in case of error
    }
  };

  useEffect(() => {
    const fetchInitialProducts = async () => {
      const selectedCategory = localStorage.getItem(
        "selectedCategory"
      ) as string;
      if (selectedCategory === "") {
        await fetchProducts();
      } else {
        await fetchProductsByCategoryId(selectedCategory);
      }
    };
    window.addEventListener("updateSelectedCategory", () => {
      fetchInitialProducts();
      // ...
    });

    fetchInitialProducts();
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products,
        fetchProducts,
        deleteProduct,
        fetchProductById,
        fetchProductsByCategoryId,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
};
