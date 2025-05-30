import React from "react";
import OrderSearch from "./OrderSearch";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "../shared/DateRangePicker";
import OrderStatusCategorMobile from "./OrderStatusCategorMobile";

const OrderHeaderMobile = ({
  searchOrdersByCustomerName,
  dateRange,
  setDateRange,
  currentStatus,
  setCurrentStatus,
}: {
  searchOrdersByCustomerName: (customerName: string) => void;
  dateRange: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
  currentStatus: string;
  setCurrentStatus: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <div className="space-y-2 md:hidden px-3">
      <OrderSearch onSearch={searchOrdersByCustomerName} />
      <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
      <OrderStatusCategorMobile
        currentStatus={currentStatus}
        setCurrentStatus={setCurrentStatus}
      />
    </div>
  );
};

export default OrderHeaderMobile;
