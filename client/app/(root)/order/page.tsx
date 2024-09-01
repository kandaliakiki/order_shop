import OrderHeader from "@/components/order_component/OrderHeader";
import OrderList from "@/components/order_component/OrderList";
import { orderStatusList } from "@/constants";
import React from "react";

const page = () => {
  return (
    <div className="p-5 ">
      <div className="flex justify-between items-center ">
        <h1 className="text-3xl font-bold">Order List</h1>
        <OrderHeader></OrderHeader>
      </div>
      <div className="flex gap-2 mt-3">
        <div className="border-2 border-neutral-300 text-white rounded-xl p-2 px-6 bg-blue-600 ">
          <p>All</p>
        </div>
        {orderStatusList.map((status) => (
          <div
            key={status}
            className="border-2 border-neutral-300 text-neutral-500 rounded-xl p-2 px-6 "
          >
            <p>{status}</p>
          </div>
        ))}
      </div>
      <OrderList></OrderList>
    </div>
  );
};

export default page;
