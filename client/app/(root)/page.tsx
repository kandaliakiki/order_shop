import { DashboardProvider } from "@/components/dashboard_component/DashboardContext";
import RecentOrdersSection from "@/components/dashboard_component/RecentOrdersSection";
import ProductPerformanceSection from "@/components/dashboard_component/ProductPerformanceSection";
import ExpiringIngredientsWidget from "@/components/dashboard_component/ExpiringIngredientsWidget";
import TodayBakeSheetWidget from "@/components/dashboard_component/TodayBakeSheetWidget";

import SummarySales from "@/components/dashboard_component/SummarySales";

import React from "react";
import MobileHeader from "@/components/layout_components/MobileHeader";
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
        <div className=" grid grid-cols-1 gap-4 lg:grid-cols-7 rounded-lg px-3 lg:px-5 py-3  w-full h-full lg:h-[680px]">
          <ProductPerformanceSection />
          <RecentOrdersSection></RecentOrdersSection>
        </div>
        {/* New Dashboard Widgets */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 rounded-lg px-3 lg:px-5 py-3 mt-6">
          <TodayBakeSheetWidget />
          <ExpiringIngredientsWidget />
        </div>
      </div>
    </DashboardProvider>
  );
}
