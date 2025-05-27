"use client";

import React from "react";
import LeftBar_Logo from "../layout_components/LeftBar_Logo";
import Image from "next/image";
import LeftBarNavigationItems from "../layout_components/LeftBarNavigationItems";
import { navigationBarLinks } from "@/constants";
import { usePathname } from "next/navigation";

interface LeftBarMobileProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  pathname: string;
}

const LeftBarMobile: React.FC<LeftBarMobileProps> = ({
  isOpen,
  setIsOpen,
  pathname,
}) => {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
      <div
        className={`fixed z-20 left-0 top-0 w-64 h-screen pt-2 bg-white transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <LeftBar_Logo setIsOpen={setIsOpen} isOpen={isOpen} />
        {navigationBarLinks.map((link, index) => (
          <LeftBarNavigationItems
            key={index}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            label={link.label}
            imageUrl={link.imgURL}
            imageUrlActive={link.imgURLActive}
            route={link.route}
            pathname={pathname}
          />
        ))}
      </div>
    </>
  );
};

export default LeftBarMobile;
