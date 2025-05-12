"use client";

import React from "react";
import RecentOrdersTable from "./RecentOrdersTable";
import { useDashboardContext } from "./DashboardContext";

const RecentOrdersSection = () => {
  const { recentOrders } = useDashboardContext();

  return (
    <div className="pt-5 flex flex-col rounded-xl border-2 bg-white border-gray-300 shadow-lg w-1/2">
      <div className="flex justify-between items-center px-8">
        <h1 className="text-neutral-500 text-4xl font-bold">Recent Orders</h1>
      </div>
      <RecentOrdersTable orders={recentOrders} />
      <div className="px-5 flex-1 justify-center items-center flex"></div>
    </div>
  );
};
export const dynamic = "force-dynamic";
export default RecentOrdersSection;
