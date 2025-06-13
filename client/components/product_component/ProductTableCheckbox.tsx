import React from "react";
import { Checkbox } from "../ui/checkbox";
import { useProducts } from "./ProductContext";

const ProductTableCheckbox = ({ _id }: { _id: string }) => {
  const { selectedProducts, setSelectedProducts } = useProducts();

  const handleCheckboxChange = () => {
    if (selectedProducts.includes(_id)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== _id));
    } else {
      setSelectedProducts([...selectedProducts, _id]);
    }
  };
  return (
    <Checkbox
      className="border-gray-300"
      checked={selectedProducts.includes(_id)}
      onCheckedChange={handleCheckboxChange}
    ></Checkbox>
  );
};

export default ProductTableCheckbox;
