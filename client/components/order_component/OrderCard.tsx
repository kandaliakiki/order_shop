import { Order } from "@/constants";
import Image from "next/image";
import React from "react";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const statusClasses = {
    "New Order": "bg-sky-100 text-sky-800",
    "On Process": "bg-orange-100 text-orange-800",
    Completed: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-800",
  };
  return (
    <div className="p-5 rounded-xl border-2 bg-white border-gray-300 shadow-lg flex flex-col items-start justify-center">
      <div className="flex justify-between w-full items-center">
        <div>
          <p className="font-bold">{order.name}</p>
          <p className="text-neutral-400">{order.phone}</p>
        </div>
        <div
          className={`px-4 font-semibold py-1 rounded-full ${
            statusClasses[order.status]
          }`}
        >
          <p>{order.status}</p>
        </div>
      </div>
      <div className="w-full border-t border-gray-300 my-3"></div>
      <div className="flex h-2 w-full gap-1 justify items-center my-1">
        <div className="aspect-square flex justify-center items-center">
          <Image
            alt="clock icon"
            src="/assets/clock.svg"
            height={19}
            width={19}
          ></Image>
        </div>
        <p className="text-sm text-neutral-400 ">{order.time}</p>
      </div>
      <div className="w-full border-t border-gray-300 my-3"></div>
      <div className="w-full flex justify-between">
        <p className="font-semibold">{order.items.length} Items</p>
        <p className="font-bold text-blue-500">
          $
          {order.items
            .reduce((total, item) => total + item.price * item.quantity, 0)
            .toFixed(2)}
        </p>
      </div>
      <div className="w-full flex flex-col gap-2 mt-2 text-sm">
        {order.items.map((item, index) => (
          <div key={index} className="w-full flex justify-between ">
            <p className="text-neutral-400 ">
              {item.quantity} {item.name}
            </p>
            <p className="font-semibold">${item.price.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderCard;
