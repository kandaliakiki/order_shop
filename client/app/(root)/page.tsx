import SalesDateRangePicker from "@/components/dashboard_component/SalesDateRangePicker";
import SummarySales from "@/components/dashboard_component/SummarySales";
import Image from "next/image";
import React from "react";

export default function Home() {
  return (
    <div className="p-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Hi , Kandaliakiki</h1>
          <p className="text-neutral-500">
            Here's what happening with your business
          </p>
        </div>
        <SalesDateRangePicker />
      </div>
      <SummarySales />
    </div>
  );
}
