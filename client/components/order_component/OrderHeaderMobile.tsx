import React from "react";
import OrderSearch from "./OrderSearch";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "../shared/DateRangePicker";
import OrderStatusCategorMobile from "./OrderStatusCategorMobile";

const OrderHeaderMobile = ({
  searchInput,
  setSearchInput,
  dateRange,
  setDateRange,
  currentStatus,
  setCurrentStatus,
}: {
  searchInput: string;
  setSearchInput: React.Dispatch<React.SetStateAction<string>>;
  dateRange: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
  currentStatus: string;
  setCurrentStatus: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <div className="space-y-2 md:hidden px-3">
      <OrderSearch searchInput={searchInput} setSearchInput={setSearchInput} />
      <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
      <OrderStatusCategorMobile
        currentStatus={currentStatus}
        setCurrentStatus={setCurrentStatus}
      />
    </div>
  );
};

export default OrderHeaderMobile;
