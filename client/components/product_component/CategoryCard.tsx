import Image from "next/image";
import React, { useEffect, useState } from "react";
import { setCategoryId } from "./CategoryContext";

interface CategoryCardProps {
  name: string;
  imageUrl: string;
  _id: string; // Added _id to the props
  selectedCategory: string | null;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string | null>>;
  getProductCountByCategoryId: (id: string) => Promise<number>; // Add this prop
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  name,
  imageUrl,
  _id, // Added _id to the destructured props
  selectedCategory,
  setSelectedCategory,
  getProductCountByCategoryId, // Destructure the new prop
}) => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const fetchCount = async () => {
      const productCount = await getProductCountByCategoryId(_id);
      setCount(productCount);
    };

    fetchCount();
  }, [getProductCountByCategoryId]);

  return (
    <div
      className={`relative flex items-center border border-gray-300 shadow-sm rounded-lg p-2 py-3 mb-2  cursor-pointer ${
        selectedCategory === _id
          ? " bg-teal-600 text-white"
          : "bg-white text-black"
      }`}
      key={_id}
      onClick={() => {
        setCategoryId(_id);
        setSelectedCategory(_id);
      }}
    >
      <Image
        src={imageUrl === "" ? "assets/bakeries.svg" : imageUrl}
        alt="cateogry icon"
        width={20}
        height={20}
        className="mr-2 mb-2 "
      ></Image>
      <h2 className="flex-1">{name}</h2>
      <span
        className={` text-black inline-flex items-center justify-center aspect-square  w-[1.15rem] md:w-6 text-xs md:text-base font-bold leading-none text-vibrant-pink bg-gray-300 rounded-full  `}
      >
        {count}
      </span>
    </div>
  );
};

export default CategoryCard;
