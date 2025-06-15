import React from "react";
import OrderSearch from "./OrderSearch";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "../shared/DateRangePicker";
import OrderStatusCategoryDesktop from "./OrderStatusCategoryDesktop";

const OrderHeaderDesktop = ({
  searchInput,
  setSearchInput,
  currentStatus,
  setCurrentStatus,
  dateRange,
  setDateRange,
}: {
  searchInput: string;
  setSearchInput: React.Dispatch<React.SetStateAction<string>>;
  currentStatus: string;
  setCurrentStatus: React.Dispatch<React.SetStateAction<string>>;
  dateRange: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
}) => {
  return (
    <>
      <div className="flex justify-between items-center max-md:hidden">
        <h1 className="text-3xl font-bold">Order List</h1>
        <OrderSearch
          searchInput={searchInput}
          setSearchInput={setSearchInput}
        />
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
