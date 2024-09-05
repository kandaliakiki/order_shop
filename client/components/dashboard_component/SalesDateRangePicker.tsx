import Image from "next/image";
import React from "react";

const SalesDateRangePicker = () => {
  return (
    <div className="flex bg-white rounded-lg h-10 items-center text-sm tracking-normal shadow-lg  outline-neutral-300">
      <p className="px-3 border border-neutral-200 h-full flex items-center rounded-tl-lg rounded-bl-lg">
        01 Jan, 2024 to 31 Jan, 2024
      </p>
      <div className="rounded-tr-lg rounded-br-lg bg-blue-600 h-full flex justify-center items-center  px-3">
        <Image
          alt="calendar"
          src="assets/calendar.svg"
          width={15}
          height={15}
        />
      </div>
    </div>
  );
};

export default SalesDateRangePicker;
