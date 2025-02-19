"use client";

import OrderHeader from "@/components/order_component/OrderHeader";
import OrderList from "@/components/order_component/OrderList";
import { orderStatusList } from "@/constants";
import React, { useState } from "react";

const page = () => {
  const [currentStatus, setCurrentStatus] = useState(orderStatusList[0]);

  return (
    <div className="p-5 ">
      <div className="flex justify-between items-center ">
        <h1 className="text-3xl font-bold">Order List</h1>
        <OrderHeader></OrderHeader>
      </div>
      <div className="flex gap-2 mt-3">
        {orderStatusList.map((status) => (
          <div
            key={status}
            className={`border-2 border-neutral-300 text-neutral-500 hover:cursor-pointer rounded-xl p-2 px-6 ${
              currentStatus === status ? "bg-sky-700 text-white" : ""
            }`}
            onClick={() => setCurrentStatus(status)}
          >
            <p>{status}</p>
          </div>
        ))}
      </div>
      <OrderList currentStatus={currentStatus}></OrderList>
    </div>
  );
};

export default page;
