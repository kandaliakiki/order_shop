import { ordersTableData, OrderStatus } from "@/constants";
import React from "react";

const RecentOrdersTable = () => {
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Unpaid":
        return "bg-red-100 text-red-800";
      default:
        return "";
    }
  };

  return (
    <div className="overflow-x-auto mt-5 scrollbar-hide rounded-b-xl">
      <table className="min-w-full bg-white ">
        <thead className="    ">
          <tr className="text-lg text-left  bg-slate-50  sticky top-0 z-10 ">
            <th className="py-4 px-4 th-border">Order ID</th>
            <th className="py-4 px-4 th-border">Customer</th>
            <th className="py-4 px-4 th-border">Product</th>
            <th className="py-4 px-4 th-border">Amount</th>
            <th className="py-4 px-4 th-border">Vendor</th>
            <th className="py-4 px-4 th-border">Status</th>
            <th className="py-4 px-4 th-border">Rating</th>
          </tr>
        </thead>
        <tbody>
          {ordersTableData.map((order, index) => (
            <tr key={index} className="">
              <td className="py-4 px-4 border-b">{order.id}</td>
              <td className="py-4 px-4 border-b">{order.customer}</td>
              <td className="py-4 px-4 border-b">{order.product}</td>
              <td className="py-4 px-4 border-b">{order.amount}</td>
              <td className="py-4 px-4 border-b">{order.vendor}</td>
              <td className="py-4 px-4 border-b">
                <span
                  className={`px-2 py-1 rounded ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </td>
              <td className="py-2 px-4 border-b">{order.rating}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentOrdersTable;
