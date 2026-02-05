import Image from "next/image";
import React from "react";
import ProductListControls from "../product_component/ProductListControls";
import { bakeryIngredients, OrderStatus } from "@/constants";
import ProductCard from "../product_component/ProductCard";
import OrderCard from "./OrderCard";
import { Order } from "@/constants";

const OrderList = ({
  currentStatus,
  orders,
  onStatusChange,
}: {
  currentStatus: string;
  orders: Order[];
  onStatusChange: (orderId: string, newStatus: OrderStatus) => Promise<void>;
}) => {
  // Filter orders based on the currentStatus
  const filteredOrders = orders.filter((order) => {
    if (currentStatus === "All") return true; // Show all orders if status is "All"
    return order.status === currentStatus; // Filter orders by status
  });

  return (
    <div className="flex flex-col h-[85vh] overflow-hidden">
      <div className="bg-gray-200 dark:bg-gray-800 rounded-lg max-lg:px-2 xl:px-10 pt-3 mt-5 h-full pb-5 overflow-y-scroll scrollbar-hide">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 ">
          {filteredOrders.map((order, index) => (
            <OrderCard
              key={index}
              order={order}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderList;
