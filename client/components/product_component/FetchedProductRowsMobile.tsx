import React from "react";
import { Product, useProducts } from "./ProductContext";
import { Checkbox } from "../ui/checkbox";
import Image from "next/image";
import ProductTableCheckbox from "./ProductTableCheckbox";
import EditButtonProductTable from "./EditButtonProductTable";

const FetchedProductRowsMobile = () => {
  const { products } = useProducts(); // Use the context to get products

  return (
    <>
      {products.map((product) => (
        <div key={product._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <ProductTableCheckbox _id={product._id} />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {product.productId}
            </span>
            <EditButtonProductTable _id={product._id} />
          </div>
          <div className="flex gap-3">
            <div className="h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-gray-300 truncate">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{product.category.name}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-300 mt-1">
                ${product.price.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default FetchedProductRowsMobile;
