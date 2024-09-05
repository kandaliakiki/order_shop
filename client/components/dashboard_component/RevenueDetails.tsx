import React from "react";

const RevenueDetails = () => {
  return (
    <div className="flex w-full justify-between mt-5 border-dashed border-2 border-gray-200 bg-slate-50  py-3">
      <div className="flex flex-col items-center justify-center w-full border-dashed border-r-2 border-gray-200">
        <p className="text-xl ">7,585</p>
        <p className="text-neutral-400">Orders</p>
      </div>
      <div className="flex flex-col items-center justify-center w-full border-dashed border-r-2 border-gray-200">
        <p className="text-xl">$22.89k</p>
        <p className="text-neutral-400">Revenue</p>
      </div>
      <div className="flex flex-col items-center justify-center w-full  border-gray-200">
        <p className="text-xl">367</p>
        <p className="text-neutral-400">Customers</p>
      </div>
    </div>
  );
};

export default RevenueDetails;
