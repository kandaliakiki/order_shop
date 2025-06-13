import React, { createContext, useContext, useState, useEffect } from "react";
import { Category } from "./CategoryContext";

export interface Product {
  _id: string; // Changed id to _id
  productId: string;
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
  filterProducts: (
    textToSearch: string,
    categoryId?: string
  ) => Promise<Product[]>; // Add this line
  selectedProducts: string[];
  setSelectedProducts: React.Dispatch<React.SetStateAction<string[]>>;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchText: string;
  isGridView: boolean;
  setIsGridView: React.Dispatch<React.SetStateAction<boolean>>;
  maxPrice: number;
  setMaxPrice: React.Dispatch<React.SetStateAction<number>>;
  isApplied: boolean;
  setIsApplied: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [textToSearch, setTextToSearch] = useState("");
  const [isGridView, setIsGridView] = useState(false);
  const [maxPrice, setMaxPrice] = useState(0);
  const [isApplied, setIsApplied] = useState(false);

  const fetchProducts = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
    try {
      const response = await fetch(`${backendUrl}/api/products`);
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const filterProducts = async (
    textToSearch: string,
    categoryId?: string,
    maxPrice?: number // Add this parameter
  ): Promise<Product[]> => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
    try {
      const queryParams = new URLSearchParams({ textToSearch });
      if (categoryId && categoryId.trim() !== "") {
        queryParams.append("categoryId", categoryId);
      }
      if (maxPrice !== undefined) {
        queryParams.append("maxPrice", maxPrice.toString());
      }

      const response = await fetch(
        `${backendUrl}/api/filterProducts?${queryParams.toString()}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      setProducts([]);
      const products: Product[] = await response.json();
      setProducts(products);
      return products;
    } catch (error) {
      console.error("Failed to filter products:", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchInitialProducts = async () => {
      const selectedCategory = localStorage.getItem(
        "selectedCategory"
      ) as string;
      setProducts([]);
      if (!selectedCategory || selectedCategory === "all") {
        await fetchProducts();
      } else {
        await fetchProductsByCategoryId(selectedCategory);
      }
    };
    window.addEventListener("updateSelectedCategory", () => {
      fetchInitialProducts();
      setTextToSearch("");
      setSearchText("");
      setIsApplied(false);
    });

    fetchInitialProducts();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setTextToSearch(searchText), 500);

    return () => clearTimeout(timeout);
  }, [searchText]);

  useEffect(() => {
    if (textToSearch || maxPrice > 0) {
      const currentCategoryId =
        localStorage.getItem("selectedCategory") || undefined;
      filterProducts(textToSearch, currentCategoryId, maxPrice);
    } else {
      window.dispatchEvent(new Event("updateSelectedCategory"));
    }
  }, [textToSearch, maxPrice]);

  return (
    <ProductContext.Provider
      value={{
        products,
        fetchProducts,
        deleteProduct,
        deleteMultipleProducts,
        fetchProductById,
        fetchProductsByCategoryId,
        filterProducts, // Add this line
        selectedProducts,
        setSelectedProducts,
        handleSearchChange,
        searchText,
        isGridView,
        setIsGridView,
        maxPrice,
        setMaxPrice,
        isApplied,
        setIsApplied,
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
