"use client";

import React from "react";
import { Button } from "../ui/button";
import { Grid3x3, List } from "lucide-react";

interface IngredientListControlsProps {
  isGridView: boolean;
  setIsGridView: (value: boolean) => void;
}

const IngredientListControls = ({
  isGridView,
  setIsGridView,
}: IngredientListControlsProps) => {
  return (
    <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden">
      <button
        onClick={() => setIsGridView(true)}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          isGridView
            ? "bg-sky-950 dark:bg-blue-600 text-white"
            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        }`}
      >
        <div className="flex items-center gap-2">
          <Grid3x3 className="h-4 w-4" />
          Grid
        </div>
      </button>
      <button
        onClick={() => setIsGridView(false)}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          !isGridView
            ? "bg-sky-950 dark:bg-blue-600 text-white"
            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        }`}
      >
        <div className="flex items-center gap-2">
          <List className="h-4 w-4" />
          Table
        </div>
      </button>
    </div>
  );
};

export default IngredientListControls;

