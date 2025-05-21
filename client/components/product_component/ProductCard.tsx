import Image from "next/image";
import React from "react";
import { Checkbox } from "../ui/checkbox";
import { Product, useProducts } from "./ProductContext";
import ProductCardDropdown from "./ProductCardDropdown";

const ProductCard: React.FC<Product> = ({
  productId,
  _id,
  category,
  name,
  price,
  imageUrl,
}) => {
  const { selectedProducts, setSelectedProducts } = useProducts();

  const handleCheckboxChange = () => {
    if (selectedProducts.includes(_id)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== _id));
    } else {
      setSelectedProducts([...selectedProducts, _id]);
    }
  };

  return (
    <div className="w-56 h-72  rounded-xl border-2 bg-white border-gray-300 shadow-lg flex flex-col items-start ">
      <div className="px-3 py-2 flex justify-between w-full items-center ">
        <Checkbox
          className="h-5 w-5 border-gray-500"
          checked={selectedProducts.includes(_id)}
          onCheckedChange={handleCheckboxChange}
        />
        <ProductCardDropdown _id={_id} />
      </div>
      <div className="w-full h-56 relative bg-red-300">
        <Image
          alt="product image"
          src={imageUrl}
          fill
          className="object-cover w-auto h-auto"
        ></Image>
      </div>
      <div className="px-3 pb-3">
        <p className=" text-gray-500 mt-1 ">{category.name}</p>
        <p className="text-lg">{name}</p>
        <p className="text-xl mt-5 font-bold">${price}</p>
      </div>
    </div>
  );
};

export default ProductCard;
