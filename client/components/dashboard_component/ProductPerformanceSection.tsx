import React from "react";
import SummaryChart from "./SummaryChart";

import ProductPerformanceChart from "./ProductPerformanceChart";
import ProductPerformanceMetrics from "./ProductPerformanceMetrics";
import ChartColorControls from "./ChartColorControls";

const ProductPerformanceSection = () => {
  return (
    <div className="lg:col-span-3 pt-5 flex flex-col rounded-xl border-2 border-gray-300 shadow-lg w-full  h-[600px] lg:h-[680px] ">
      <div className="flex justify-between items-center px-8">
        <h1 className="text-neutral-500 text-2xl lg:text-4xl font-bold">
          Product Performance
        </h1>
        <ChartColorControls />
      </div>
      <ProductPerformanceMetrics />

      <div className="pr-5  lg:px-5 flex-1 justify-center items-center flex">
        {/* <SummaryChart /> */}
        <ProductPerformanceChart />
      </div>
    </div>
  );
};

export default ProductPerformanceSection;
