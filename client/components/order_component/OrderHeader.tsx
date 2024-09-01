"use client";

import Image from "next/image";
import React from "react";

const OrderHeader = () => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };
  return (
    <div className="flex items-center gap-2 p-1 w-1/4">
      <form
        className="search_input_order flex flex-1 gap-3   "
        onSubmit={(e) => e.preventDefault()}
      >
        <Image
          src="/assets/search.svg"
          alt="search logo"
          width={20}
          height={20}
        ></Image>
        <input
          type="text"
          placeholder="Search Orders"
          className="focus:outline-none focus:ring-0"
          onChange={handleSearchChange}
        ></input>
      </form>
    </div>
  );
};

export default OrderHeader;
