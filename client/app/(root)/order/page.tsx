"use client";

import OrderHeader from "@/components/order_component/OrderHeader";
import OrderList from "@/components/order_component/OrderList";
import { orderStatusList } from "@/constants";
import React, { useState, useEffect } from "react";
import { Order, OrderStatus } from "@/constants";

const Page = () => {
  const [currentStatus, setCurrentStatus] = useState(orderStatusList[0]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
    try {
      const response = await fetch(`${backendUrl}/api/orders`);
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const searchOrdersByCustomerName = async (customerName: string) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
    try {
      const response = await fetch(
        `${backendUrl}/api/searchOrders?customerName=${encodeURIComponent(
          customerName
        )}`
      );
      if (!response.ok) {
        throw new Error("Failed to search orders");
      }
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error searching orders:", error);
    }
  };

  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
    const response = await fetch(`${backendUrl}/api/updateOrder/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newStatus }),
    });

    if (!response.ok) {
      throw new Error("Failed to update order status");
    }

    await response.json();
    fetchOrders(); // Refetch orders after status change
  };

  return (
    <div className="p-5 ">
      <div className="flex justify-between items-center ">
        <h1 className="text-3xl font-bold">Order List</h1>
        <OrderHeader onSearch={searchOrdersByCustomerName} />
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
      <OrderList
        currentStatus={currentStatus}
        orders={orders}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default Page;
