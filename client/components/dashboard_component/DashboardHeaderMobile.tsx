import React from "react";
import SalesDateRangePicker from "./SalesDateRangePicker";

const DashboardHeaderMobile = () => {
  return (
    <div className="flex justify-between items-center mb-2 px-3 md:hidden">
      <div>
        <SalesDateRangePicker />
        <p className="mx-2 my-3 text-sm text-gray-500 dark:text-gray-400">
          Here&apos;s what happening with your business
        </p>
      </div>
    </div>
  );
};

export default DashboardHeaderMobile;
