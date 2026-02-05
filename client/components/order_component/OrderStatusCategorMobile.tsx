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
        <TabsList className="inline-flex w-auto bg-slate-200 dark:bg-gray-800">
          <TabsTrigger value="All" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white dark:text-gray-300">All</TabsTrigger>
          <TabsTrigger value="New Order" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white dark:text-gray-300">New Order</TabsTrigger>
          <TabsTrigger value="On Process" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white dark:text-gray-300">On Process</TabsTrigger>
          <TabsTrigger value="Completed" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white dark:text-gray-300">Completed</TabsTrigger>
          <TabsTrigger value="Cancelled" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white dark:text-gray-300">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default OrderStatusCategorMobile;
