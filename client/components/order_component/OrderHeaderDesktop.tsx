import React from "react";
import OrderSearch from "./OrderSearch";
import { orderStatusList } from "@/constants";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/shared/DateRangePicker";

const OrderHeaderDesktop = ({
  searchOrdersByCustomerName,
  currentStatus,
  setCurrentStatus,
  dateRange,
  setDateRange,
}: {
  searchOrdersByCustomerName: (customerName: string) => void;
  currentStatus: string;
  setCurrentStatus: React.Dispatch<React.SetStateAction<string>>;
  dateRange: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
}) => {
  return (
    <>
      <div className="flex justify-between items-center max-md:hidden">
        <h1 className="text-3xl font-bold">Order List</h1>
        <OrderSearch onSearch={searchOrdersByCustomerName} />
      </div>
      <div className="flex md:gap-3 md:flex-col-reverse xl:flex-row w-full mt-3  xl:justify-between xl:items-center  max-md:hidden">
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
        <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
      </div>
    </>
  );
};

export default OrderHeaderDesktop;
