"use client";

import React, { useState } from "react";
import { useIngredients } from "./IngredientContext";
import IngredientCard from "./IngredientCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import IngredientStockStatus from "./IngredientStockStatus";
import IngredientAddModalButton from "./IngredientAddModalButton";
import IngredientTableImage from "./IngredientTableImage";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

interface IngredientListProps {
  isGridView: boolean;
}

const IngredientList = ({ isGridView }: IngredientListProps) => {
  const { filteredIngredients, deleteIngredient } = useIngredients();

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this ingredient?")) {
      try {
        await deleteIngredient(id);
      } catch (error) {
        console.error("Failed to delete ingredient:", error);
      }
    }
  };

  if (isGridView) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredIngredients.map((ingredient) => (
          <IngredientCard key={ingredient._id} ingredient={ingredient} />
        ))}
        {filteredIngredients.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
            No ingredients found
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-x-auto border border-gray-200 dark:border-gray-800">
      <Table className="min-w-[600px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Image</TableHead>
            <TableHead className="min-w-[120px]">Name</TableHead>
            <TableHead className="whitespace-nowrap">Unit</TableHead>
            <TableHead className="whitespace-nowrap">Current Stock</TableHead>
            <TableHead className="whitespace-nowrap">Min Stock</TableHead>
            <TableHead className="whitespace-nowrap">Expiry Days</TableHead>
            <TableHead className="whitespace-nowrap">Status</TableHead>
            <TableHead className="w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredIngredients.map((ingredient) => (
            <TableRow key={ingredient._id}>
              <TableCell className="py-2">
                <IngredientTableImage
                  imageUrl={ingredient.imageUrl}
                  name={ingredient.name}
                />
              </TableCell>
              <TableCell className="py-2">
                <div className="line-clamp-2 max-w-[120px]">{ingredient.name}</div>
              </TableCell>
              <TableCell className="py-2 whitespace-nowrap">{ingredient.unit}</TableCell>
              <TableCell className="py-2 whitespace-nowrap">{ingredient.currentStock}</TableCell>
              <TableCell className="py-2 whitespace-nowrap">{ingredient.minimumStock}</TableCell>
              <TableCell className="py-2 whitespace-nowrap">
                {ingredient.defaultExpiryDays ? (
                  <span className="font-medium">{ingredient.defaultExpiryDays}</span>
                ) : (
                  <span className="text-gray-400 italic text-xs">-</span>
                )}
              </TableCell>
              <TableCell className="py-2 whitespace-nowrap">
                <IngredientStockStatus
                  currentStock={ingredient.currentStock}
                  minimumStock={ingredient.minimumStock}
                />
              </TableCell>
              <TableCell className="py-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <IngredientAddModalButton ingredientId={ingredient._id}>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        Edit
                      </DropdownMenuItem>
                    </IngredientAddModalButton>
                    <DropdownMenuItem
                      onClick={() => handleDelete(ingredient._id)}
                      className="text-red-600"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {filteredIngredients.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                No ingredients found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default IngredientList;
