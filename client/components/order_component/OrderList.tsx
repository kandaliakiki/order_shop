import Image from "next/image";
import React from "react";
import ProductListControls from "../product_component/ProductListControls";
import { bakeryIngredients, ordersList } from "@/constants";
import ProductCard from "../product_component/ProductCard";
import OrderCard from "./OrderCard";

const OrderList = ({ currentStatus }: { currentStatus: string }) => {
  // Filter orders based on the currentStatus
  const filteredOrders = ordersList.filter((order) => {
    if (currentStatus === "All") return true; // Show all orders if status is "All"
    return order.status === currentStatus; // Filter orders by status
  });

  return (
    <div className="flex flex-col h-[85vh] overflow-hidden">
      <div className="bg-gray-200 rounded-lg px-10 pt-3 mt-5 h-full pb-5 overflow-y-scroll scrollbar-hide">
        <div className="grid grid-cols-6 gap-5">
          {filteredOrders.map((order, index) => (
            <OrderCard key={index} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderList;
