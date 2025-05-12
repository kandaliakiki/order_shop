"use client";

import { Order } from "@/constants";
import React, { createContext, useContext, useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

interface DashboardMetrics {
  overallRevenue: string;
  totalOrders: string;
  totalItemsSold: string;
  profit: string;
}

interface DashboardContextType {
  orders: Order[];
  recentOrders: Order[];
  dateRange: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
  fetchAllOrders: () => Promise<void>;
  fetchRecentOrders: () => Promise<void>;
  metrics: DashboardMetrics;
  fetchDashboardMetrics: () => Promise<void>;
  chartColor: string;
  setChartColor: React.Dispatch<React.SetStateAction<string>>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
  });

  const [metrics, setMetrics] = useState<DashboardMetrics>({
    overallRevenue: "0",
    totalOrders: "0",
    totalItemsSold: "0",
    profit: "0",
  });

  const [chartColor, setChartColor] = useState<string>("#8884d8");

  const fetchAllOrders = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
    const response = await fetch(
      `${backendUrl}/api/orders?limit=0&from=${dateRange.from?.toISOString()}&to=${dateRange.to?.toISOString()}`,
      {
        cache: "no-store",
      }
    );
    const fetchedOrders = await response.json();
    setOrders(fetchedOrders);
  };

  const fetchRecentOrders = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
    const response = await fetch(
      `${backendUrl}/api/orders?limit=20&from=${dateRange.from?.toISOString()}&to=${dateRange.to?.toISOString()}`,
      {
        cache: "no-store",
      }
    );
    const fetchedOrders = await response.json();
    setRecentOrders(fetchedOrders);
  };

  const fetchDashboardMetrics = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
    try {
      const response = await fetch(
        `${backendUrl}/api/dashboardMetrics?from=${dateRange.from?.toISOString()}&to=${dateRange.to?.toISOString()}`,
        {
          cache: "no-store",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard metrics");
      }
      const fetchedMetrics = await response.json();
      setMetrics(fetchedMetrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
    }
  };

  useEffect(() => {
    fetchAllOrders();
    fetchRecentOrders();
    fetchDashboardMetrics();
  }, [dateRange]);

  return (
    <DashboardContext.Provider
      value={{
        orders,
        recentOrders,
        dateRange,
        setDateRange,
        fetchAllOrders,
        fetchRecentOrders,
        metrics,
        fetchDashboardMetrics,
        chartColor,
        setChartColor,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error(
      "useDashboardContext must be used within a DashboardProvider"
    );
  }
  return context;
};
