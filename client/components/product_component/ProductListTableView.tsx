import React from "react";
import FetchedProductRows from "./FetchedProductRows";

const ProductListTableView = () => {
  return (
    <div className="overflow-x-auto mt-5 scrollbar-hide rounded-xl">
      <table className="min-w-full bg-white ">
        <thead className="    ">
          <tr className="text-lg   bg-slate-100  sticky top-0 z-10 text-center">
            <th className="py-4 px-4 th-border "></th>
            <th className="py-4 px-4 th-border ">Product ID</th>
            <th className="py-4 px-4 th-border">Image</th>
            <th className="py-4 px-4 th-border">Name</th>
            <th className="py-4 px-4 th-border">Category</th>
            <th className="py-4 px-4 th-border">Price</th>
            <th className="py-4 px-4 th-border "></th>
          </tr>
        </thead>
        <tbody>
          <FetchedProductRows></FetchedProductRows>
        </tbody>
      </table>
    </div>
  );
};

export default ProductListTableView;
