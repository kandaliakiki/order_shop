import React from "react";
import ProductAddModalButton from "./ProductAddModalButton";
import Image from "next/image";
import FetchedProductCard from "./FetchedProductCard";
import { Plus } from "lucide-react";
import { Card } from "../ui/card";

const ProductListGridView = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 w-full  ">
      <ProductAddModalButton>
        <Card className="flex h-full flex-col items-center justify-center border-2 border-dashed border-teal-500 dark:border-teal-600 p-4 md:p-6 text-center hover:bg-teal-50 dark:hover:bg-teal-900/20 min-h-[200px]">
          <div className="mb-2 md:mb-4 rounded-full bg-teal-100 dark:bg-teal-900/30 p-2 md:p-3">
            <Plus className="h-4 w-4 md:h-6 md:w-6 text-teal-600 dark:text-teal-400" />
          </div>
          <h3 className="text-xs md:text-sm font-medium dark:text-white">Add New Product</h3>
        </Card>
      </ProductAddModalButton>
      <FetchedProductCard></FetchedProductCard>
    </div>
  );
};

export default ProductListGridView;
