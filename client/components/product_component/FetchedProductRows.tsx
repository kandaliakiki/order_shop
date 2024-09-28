import React from "react";
import { Product, useProducts } from "./ProductContext";
import { Checkbox } from "../ui/checkbox";
import Image from "next/image";
import ProductTableCheckbox from "./ProductTableCheckbox";
import EditButtonProductTable from "./EditButtonProductTable";

const FetchedProductRows = () => {
  const { products } = useProducts(); // Use the context to get products

  return (
    <>
      {products.map((product: Product) => (
        <tr key={product._id} className="text-center text-xl">
          <td className="text-center align-middle border-b">
            <ProductTableCheckbox _id={product._id} />
          </td>
          <td className="py-4 px-4 border-b">{product.productId}</td>
          <td className="py-4 px-4 border-b flex justify-center items-center">
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={200}
              height={200}
            ></Image>
          </td>
          <td className="py-4 px-4 border-b">{product.name}</td>
          <td className="py-4 px-4 border-b">{product.category.name}</td>
          <td className="py-4 px-4 border-b font-bold">${product.price}</td>
          <td className="py-4 px-4 border-b">
            <EditButtonProductTable _id={product._id} />
          </td>
        </tr>
      ))}
    </>
  );
};

export default FetchedProductRows;
