import React from "react";

const RevenueControls = () => {
  return (
    <div className="flex gap-1  text-sm h-full">
      <div className=" text-blue-950 rounded-lg p-2 px-3 bg-gray-200 ">
        <p>6M</p>
      </div>
      <div className=" text-blue-600 rounded-lg p-2 px-4 bg-blue-200 ">
        <p>1Y</p>
      </div>
    </div>
  );
};

export default RevenueControls;
