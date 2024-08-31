import React from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import { bakeryCategories } from "@/constants";
import CategoryCard from "./CategoryCard";

const ProductCategory = () => {
  return (
    <div className="relative w-1/4 h-screen bg-gray-200 -ml-6 overflow-hidden ">
      <div className="flex flex-col justify-center mt-5 px-5  h-full ">
        <h1 className="text-2xl font-bold mb-5">Product Category</h1>
        <div className="overflow-y-scroll h-screen scrollbar-hide mb-24">
          {bakeryCategories.map((category, index) => (
            <CategoryCard
              key={index}
              count={2}
              imageUrl={category.imgURL}
              name={category.name}
            ></CategoryCard>
          ))}
        </div>
      </div>
      <div className="absolute bottom-0 w-full bg-white border border-gray-200 h-20 rounded-md shadow-lg flex justify-center items-center">
        <Button className="bg-teal-600 w-3/4 text-base rounded-lg mb-2 hover:bg-teal-700">
          <Image
            src="/assets/add-square.svg"
            alt="add logo"
            width={24}
            height={24}
            className="mr-2"
          ></Image>
          Add New Category{" "}
        </Button>
      </div>
    </div>
  );
};

export default ProductCategory;
