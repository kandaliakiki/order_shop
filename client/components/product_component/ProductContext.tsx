import React, { createContext, useContext, useState, useEffect } from "react";
import { Category } from "./CategoryContext";

export interface Product {
  _id: string; // Changed id to _id
  name: string;
  price: number;
  category: Category;
  imageUrl: string;
}

interface ProductContextType {
  products: Product[];
  fetchProducts: () => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  deleteMultipleProducts: (ids: string[]) => Promise<void>; // Add this line
  fetchProductById: (id: string) => Promise<Product | null>;
  fetchProductsByCategoryId: (categoryId: string) => Promise<Product[]>;
  selectedProducts: string[];
  setSelectedProducts: React.Dispatch<React.SetStateAction<string[]>>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const fetchProducts = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
    try {
      const response = await fetch(`${backendUrl}/products`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: Product[] = await response.json();
      setProducts(data);
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

  const deleteMultipleProducts = async (ids: string[]) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
    try {
      const response = await fetch(`${backendUrl}/api/deleteMultipleProducts`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
      });
      if (!response.ok) {
        throw new Error("Failed to delete multiple products");
      }
      // Optionally, you can update the state to remove the deleted products
      setProducts((prevProducts) =>
        prevProducts.filter((product) => !ids.includes(product._id))
      );
    } catch (error) {
      console.error("Error deleting multiple products:", error);
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
      return product;
    } catch (error) {
      console.error("Failed to fetch product by ID:", error);
      return null;
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
      return [];
    }
  };

  useEffect(() => {
    const fetchInitialProducts = async () => {
      const selectedCategory = localStorage.getItem(
        "selectedCategory"
      ) as string;
      setProducts([]);
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
        deleteMultipleProducts,
        fetchProductById,
        fetchProductsByCategoryId,
        selectedProducts,
        setSelectedProducts,
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
