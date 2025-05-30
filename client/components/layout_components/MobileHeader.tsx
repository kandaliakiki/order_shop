"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import LeftBarMobile from "../shared/LeftBarMobile";

interface MobileTopBarProps {
  title: string;
}
const MobileHeader = ({ title }: MobileTopBarProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <div className="flex h-14 items-center justify-between   bg-white px-2 mb-3 md:hidden border-b border-input">
        <div className="flex items-center ">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="mr-1"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
      </div>

      <LeftBarMobile
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        pathname={pathname}
      />
    </>
  );
};

export default MobileHeader;
