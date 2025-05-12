import { DashboardProvider } from "@/components/dashboard_component/DashboardContext";
import RecentOrdersSection from "@/components/dashboard_component/RecentOrdersSection";
import ProductPerformanceSection from "@/components/dashboard_component/ProductPerformanceSection";
import SalesDateRangePicker from "@/components/dashboard_component/SalesDateRangePicker";
import SummaryChart from "@/components/dashboard_component/SummaryChart";
import SummarySales from "@/components/dashboard_component/SummarySales";
import Image from "next/image";
import React from "react";

export default function Home() {
  return (
    <DashboardProvider>
      <div className="p-5">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Hi , Kandaliakiki</h1>
            <p className="text-neutral-500">
              Here&apos;s what happening with your business
            </p>
          </div>
          <SalesDateRangePicker />
        </div>
        <SummarySales />
        <div className="  rounded-lg  p-5 mt-5 w-full flex  gap-3 justify-between  h-[700px]">
          <ProductPerformanceSection />
          <RecentOrdersSection></RecentOrdersSection>
        </div>
      </div>
    </DashboardProvider>
  );
}
