"use client";

import React from "react";
import CardSummary from "./CardSummary";
import { useDashboardContext } from "@/components/dashboard_component/DashboardContext";

const SummarySales = () => {
  const { metrics } = useDashboardContext();

  return (
    <div className=" grid grid-cols-1 gap-4 px-2 lg:grid-cols-2 xl:grid-cols-4">
      <CardSummary
        colorTheme="blue"
        backgroundImageSrc="/assets/backgroundcard-blue.svg"
        title="Overall Revenue"
        value={`$${metrics.overallRevenue}`}
        iconSrc="/assets/dollar.svg"
        iconBackgroundColor="green"
      />
      <CardSummary
        colorTheme="red"
        backgroundImageSrc="/assets/backgroundcard-red.svg"
        title="Orders"
        value={metrics.totalOrders}
        iconSrc="/assets/bag.svg"
        iconBackgroundColor="purple"
      />
      <CardSummary
        colorTheme="orange"
        backgroundImageSrc="/assets/backgroundcard-yellow.svg"
        title="Items Sold"
        value={metrics.totalItemsSold}
        iconSrc="/assets/customer.svg"
        iconBackgroundColor="black"
      />
      <CardSummary
        colorTheme="green"
        backgroundImageSrc="/assets/backgroundcard-green.svg"
        title="Profit"
        value={`$${metrics.profit}`}
        iconSrc="/assets/profit.svg"
        iconBackgroundColor="yellow"
      />
    </div>
  );
};

export default SummarySales;
