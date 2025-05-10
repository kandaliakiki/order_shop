import React from "react";

import { getStatusColor, Order } from "@/constants";

const RecentOrdersTable: React.FC<{ orders: Order[] }> = ({ orders }) => {
  return (
    <div className="overflow-x-auto mt-5 scrollbar-hide rounded-b-xl">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="text-lg text-left bg-slate-50 sticky top-0 z-10">
            <th className="py-4 px-4 th-border">Order ID</th>
            <th className="py-4 px-4 th-border">Customer</th>
            <th className="py-4 px-4 th-border">Items</th>
            <th className="py-4 px-4 th-border">Total</th>
            <th className="py-4 px-4 th-border">Date</th>
            <th className="py-4 px-4 th-border">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={index}>
              <td className="py-4 px-4 border-b">{order.orderId}</td>
              <td className="py-4 px-4 border-b">{order.customerName}</td>
              <td className="py-4 px-4 border-b">{order.items.length} items</td>
              <td className="py-4 px-4 border-b">${order.total.toFixed(2)}</td>
              <td className="py-4 px-4 border-b">
                {new Date(order.createdAt).toLocaleDateString()}
              </td>
              <td className="py-4 px-4 border-b">
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
