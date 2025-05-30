"use client";

import OrderSearch from "@/components/order_component/OrderSearch";
import OrderList from "@/components/order_component/OrderList";
import { orderStatusList } from "@/constants";
import React, { useState, useEffect } from "react";
import { Order, OrderStatus } from "@/constants";
import { DateRangePicker } from "@/components/shared/DateRangePicker";
import { DateRange } from "react-day-picker";
import { subMonths } from "date-fns";
import OrderHeaderDesktop from "@/components/order_component/OrderHeaderDesktop";
import MobileHeader from "@/components/layout_components/MobileHeader";
import OrderHeaderMobile from "@/components/order_component/OrderHeaderMobile";

const Page = () => {
  const [currentStatus, setCurrentStatus] = useState(orderStatusList[0]);
  const [orders, setOrders] = useState<Order[]>([]);

  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
  });

  useEffect(() => {
    fetchOrders();
  }, [dateRange, currentStatus]);

  const fetchOrders = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
    try {
      const response = await fetch(
        `${backendUrl}/api/orders?limit=0&from=${dateRange.from?.toISOString()}&to=${dateRange.to?.toISOString()}`,
        {
          cache: "no-store",
        }
      );
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
        )}&from=${dateRange.from?.toISOString()}&to=${dateRange.to?.toISOString()}`
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
    <div className=" md:p-5 ">
      <MobileHeader title="Order List" />
      <OrderHeaderMobile
        searchOrdersByCustomerName={searchOrdersByCustomerName}
        dateRange={dateRange}
        setDateRange={setDateRange}
        currentStatus={currentStatus}
        setCurrentStatus={setCurrentStatus}
      />
      <OrderHeaderDesktop
        searchOrdersByCustomerName={searchOrdersByCustomerName}
        currentStatus={currentStatus}
        setCurrentStatus={setCurrentStatus}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />
      <OrderList
        currentStatus={currentStatus}
        orders={orders}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default Page;
