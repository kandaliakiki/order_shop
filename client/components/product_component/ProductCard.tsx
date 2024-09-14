import Image from "next/image";
import React from "react";
import { Checkbox } from "../ui/checkbox";
import { Product } from "./ProductContext";
import ProductCardDropdown from "./ProductCardDropdown";

const ProductCard: React.FC<Product> = ({
  _id,
  category,
  name,
  price,
  imageUrl,
}) => {
  return (
    <div className="p-3  aspect-[3/4] rounded-xl border-2 bg-white border-gray-300 shadow-lg flex flex-col items-start ">
      <div className="flex justify-between w-full items-center mb-2">
        <Checkbox className="h-5 w-5  border-gray-500"></Checkbox>
        <ProductCardDropdown _id={_id} />
      </div>
      <Image
        alt="product image"
        src={imageUrl}
        height={120}
        width={160}
        className="self-center  h-1/2"
      ></Image>
      <p className=" text-gray-500 mt-5 ">{category}</p>
      <p className="text-lg">{name}</p>
      <p className="text-xl mt-5 font-bold">${price}</p>
    </div>
  );
};

export default ProductCard;
