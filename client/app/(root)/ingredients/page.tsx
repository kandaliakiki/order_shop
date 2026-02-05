"use client";

import React, { useState } from "react";
import Link from "next/link";
import { IngredientProvider } from "@/components/ingredient_component/IngredientContext";
import IngredientHeader from "@/components/ingredient_component/IngredientHeader";
import IngredientList from "@/components/ingredient_component/IngredientList";
import IngredientListControls from "@/components/ingredient_component/IngredientListControls";
import MobileHeader from "@/components/layout_components/MobileHeader";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

const IngredientsPage = () => {
  const [isGridView, setIsGridView] = useState(false);

  return (
    <IngredientProvider>
      <div className="md:p-5 md:px-4">
        <MobileHeader title="Ingredients" />
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <IngredientHeader />
            <Link href="/lots">
              <Button variant="outline" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                View Lots
              </Button>
            </Link>
          </div>
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

