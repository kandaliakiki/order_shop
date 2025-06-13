"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ComposedChart,
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

  const formatXAxisLabel = (name: string) => {
    const words = name.split(" ");
    return words.length > 2 ? words.slice(0, 2).join(" ") : name;
  };

  return (
    <div className="lg:h-[400px] h-[250px] w-full  overflow-auto">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={productData} margin={{ bottom: 10 }}>
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            tick={{ fontSize: 12 }}
            interval={0}
            height={100}
            width={20}
            tickFormatter={formatXAxisLabel}
          />
          <YAxis tick={{ fontSize: 14 }} />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Bar dataKey="quantity" fill={chartColor} maxBarSize={40} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductPerformanceChart;
