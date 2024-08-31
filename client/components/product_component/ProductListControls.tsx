import Image from "next/image";
import React from "react";

const ProductListControls = () => {
  return (
    <div className="flex gap-3">
      <div className="flex w-20 bg-white rounded-md h-7">
        <div className="rounded-tl-md rounded-bl-md  w-1/2  border-2 border-teal-600 flex justify-center items-center">
          <Image
            src="/assets/menu-active.svg"
            alt="menu icon"
            width={23}
            height={23}
          />
        </div>
        <div className="rounded-tr-md rounded-br-md  w-1/2  border-l-0 border-2 border-gray-300 flex justify-center items-center">
          <Image
            src="/assets/list.svg"
            alt="list icon"
            width={22}
            height={22}
          />
        </div>
      </div>
      <div className="flex w-24 bg-white rounded-md h-7 items-center justify-center gap-1 border-2 border-gray-300">
        <Image
          src="/assets/filter.svg"
          alt="filter icon"
          width={20}
          height={20}
        />
        <p className="">Filter</p>
      </div>
    </div>
  );
};

export default ProductListControls;
