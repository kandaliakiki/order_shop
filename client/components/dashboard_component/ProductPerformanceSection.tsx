import React from "react";
import SummaryChart from "./SummaryChart";

import ProductPerformanceChart from "./ProductPerformanceChart";
import ProductPerformanceMetrics from "./ProductPerformanceMetrics";
import ChartColorControls from "./ChartColorControls";

const ProductPerformanceSection = () => {
  return (
    <div className="lg:col-span-3 pt-3 md:pt-5 flex flex-col rounded-xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg w-full min-h-[400px] md:h-[600px] lg:h-[680px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 md:px-6 lg:px-8 gap-2">
        <h1 className="text-neutral-500 dark:text-gray-400 text-xl md:text-2xl lg:text-4xl font-bold">
          Product Performance
        </h1>
        <ChartColorControls />
      </div>
      <ProductPerformanceMetrics />

      <div className="pr-2 md:pr-5 lg:px-5 flex-1 justify-center items-center flex overflow-x-auto">
        {/* <SummaryChart /> */}
        <ProductPerformanceChart />
      </div>
    </div>
  );
};

export default ProductPerformanceSection;
