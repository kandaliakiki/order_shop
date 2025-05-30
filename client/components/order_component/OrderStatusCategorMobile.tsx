import React from "react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

const OrderStatusCategorMobile = ({
  currentStatus,
  setCurrentStatus,
}: {
  currentStatus: string;
  setCurrentStatus: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <div className="overflow-x-auto  md:hidden">
      <Tabs
        defaultValue="All"
        value={currentStatus}
        onValueChange={setCurrentStatus}
        className="w-full"
      >
        <TabsList className="inline-flex w-auto bg-slate-200">
          <TabsTrigger value="All">All</TabsTrigger>
          <TabsTrigger value="New Order">New Order</TabsTrigger>
          <TabsTrigger value="On Process">On Process</TabsTrigger>
          <TabsTrigger value="Completed">Completed</TabsTrigger>
          <TabsTrigger value="Cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default OrderStatusCategorMobile;
