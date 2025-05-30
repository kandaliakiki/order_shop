import React from "react";
import OrderSearch from "./OrderSearch";
import { orderStatusList } from "@/constants";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/shared/DateRangePicker";
import OrderStatusCategoryDesktop from "./OrderStatusCategoryDesktop";

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
        <OrderStatusCategoryDesktop
          currentStatus={currentStatus}
          setCurrentStatus={setCurrentStatus}
        />
        <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
      </div>
    </>
  );
};

export default OrderHeaderDesktop;
