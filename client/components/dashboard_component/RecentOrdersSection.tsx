"use client";

import React from "react";
import RecentOrdersTable from "./RecentOrdersTable";
import { useDashboardContext } from "./DashboardContext";

const RecentOrdersSection = () => {
  const { recentOrders } = useDashboardContext();

  return (
    <div className="lg:col-span-4 pt-5 flex flex-col rounded-xl border-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 shadow-lg w-full h-[680px]">
      <div className="flex justify-between items-center px-8">
        <h1 className="text-neutral-500 dark:text-gray-400 text-2xl lg:text-4xl font-bold">
          Recent Orders
        </h1>
      </div>
      <RecentOrdersTable orders={recentOrders} />
      <div className="px-5 flex-1 justify-center items-center flex"></div>
    </div>
  );
};
export const dynamic = "force-dynamic";
export default RecentOrdersSection;
