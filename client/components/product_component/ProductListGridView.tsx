import React from "react";
import ProductAddModalButton from "./ProductAddModalButton";
import Image from "next/image";
import FetchedProductCard from "./FetchedProductCard";

const ProductListGridView = () => {
  return (
    <div className="grid grid-cols-5 gap-5 w-full  min-w-[1100px]">
      <ProductAddModalButton>
        <div className="rounded-lg w-52 h-72 outline-dashed outline-teal-600 outline-4  flex flex-col items-center justify-center cursor-pointer">
          <Image
            alt="add new product button"
            src="/assets/add-product.svg"
            height={48}
            width={48}
          ></Image>
          <p className="text-xl">Add New Product</p>
        </div>
      </ProductAddModalButton>
      <FetchedProductCard></FetchedProductCard>
    </div>
  );
};

export default ProductListGridView;
