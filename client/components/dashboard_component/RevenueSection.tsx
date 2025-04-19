import React from "react";
import SummaryChart from "./SummaryChart";
import RevenueControls from "./RevenueControls";
import RevenueDetails from "./RevenueDetails";

const RevenueSection = () => {
  return (
    <div className="pt-5 flex flex-col rounded-xl border-2 border-gray-300 shadow-lg w-1/2  ">
      <div className="flex justify-between items-center px-8">
        <h1 className="text-neutral-500 text-4xl font-bold">Revenue</h1>
        <RevenueControls />
      </div>
      <RevenueDetails />

      <div className=" px-5 flex-1 justify-center items-center flex  ">
        <SummaryChart />
      </div>
    </div>
  );
};

export default RevenueSection;
