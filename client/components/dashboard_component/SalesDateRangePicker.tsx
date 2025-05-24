"use client";

import React from "react";
import Image from "next/image";
import { DateRangePicker } from "@/components/shared/DateRangePicker";
import { useDashboardContext } from "@/components/dashboard_component/DashboardContext";

const SalesDateRangePicker = () => {
  const { dateRange, setDateRange } = useDashboardContext();

  return (
    <div className="flex bg-white rounded-lg h-10 items-center text-sm tracking-normal md:shadow-lg outline-neutral-300 cursor-pointer">
      <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
    </div>
  );
};

export default SalesDateRangePicker;
