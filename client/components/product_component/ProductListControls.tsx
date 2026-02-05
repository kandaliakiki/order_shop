import Image from "next/image";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { useProducts } from "./ProductContext";
import DeleteMultipleModal from "./DeleteMultipleModal";
import ProductFilterDropdown from "./ProductFilterDropdown";
import { Trash2 } from "lucide-react";

const ProductListControls = () => {
  const { selectedProducts, isGridView, setIsGridView } = useProducts();
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  return (
    <div className="flex gap-3 items-center h-5 ">
      {selectedProducts.length > 0 && (
        <Button
          variant="destructive"
          onClick={() => setIsOpenDeleteModal(true)}
          className="flex items-center max-md:h-8 max-md:p-2"
        >
          <span className="hidden md:inline">Delete Products</span>
          <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
      )}
      <DeleteMultipleModal
        isOpenDeleteModal={isOpenDeleteModal}
        setIsOpenDeleteModal={setIsOpenDeleteModal}
      />

      <div className="flex w-20 max-md:w-16 bg-white dark:bg-gray-800 rounded-md h-7 max-md:h-8 border border-gray-300 dark:border-gray-700 overflow-hidden">
        <div
          onClick={() => setIsGridView(true)}
          className={`rounded-tl-md rounded-bl-md w-1/2 border-2 ${
            isGridView 
              ? "bg-sky-950 dark:bg-blue-600 border-sky-950 dark:border-blue-600" 
              : "border-gray-300 dark:border-gray-700 border-r-0 bg-transparent"
          } flex justify-center items-center cursor-pointer transition-colors`}
        >
          <Image
            src={isGridView ? "/assets/grid-active.svg" : "/assets/grid.svg"}
            alt="menu icon"
            width={23}
            height={23}
            className="max-md:w-5 max-md:h-5"
          />
        </div>
        <div
          onClick={() => setIsGridView(false)}
          className={`rounded-tr-md rounded-br-md w-1/2 border-2 ${
            !isGridView 
              ? "bg-sky-950 dark:bg-blue-600 border-sky-950 dark:border-blue-600" 
              : "border-gray-300 dark:border-gray-700 border-l-0 bg-transparent"
          } flex justify-center items-center cursor-pointer transition-colors`}
        >
          <Image
            src={!isGridView ? "/assets/list-active.svg" : "/assets/list.svg"}
            alt="list icon"
            width={22}
            height={22}
            className="max-md:w-5 max-md:h-5"
          />
        </div>
      </div>
      <ProductFilterDropdown />
    </div>
  );
};

export default ProductListControls;
