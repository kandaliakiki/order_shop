import Image from "next/image";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { useProducts } from "../product_component/ProductContext";
import ProductFilterDropdown from "../product_component/ProductFilterDropdown";

const ProductListControls = () => {
  const { selectedProducts, isGridView, setIsGridView } = useProducts();
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  return (
    <div className="flex gap-3 items-center h-5 ">
      <ProductFilterDropdown />
    </div>
  );
};

export default ProductListControls;
