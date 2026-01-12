import React from "react";
import { Badge } from "../ui/badge";

interface IngredientStockStatusProps {
  currentStock: number;
  minimumStock: number;
}

const IngredientStockStatus = ({
  currentStock,
  minimumStock,
}: IngredientStockStatusProps) => {
  const getStatus = () => {
    if (currentStock === 0) {
      return { label: "Out of Stock", color: "bg-red-100 text-red-800" };
    } else if (currentStock < minimumStock) {
      return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    } else {
      return { label: "In Stock", color: "bg-green-100 text-green-800" };
    }
  };

  const status = getStatus();

  return (
    <Badge className={status.color}>{status.label}</Badge>
  );
};

export default IngredientStockStatus;

