import React from "react";
import ProductListControls from "./ProductListControls";
import Image from "next/image";
import ProductCard from "./ProductCard";
import { bakeryIngredients } from "@/constants";

const ProductList = () => {
  return (
    <div className=" flex flex-col h-[90vh] overflow-hidden  ">
      <div className="bg-gray-200  rounded-lg px-10 pt-3 mt-5 h-full pb-5  overflow-y-scroll scrollbar-hide  ">
        <div className="flex justify-between items-center py-7">
          <h1 className="text-2xl">All Products (120)</h1>
          <ProductListControls />
        </div>

        <div className="grid grid-cols-6 gap-5  ">
          <div className="rounded-lg aspect-[3/4] outline-dashed outline-teal-600 outline-4  flex flex-col items-center justify-center">
            <Image
              alt="add new product button"
              src="/assets/add-product.svg"
              height={48}
              width={48}
            ></Image>
            <p className="text-xl">Add New Product</p>
          </div>
          {bakeryIngredients.map((ingredient) => (
            <ProductCard
              key={ingredient.name}
              category={ingredient.category}
              name={ingredient.name}
              price={ingredient.price}
              imgURL={ingredient.imgURL}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
