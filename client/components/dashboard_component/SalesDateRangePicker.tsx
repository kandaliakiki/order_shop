"use client";

import React from "react";
import Image from "next/image";
import { DateRangePicker } from "@/components/shared/DateRangePicker";
import { useDashboardContext } from "@/components/dashboard_component/DashboardContext";

const SalesDateRangePicker = () => {
  const { dateRange, setDateRange } = useDashboardContext();

  return (
    <div className="flex bg-white dark:bg-gray-900 rounded-lg h-10 items-center text-sm tracking-normal md:shadow-lg outline-neutral-300 dark:outline-gray-700 cursor-pointer border border-gray-200 dark:border-gray-800">
      <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
    </div>
  );
};

export default SalesDateRangePicker;
