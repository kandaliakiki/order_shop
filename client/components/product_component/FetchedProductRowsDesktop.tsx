import React from "react";
import { Product, useProducts } from "./ProductContext";
import { Checkbox } from "../ui/checkbox";
import ProductImage from "./ProductImage";
import ProductTableCheckbox from "./ProductTableCheckbox";
import EditButtonProductTable from "./EditButtonProductTable";
import ProductIngredientsPopover from "./ProductIngredientsPopover";
import { formatPrice } from "@/constants";

const FetchedProductRowsDesktop = () => {
  const { products } = useProducts(); // Use the context to get products

  return (
    <>
      {products.map((product) => (
        <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <td className="px-4 py-4">
            <ProductTableCheckbox _id={product._id} />
          </td>
          <td className="px-4 py-4 font-medium text-gray-900 dark:text-gray-300">
            {product.productId}
          </td>
          <td className="px-4 py-4">
            <div className="h-16 w-16 rounded-lg overflow-hidden">
              <ProductImage
                imageUrl={product.imageUrl}
                alt={product.name}
                width={64}
                height={64}
                className="h-full w-full object-cover"
                placeholderClassName="h-full w-full object-contain p-2"
              />
            </div>
          </td>
          <td className="px-4 py-4 font-medium text-gray-900 dark:text-gray-300">
            {product.name}
          </td>
          <td className="px-4 py-4 text-gray-700 dark:text-gray-400">{product.category.name}</td>
          <td className="px-4 py-4">
            <ProductIngredientsPopover product={product} />
          </td>
          <td className="px-4 py-4 font-bold text-gray-900 dark:text-gray-300">
            {formatPrice(product.price)}
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
