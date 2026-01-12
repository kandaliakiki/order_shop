"use client";

import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import IngredientAddModalButton from "./IngredientAddModalButton";
import IngredientSearch from "./IngredientSearch";

const IngredientHeader = () => {
  return (
    <div className="flex items-center gap-2 p-1 ">
      <IngredientSearch />
      <IngredientAddModalButton>
        <Button className="bg-teal-600 hover:bg-teal-700">
          <Image
            src="/assets/add-square.svg"
            alt="add logo"
            width={24}
            height={24}
            className="mr-2"
          ></Image>
          Add New Ingredient{" "}
        </Button>
      </IngredientAddModalButton>
    </div>
  );
};

export default IngredientHeader;

