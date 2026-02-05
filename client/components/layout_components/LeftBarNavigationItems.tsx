import Image from "next/image";
import Link from "next/link";
import React from "react";

interface LeftBarNavigationItemsProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  label: string;
  imageUrl: string;
  imageUrlActive: string;
  pathname: string;
  route: string;
  isDarkMode?: boolean;
}

const LeftBarNavigationItems: React.FC<LeftBarNavigationItemsProps> = ({
  isOpen,
  setIsOpen,
  label,
  imageUrl,
  imageUrlActive,
  pathname,
  route,
  isDarkMode = false,
}) => {
  const isActive =
    (pathname.includes(route) && route.length > 1) || pathname === route;
  
  return (
    <Link
      href={route}
      onClick={() => setIsOpen(false)}
      className={`flex items-center mb-1 px-3 py-2.5 gap-3 rounded-lg transition-all duration-200 ${
        isOpen ? "mx-2" : "mx-1"
      } ${
        isActive
          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      <div
        className={`transition-all duration-300 flex-shrink-0 ${
          isOpen ? "translate-x-0 scale-100" : "translate-x-[12.5rem] scale-90"
        }`}
      >
        <Image
          alt={label}
          src={isActive ? imageUrlActive : imageUrl}
          width={24}
          height={24}
          className={isActive ? "" : "opacity-70 dark:opacity-60"}
        />
      </div>
      <span
        className={`font-dmsans text-base font-medium tracking-tight flex-1 transition-all duration-300 ${
          isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
        }`}
      >
        {label}
      </span>
    </Link>
  );
};

export default LeftBarNavigationItems;
