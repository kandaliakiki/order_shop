"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";

interface OrderHeaderProps {
  onSearch: (customerName: string) => void;
}

const OrderHeader: React.FC<OrderHeaderProps> = ({ onSearch }) => {
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
    <div className="flex items-center gap-2 p-1 w-1/4">
      <form
        className="search_input_order flex flex-1 gap-3"
        onSubmit={(e) => e.preventDefault()}
      >
        <Image
          src="/assets/search.svg"
          alt="search logo"
          width={20}
          height={20}
        />
        <input
          type="text"
          placeholder="Search Orders"
          className="focus:outline-none focus:ring-0"
          onChange={handleSearchChange}
        />
      </form>
    </div>
  );
};

export default OrderHeader;
