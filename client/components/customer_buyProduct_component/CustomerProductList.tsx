import React, { useState } from "react";
import CustomerProductListHeader from "./CustomerProductListHeader";
import CustomerProductListGridView from "./CustomerProductListGridView";

const CustomerProductList = () => {
  return (
    <div className=" flex flex-col h-[90vh] overflow-hidden   ">
      <div className="bg-gray-200  rounded-lg px-10 pt-3 mt-5 h-full pb-5  overflow-y-scroll scrollbar-hide   ">
        <CustomerProductListHeader />
        <CustomerProductListGridView />
      </div>
    </div>
  );
};

export default CustomerProductList;
