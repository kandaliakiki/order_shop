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
}

const LeftBarNavigationItems: React.FC<LeftBarNavigationItemsProps> = ({
  isOpen,
  setIsOpen,
  label,
  imageUrl,
  imageUrlActive,
  pathname,
  route,
}) => {
  const isActive =
    (pathname.includes(route) && route.length > 1) || pathname === route;
  return (
    <Link
      href={route}
      onClick={() => setIsOpen(false)}
      className="flex items-center px-2 py-1 gap-1 "
    >
      <div
        className={`transition-transform duration-300 ${
          isOpen ? "translate-x-0 scale-100" : "translate-x-[12.5rem] scale-90"
        }`}
      >
        <Image
          alt="shop-logo"
          src={isActive ? imageUrlActive : imageUrl}
          width={40}
          height={40}
        />
      </div>
      <h1
        className={`font-dmsans text-lg tracking-tighter flex-1 ${
          isOpen ? "block" : "hidden"
        }`}
      >
        {label}
      </h1>
    </Link>
  );
};

export default LeftBarNavigationItems;
