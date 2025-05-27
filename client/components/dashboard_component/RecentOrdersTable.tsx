import React from "react";

import { getStatusColor, Order } from "@/constants";

const RecentOrdersTable: React.FC<{ orders: Order[] }> = ({ orders }) => {
  return (
    <div className="overflow-x-auto mt-5 scrollbar-hide rounded-b-xl">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="text-sm xl:text-lg text-left bg-slate-50 sticky top-0 z-10 ">
            <th className="py-4 px-4 th-border text-center">Order ID</th>
            <th className="py-4 px-4 th-border text-center">Customer</th>{" "}
            <th className="py-4 px-4 th-border text-center">Items</th>
            <th className="py-4 px-4 th-border text-center">Total</th>
            <th className="py-4 px-4 th-border text-center">Date</th>
            <th className="py-4 px-4 th-border text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={index} className="text-sm xl:text-base">
              <td className="py-4 px-4 border-b text-center whitespace-nowrap">
                {order.orderId}
              </td>
              <td className="py-4 px-4 border-b text-center">
                {order.customerName}
              </td>
              <td className="py-4 px-4 border-b text-center  whitespace-nowrap">
                {order.items.length} items
              </td>
              <td className="py-4 px-4 border-b text-center">
                ${order.total.toFixed(2)}
              </td>
              <td className="py-4 px-4 border-b text-center">
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
