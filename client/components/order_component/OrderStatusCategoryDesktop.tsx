import { orderStatusList } from "@/constants";
import React from "react";

const OrderStatusCategoryDesktop = ({
  currentStatus,
  setCurrentStatus,
}: {
  currentStatus: string;
  setCurrentStatus: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <div className="flex gap-2 ">
      {orderStatusList.map((status) => (
        <div
          key={status}
          className={`bg-background border border-input  md:text-sm xl:text-base  md:whitespace-nowrap   text-neutral-500 hover:cursor-pointer rounded-xl p-2 md:px-4 xl:px-6 ${
            currentStatus === status ? "bg-sky-700 text-white" : ""
          }`}
          onClick={() => setCurrentStatus(status)}
        >
          <p>{status}</p>
        </div>
      ))}
    </div>
  );
};

export default OrderStatusCategoryDesktop;
