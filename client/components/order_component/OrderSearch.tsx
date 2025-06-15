import Image from "next/image";
import React from "react";

interface OrderSearchProps {
  searchInput: string;
  setSearchInput: React.Dispatch<React.SetStateAction<string>>;
}

const OrderSearch: React.FC<OrderSearchProps> = ({
  searchInput,
  setSearchInput,
}) => {
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
          value={searchInput}
          onChange={handleSearchChange}
        />
      </form>
    </div>
  );
};

export default OrderSearch;
