"use client";

import React from "react";
import { useWhatsApp } from "./WhatsAppContext";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const WhatsAppHeader = () => {
  const { searchText, setSearchText, filterStatus, setFilterStatus } =
    useWhatsApp();

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
      {/* Search */}
      <form
        className="search_input flex items-center flex-1 gap-3 max-md:py-2 max-md:w-full"
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
          value={searchText}
          type="text"
          placeholder="Search by phone number or message content"
          className="focus:outline-none focus:ring-0 max-md:text-sm flex-1"
          onChange={(e) => setSearchText(e.target.value)}
        />
      </form>

      {/* Filter */}
      <Select
        value={filterStatus}
        onValueChange={(value: any) => setFilterStatus(value)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Messages</SelectItem>
          <SelectItem value="analyzed">Analyzed</SelectItem>
          <SelectItem value="not-analyzed">Not Analyzed</SelectItem>
          <SelectItem value="has-order">Has Order</SelectItem>
          <SelectItem value="no-order">No Order</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default WhatsAppHeader;

