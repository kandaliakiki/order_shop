import { DashboardProvider } from "@/components/dashboard_component/DashboardContext";
import RecentOrdersSection from "@/components/dashboard_component/RecentOrdersSection";
import ProductPerformanceSection from "@/components/dashboard_component/ProductPerformanceSection";

import SummarySales from "@/components/dashboard_component/SummarySales";

import React from "react";
import MobileHeader from "@/components/layout_components/MobileTopBar";
import DashboardHeaderDesktop from "@/components/dashboard_component/DashboardHeaderDesktop";
import DashboardHeaderMobile from "@/components/dashboard_component/DashboardHeaderMobile";

export default function Home() {
  return (
    <DashboardProvider>
      <div className="  md:p-5 md:px-4 ">
        <MobileHeader title="Hi , Kandaliakiki" />
        <DashboardHeaderDesktop />
        <DashboardHeaderMobile />
        <SummarySales />
        <div className="  rounded-lg  p-5  w-full flex  gap-3 justify-between  h-[680px]">
          <ProductPerformanceSection />
          <RecentOrdersSection></RecentOrdersSection>
        </div>
      </div>
    </DashboardProvider>
  );
}
