import React from "react";
import OrderSearch from "./OrderSearch";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "../shared/DateRangePicker";

const OrderHeaderMobile = ({
  searchOrdersByCustomerName,
  dateRange,
  setDateRange,
}: {
  searchOrdersByCustomerName: (customerName: string) => void;
  dateRange: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
}) => {
  return (
    <div className="space-y-2 md:hidden px-3">
      <OrderSearch onSearch={searchOrdersByCustomerName} />
      <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
    </div>
  );
};

export default OrderHeaderMobile;
