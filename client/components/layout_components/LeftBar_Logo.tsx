import Image from "next/image";
import React from "react";

interface LeftBarLogoProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
}

const LeftBar_Logo: React.FC<LeftBarLogoProps> = ({ setIsOpen, isOpen }) => {
  return (
    <>
      <div className="flex items-center px-2 py-2 gap-1 ">
        <Image
          alt="shop-logo"
          src="assets/shop-logo.svg"
          width={40}
          height={40}
        />
        <h1 className="font-dmsans text-xl font-bold tracking-tighter flex-1">
          My Shop
        </h1>
        <div
          className={`transition-transform cursor-pointer duration-300 ${
            isOpen
              ? "scale-100 translate-x-0"
              : "scale-125 -translate-x-[0.3rem]"
          }`}
        >
          <Image
            alt="burger-icon"
            src="assets/burger-icon.svg"
            width={30}
            height={30}
            onClick={() => setIsOpen(!isOpen)}
          />
        </div>
      </div>
      <div
        className={`h-[0.1rem] w-4/6 bg-neutral-100 mx-auto ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      ></div>
    </>
  );
};

export default LeftBar_Logo;
