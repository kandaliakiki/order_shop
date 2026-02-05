import Image from "next/image";
import React from "react";

interface LeftBarLogoProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
  isDarkMode?: boolean;
}

const LeftBar_Logo: React.FC<LeftBarLogoProps> = ({ setIsOpen, isOpen, isDarkMode = false }) => {
  return (
    <>
      <div className="flex items-center px-3 py-3 gap-2">
        <Image
          alt="bakery-hub-logo"
          src="/assets/bakery-hub-logo.png"
          width={32}
          height={32}
          className="flex-shrink-0"
        />
        <h1 className={`font-dmsans text-lg font-semibold tracking-tight flex-1 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        } dark:text-white`}>
          BakeryHub
        </h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`transition-transform cursor-pointer duration-300 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
            isOpen
              ? "scale-100 translate-x-0"
              : "scale-110 -translate-x-[0.3rem]"
          }`}
          aria-label="Toggle sidebar"
        >
          <Image
            alt="burger-icon"
            src="assets/burger-icon.svg"
            width={24}
            height={24}
            className="dark:invert"
          />
        </button>
      </div>
      <div
        className={`h-[1px] w-4/5 bg-gray-200 dark:bg-gray-700 mx-auto transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />
    </>
  );
};

export default LeftBar_Logo;
