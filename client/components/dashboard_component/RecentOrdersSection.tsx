import React from "react";
import RecentOrdersTable from "./RecentOrdersTable";

const RecentOrdersSection = async () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
  const limit = 20; // Set your desired limit here
  const response = await fetch(`${backendUrl}/api/orders?limit=${limit}`, {
    cache: "no-store",
  });
  const orders = await response.json();

  return (
    <div className="pt-5 flex flex-col rounded-xl border-2 bg-white border-gray-300 shadow-lg w-1/2">
      <div className="flex justify-between items-center px-8">
        <h1 className="text-neutral-500 text-4xl font-bold">Recent Orders</h1>
      </div>
      <RecentOrdersTable orders={orders} />
      <div className="px-5 flex-1 justify-center items-center flex"></div>
    </div>
  );
};
export const dynamic = "force-dynamic";
export default RecentOrdersSection;
