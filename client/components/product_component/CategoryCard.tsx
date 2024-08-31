import Image from "next/image";
import React from "react";

interface CategoryCardProps {
  name: string;
  imageUrl: string;
  count: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  name,
  imageUrl,
  count,
}) => {
  return (
    <div className="relative flex items-center border border-gray-300 shadow-sm rounded-lg p-2 py-3 mb-2 bg-white">
      <Image
        src="/assets/bakeries.svg"
        alt="cateogry icon"
        width={20}
        height={20}
        className="mr-2 mb-2 "
      ></Image>
      <h2 className="flex-1">{name}</h2>
      <span
        className={`  inline-flex items-center justify-center aspect-square  w-[1.15rem] md:w-6 text-xs md:text-base font-bold leading-none text-vibrant-pink bg-gray-300 rounded-full  `}
      >
        {count}
      </span>
    </div>
  );
};

export default CategoryCard;
