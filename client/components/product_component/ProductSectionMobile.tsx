import React from "react";
import MobileHeader from "../layout_components/MobileHeader";
import CategoryGridMobile from "./CategoryGridMobile";
import CategoryAddModalButton from "./CategoryAddModalButton";
import ProductSearch from "./ProductSearch";
import ProductListHeader from "./ProductListHeader";
import { useProducts } from "./ProductContext";
import ProductListTableView from "./ProductListTableView";
import ProductListGridView from "./ProductListGridView";

const ProductSectionMobile = () => {
  const { isGridView } = useProducts();
  return (
    <div className=" md:hidden">
      <div className="bg-white">
        <MobileHeader title="Manage Products"></MobileHeader>
        <CategoryGridMobile isAdmin={true}></CategoryGridMobile>
        <div className="flex flex-col justify-center items-center pb-2">
          <CategoryAddModalButton />
          <ProductSearch />
        </div>
      </div>
      <div className="p-4">
        <ProductListHeader />
        {isGridView ? <ProductListGridView /> : <ProductListTableView />}
      </div>
    </div>
  );
};

export default ProductSectionMobile;
