import React from "react";
import SalesDateRangePicker from "./SalesDateRangePicker";

const DashboardHeaderDesktop = () => {
  return (
    <div className="flex justify-between items-center mb-2 max-md:hidden">
      <div>
        <h1 className="text-3xl font-bold dark:text-white">Hi , Kandaliakiki</h1>
        <p className="text-neutral-500 dark:text-gray-400">
          Here&apos;s what happening with your business
        </p>
      </div>
      <SalesDateRangePicker />
    </div>
  );
};

export default DashboardHeaderDesktop;
