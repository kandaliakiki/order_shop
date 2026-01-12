import Image from "next/image";
import React from "react";
import { Checkbox } from "../ui/checkbox";
import { Product, useProducts } from "./ProductContext";
import ProductCardDropdown from "./ProductCardDropdown";
import ProductIngredientsModal from "./ProductIngredientsModal";
import { Card, CardContent } from "../ui/card";

const ProductCard: React.FC<Product> = ({
  productId,
  _id,
  category,
  name,
  price,
  imageUrl,
  ingredients,
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
    <Card key={productId} className="overflow-hidden">
      <div className="relative">
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            className="bg-white border-gray-300"
            checked={selectedProducts.includes(_id)}
            onCheckedChange={handleCheckboxChange}
          />
        </div>
        <div className="absolute top-2 right-2 z-10">
          <ProductCardDropdown _id={_id} />
        </div>
        <div className="aspect-square w-full overflow-hidden">
          <Image
            alt="product image"
            src={imageUrl}
            width={300}
            height={300}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
      <CardContent className="p-2 md:p-3">
        <div className="text-xs text-gray-500 mb-1">{category.name}</div>
        <div className="font-medium mb-1 text-sm md:text-base line-clamp-1">
          {name}
        </div>
        <div className="text-base md:text-lg font-bold mb-2">
          ${price.toFixed(2)}
        </div>
        <ProductIngredientsModal
          product={{
            _id,
            productId,
            category,
            name,
            price,
            imageUrl,
            ingredients,
          }}
        />
      </CardContent>
    </Card>
    // <div className="w-56 h-72  rounded-xl border-2 bg-white border-gray-300 shadow-lg flex flex-col items-start ">
    //   <div className="px-3 py-2 flex justify-between w-full items-center ">
    //     <Checkbox
    //       className="h-5 w-5 border-gray-500"
    //       checked={selectedProducts.includes(_id)}
    //       onCheckedChange={handleCheckboxChange}
    //     />
    //     <ProductCardDropdown _id={_id} />
    //   </div>
    //   <div className="w-full h-56 relative bg-red-300">
    //     <Image
    //       alt="product image"
    //       src={imageUrl}
    //       fill
    //       className="object-cover w-auto h-auto"
    //     ></Image>
    //   </div>
    //   <div className="px-3 pb-3">
    //     <p className=" text-gray-500 mt-1 ">{category.name}</p>
    //     <p className="text-lg">{name}</p>
    //     <p className="text-xl mt-5 font-bold">${price}</p>
    //   </div>
    // </div>
  );
};

export default ProductCard;
