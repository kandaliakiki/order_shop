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
    <div className="flex items-center gap-2">
      <Button
        variant={isGridView ? "default" : "outline"}
        size="sm"
        onClick={() => setIsGridView(true)}
      >
        <Grid3x3 className="h-4 w-4 mr-2" />
        Grid
      </Button>
      <Button
        variant={!isGridView ? "default" : "outline"}
        size="sm"
        onClick={() => setIsGridView(false)}
      >
        <List className="h-4 w-4 mr-2" />
        Table
      </Button>
    </div>
  );
};

export default IngredientListControls;

