"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";

interface OrderSearchProps {
  onSearch: (customerName: string) => void;
}

const OrderSearch: React.FC<OrderSearchProps> = ({ onSearch }) => {
  const [searchInput, setSearchInput] = useState<string>("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearch(searchInput);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchInput, onSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  return (
    <div className="flex items-center gap-2 md:p-1 md:w-1/2 xl:w-1/4 max-md:w-full  ">
      <form
        className="search_input_order flex  flex-1 gap-3 items-center"
        onSubmit={(e) => e.preventDefault()}
      >
        <Image
          src="/assets/search.svg"
          alt="search logo"
          width={20}
          height={20}
          className="max-md:w-4 max-md:h-4"
        />
        <input
          type="text"
          placeholder="Search Customer Name"
          className="focus:outline-none focus:ring-0"
          onChange={handleSearchChange}
        />
      </form>
    </div>
  );
};

export default OrderSearch;
