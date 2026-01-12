"use client";

import React, { useState } from "react";
import { IngredientProvider } from "@/components/ingredient_component/IngredientContext";
import IngredientHeader from "@/components/ingredient_component/IngredientHeader";
import IngredientList from "@/components/ingredient_component/IngredientList";
import IngredientListControls from "@/components/ingredient_component/IngredientListControls";
import MobileHeader from "@/components/layout_components/MobileHeader";

const IngredientsPage = () => {
  const [isGridView, setIsGridView] = useState(false);

  return (
    <IngredientProvider>
      <div className="md:p-5 md:px-4">
        <MobileHeader title="Ingredients" />
        <div className="flex flex-col gap-4">
          <IngredientHeader />
          <div className="flex justify-end">
            <IngredientListControls
              isGridView={isGridView}
              setIsGridView={setIsGridView}
            />
          </div>
          <IngredientList isGridView={isGridView} />
        </div>
      </div>
    </IngredientProvider>
  );
};

export default IngredientsPage;

