import React from "react";
import { Product, useProducts } from "./ProductContext";
import { Checkbox } from "../ui/checkbox";
import Image from "next/image";
import ProductTableCheckbox from "./ProductTableCheckbox";
import EditButtonProductTable from "./EditButtonProductTable";

const FetchedProductRowsDesktop = () => {
  const { products } = useProducts(); // Use the context to get products

  return (
    <>
      {products.map((product) => (
        <tr key={product._id} className="hover:bg-gray-50">
          <td className="px-4 py-4">
            <ProductTableCheckbox _id={product._id} />
          </td>
          <td className="px-4 py-4 font-medium text-gray-900">
            {product.productId}
          </td>
          <td className="px-4 py-4">
            <div className="h-16 w-16 rounded-lg overflow-hidden">
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </div>
          </td>
          <td className="px-4 py-4 font-medium text-gray-900">
            {product.name}
          </td>
          <td className="px-4 py-4 text-gray-700">{product.category.name}</td>
          <td className="px-4 py-4 font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </td>
          <td className="px-4 py-4">
            <EditButtonProductTable _id={product._id} />
          </td>
        </tr>
      ))}
    </>
  );
};

export default FetchedProductRowsDesktop;
