import React from "react";
import Image from "next/image";
import { Ingredient } from "./IngredientContext";
import IngredientStockStatus from "./IngredientStockStatus";
import IngredientAddModalButton from "./IngredientAddModalButton";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useIngredients } from "./IngredientContext";
import { MoreVertical } from "lucide-react";

interface IngredientCardProps {
  ingredient: Ingredient;
}

const IngredientCard = ({ ingredient }: IngredientCardProps) => {
  const { deleteIngredient } = useIngredients();

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this ingredient?")) {
      try {
        await deleteIngredient(ingredient._id);
      } catch (error) {
        console.error("Failed to delete ingredient:", error);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-800">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1 dark:text-white">{ingredient.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">ID: {ingredient.ingredientId}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <IngredientAddModalButton ingredientId={ingredient._id}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Edit
              </DropdownMenuItem>
            </IngredientAddModalButton>
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {ingredient.imageUrl && (
        <div className="mb-3">
          <Image
            src={ingredient.imageUrl}
            alt={ingredient.name}
            width={200}
            height={200}
            className="w-full h-32 object-contain rounded"
          />
        </div>
      )}

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Unit:</span>
          <span className="font-medium dark:text-white">{ingredient.unit}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Current Stock:</span>
          <span className="font-medium dark:text-white">{ingredient.currentStock}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Minimum Stock:</span>
          <span className="font-medium dark:text-white">{ingredient.minimumStock}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Default Expiry:</span>
          <span className="font-medium dark:text-white">
            {ingredient.defaultExpiryDays ? `${ingredient.defaultExpiryDays} days` : "Not set"}
          </span>
        </div>
        <div className="pt-2">
          <IngredientStockStatus
            currentStock={ingredient.currentStock}
            minimumStock={ingredient.minimumStock}
          />
        </div>
      </div>
    </div>
  );
};

export default IngredientCard;
