"use client";

import React, { useState } from "react";
import LeftBar_Logo from "../layout_components/LeftBar_Logo";
import Image from "next/image";
import LeftBarNavigationItems from "../layout_components/LeftBarNavigationItems";
import { navigationBarLinks } from "@/constants";
import { usePathname } from "next/navigation";

const LeftBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div
      className={`fixed left-0 top-0 w-64 h-screen pt-2 bg-white transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-[12.5rem]"
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
  );
};

export default LeftBar;
