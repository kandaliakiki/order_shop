import React from "react";

import { getStatusColor, Order, formatPrice } from "@/constants";

const RecentOrdersTable: React.FC<{ orders: Order[] }> = ({ orders }) => {
  return (
    <div className="overflow-x-auto mt-5 scrollbar-hide rounded-b-xl">
      <table className="min-w-full bg-white dark:bg-gray-900">
        <thead>
          <tr className="text-sm xl:text-lg text-left bg-slate-50 dark:bg-gray-800 sticky top-0 z-10 ">
            <th className="py-4 px-4 th-border text-center dark:text-gray-300 dark:border-gray-700">Order ID</th>
            <th className="py-4 px-4 th-border text-center dark:text-gray-300 dark:border-gray-700">Customer</th>
            <th className="py-4 px-4 th-border text-center dark:text-gray-300 dark:border-gray-700">Items</th>
            <th className="py-4 px-4 th-border text-center dark:text-gray-300 dark:border-gray-700">Total</th>
            <th className="py-4 px-4 th-border text-center dark:text-gray-300 dark:border-gray-700">Date</th>
            <th className="py-4 px-4 th-border text-center dark:text-gray-300 dark:border-gray-700">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={index} className="text-sm xl:text-base dark:border-gray-700">
              <td className="py-4 px-4 border-b text-center whitespace-nowrap dark:text-gray-300">
                {order.orderId}
              </td>
              <td className="py-4 px-4 border-b text-center dark:text-gray-300">
                {order.customerName}
              </td>
              <td className="py-4 px-4 border-b text-center  whitespace-nowrap dark:text-gray-300">
                {order.items.length} items
              </td>
              <td className="py-4 px-4 border-b text-center dark:text-gray-300">
                {formatPrice(order.total)}
              </td>
              <td className="py-4 px-4 border-b text-center dark:text-gray-300">
                {new Date(order.createdAt).toLocaleDateString()}
              </td>
              <td className="py-4 px-4 border-b text-center">
                <span
                  className={`px-2 py-1 rounded ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentOrdersTable;
