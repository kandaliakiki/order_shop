import React from "react";
import ProductAddModalButton from "./ProductAddModalButton";
import Image from "next/image";
import FetchedProductCard from "./FetchedProductCard";

const ProductListGridView = () => {
  return (
    <div className="grid grid-cols-6 gap-5  ">
      <ProductAddModalButton>
        <div className="rounded-lg aspect-[3/4] outline-dashed outline-teal-600 outline-4  flex flex-col items-center justify-center cursor-pointer">
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
