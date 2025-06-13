import React, { useState } from "react";
import CustomerProductListHeader from "./CustomerProductListHeader";
import CustomerProductListGridView from "./CustomerProductListGridView";

const CustomerProductList = () => {
  return (
    <div className=" flex flex-col h-[90vh] overflow-hidden   ">
      <div className="lg:bg-gray-200  rounded-lg px-10 pt-3  h-full pb-5  overflow-y-scroll scrollbar-hide   ">
        <CustomerProductListHeader />
        <CustomerProductListGridView />
      </div>
    </div>
  );
};

export default CustomerProductList;
