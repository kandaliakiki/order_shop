"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useDashboardContext } from "@/components/dashboard_component/DashboardContext";

// Define the type for product data
interface ProductData {
  name: string;
  quantity: number;
}

const ProductPerformanceChart = () => {
  const { orders, chartColor } = useDashboardContext();
  const [productData, setProductData] = useState<ProductData[]>([]);

  useEffect(() => {
    const productMap = new Map<string, number>();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (productMap.has(item.name)) {
          productMap.set(item.name, productMap.get(item.name)! + item.quantity);
        } else {
          productMap.set(item.name, item.quantity);
        }
      });
    });

    const data = Array.from(productMap, ([name, quantity]) => ({
      name,
      quantity,
    }));
    setProductData(data);
  }, [orders]);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={productData}>
        <XAxis dataKey="name" angle={-45} textAnchor="end" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="quantity" fill={chartColor} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ProductPerformanceChart;
