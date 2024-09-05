"use client";

import { dataChart } from "@/constants";
import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const SummaryChart = () => {
  return (
    <div className=" font-dmsans w-full h-[550px] ">
      <ResponsiveContainer>
        <ComposedChart
          width={500}
          height={400}
          data={dataChart}
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid stroke="#e0e0e0" />
          <XAxis dataKey="name" />
          <YAxis
            yAxisId="left"
            label={{
              value: "Revenue",
              angle: -90,
              position: "insideLeft",
              dx: -20,
            }} // Adjust dx for padding
            domain={[0, 20000]}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{
              value: "Order & Customer",
              angle: 90,
              position: "insideRight",
              dx: 10, // Adjust dx for padding
              dy: 30, // Adjust dy for vertical padding
            }}
            domain={[0, 500]}
          />
          <Tooltip />
          <Legend />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="order"
            fill="#b7b5ff"
            stroke="#405189"
          />
          <Bar yAxisId="left" dataKey="revenue" barSize={20} fill="#22BAA6" />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="customer"
            stroke="#ff7300"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SummaryChart;
