"use client";

import React, { useState, useEffect } from "react";
import LeftBar_Logo from "../layout_components/LeftBar_Logo";
import Image from "next/image";
import LeftBarNavigationItems from "../layout_components/LeftBarNavigationItems";
import { navigationBarLinks } from "@/constants";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";

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
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load dark mode preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
      <div
        className={`fixed z-20 left-0 top-0 w-64 h-screen pt-2 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out shadow-xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <LeftBar_Logo setIsOpen={setIsOpen} isOpen={isOpen} isDarkMode={isDarkMode} />
        <div className="flex flex-col h-[calc(100vh-5rem)] overflow-y-auto">
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
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
        
        {/* Dark Mode Toggle at Bottom */}
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default LeftBarMobile;
