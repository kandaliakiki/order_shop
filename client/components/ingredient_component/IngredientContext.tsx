import React, { createContext, useContext, useEffect, useState } from "react";

export interface Ingredient {
  _id: string;
  ingredientId: string;
  name: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  defaultExpiryDays?: number;
  imageUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IngredientLot {
  _id: string;
  lotId: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  purchaseDate?: string;
  supplier?: string;
  cost?: number;
  currentStock: number;
  expirySource?: "user" | "database" | "ai" | "default";
  daysUntilExpiry: number;
  isExpiringSoon: boolean;
  isExpired: boolean;
  ingredient?: {
    _id: string;
    name: string;
    unit: string;
  };
}

interface IngredientContextType {
  ingredients: Ingredient[];
  fetchIngredients: () => Promise<void>;
  fetchIngredientById: (id: string) => Promise<Ingredient | null>;
  fetchIngredientLots: (ingredientId: string, includeEmpty?: boolean) => Promise<IngredientLot[]>;
  createIngredient: (ingredientData: {
    name: string;
    unit: string;
    currentStock: number;
    minimumStock: number;
    defaultExpiryDays?: number;
    imageUrl: string;
  }) => Promise<void>;
  updateIngredient: (
    id: string,
    ingredientData: {
      name: string;
      unit: string;
      currentStock: number;
      minimumStock: number;
      defaultExpiryDays?: number;
      imageUrl: string;
    }
  ) => Promise<void>;
  deleteIngredient: (id: string) => Promise<void>;
  searchText: string;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
  filteredIngredients: Ingredient[];
}

const IngredientContext = createContext<IngredientContextType | undefined>(
  undefined
);

export const IngredientProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [searchText, setSearchText] = useState("");

  const fetchIngredients = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
    try {
      const response = await fetch(`${backendUrl}/api/ingredients`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: Ingredient[] = await response.json();
      setIngredients(data);
    } catch (error) {
      console.error("Failed to fetch ingredients:", error);
    }
  };

  const fetchIngredientById = async (
    id: string
  ): Promise<Ingredient | null> => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
    try {
      const response = await fetch(`${backendUrl}/api/ingredient/${id}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const ingredient: Ingredient = await response.json();
      return ingredient;
    } catch (error) {
      console.error("Failed to fetch ingredient by ID:", error);
      return null;
    }
  };

  const fetchIngredientLots = async (ingredientId: string, includeEmpty: boolean = false): Promise<IngredientLot[]> => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
    try {
      const url = `${backendUrl}/api/ingredient/${ingredientId}/lots${includeEmpty ? "?active=false" : ""}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch ingredient lots:", error);
      return [];
    }
  };

  const createIngredient = async (ingredientData: {
    name: string;
    unit: string;
    currentStock: number;
    minimumStock: number;
    defaultExpiryDays?: number;
    imageUrl: string;
  }) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
    try {
      const response = await fetch(`${backendUrl}/api/createIngredient`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ingredientData),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      await fetchIngredients(); // Refresh the list
    } catch (error) {
      console.error("Failed to create ingredient:", error);
      throw error;
    }
  };

  const updateIngredient = async (
    id: string,
    ingredientData: {
      name: string;
      unit: string;
      currentStock: number;
      minimumStock: number;
      defaultExpiryDays?: number;
      imageUrl: string;
    }
  ) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
    try {
      const response = await fetch(`${backendUrl}/api/updateIngredient/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ingredientData),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      await fetchIngredients(); // Refresh the list
    } catch (error) {
      console.error("Failed to update ingredient:", error);
      throw error;
    }
  };

  const deleteIngredient = async (id: string) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
    try {
      const response = await fetch(`${backendUrl}/api/deleteIngredient/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete ingredient");
      }

      setIngredients((prevIngredients) =>
        prevIngredients.filter((ingredient) => ingredient._id !== id)
      );
    } catch (error) {
      console.error("Error deleting ingredient:", error);
      throw error;
    }
  };

  // Filter ingredients based on search text
  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchText.toLowerCase())
  );

  useEffect(() => {
    fetchIngredients(); // Fetch ingredients on initial load
  }, []);

  return (
    <IngredientContext.Provider
      value={{
        ingredients,
        fetchIngredients,
        fetchIngredientById,
        fetchIngredientLots,
        createIngredient,
        updateIngredient,
        deleteIngredient,
        searchText,
        setSearchText,
        filteredIngredients,
      }}
    >
      {children}
    </IngredientContext.Provider>
  );
};

export const useIngredients = () => {
  const context = useContext(IngredientContext);
  if (!context) {
    throw new Error("useIngredients must be used within an IngredientProvider");
  }
  return context;
};

