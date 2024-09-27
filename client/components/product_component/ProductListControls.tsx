import Image from "next/image";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { useProducts } from "./ProductContext";
import DeleteMultipleModal from "./DeleteMultipleModal";
import ProductFilterDropdown from "./ProductFilterDropdown";

const ProductListControls = () => {
  const { selectedProducts, isGridView, setIsGridView } = useProducts();
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  return (
    <div className="flex gap-3 items-center h-5 ">
      {selectedProducts.length > 0 && (
        <Button
          variant="destructive"
          onClick={() => setIsOpenDeleteModal(true)}
        >
          Delete Products
        </Button>
      )}
      <DeleteMultipleModal
        isOpenDeleteModal={isOpenDeleteModal}
        setIsOpenDeleteModal={setIsOpenDeleteModal}
      />

      <div className="flex w-20 bg-white rounded-md h-7">
        <div
          onClick={() => setIsGridView(true)}
          className={`rounded-tl-md rounded-bl-md  w-1/2  border-2 ${
            isGridView ? "border-teal-600" : "border-gray-300 border-r-0"
          } flex justify-center items-center cursor-pointer`}
        >
          <Image
            src={isGridView ? "/assets/grid-active.svg" : "/assets/grid.svg"}
            alt="menu icon"
            width={23}
            height={23}
          />
        </div>
        <div
          onClick={() => setIsGridView(false)}
          className={`rounded-tr-md rounded-br-md  w-1/2   border-2 ${
            !isGridView ? "border-teal-600" : "border-gray-300 border-l-0"
          } flex justify-center items-center cursor-pointer`}
        >
          <Image
            src={!isGridView ? "/assets/list-active.svg" : "/assets/list.svg"}
            alt="list icon"
            width={22}
            height={22}
          />
        </div>
      </div>
      <ProductFilterDropdown />
    </div>
  );
};

export default ProductListControls;
