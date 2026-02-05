"use client";

import React, { useState, useEffect } from "react";
import LeftBar_Logo from "../layout_components/LeftBar_Logo";
import Image from "next/image";
import LeftBarNavigationItems from "../layout_components/LeftBarNavigationItems";
import { navigationBarLinks } from "@/constants";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";

const LeftBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const pathname = usePathname();

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
      {/* Overlay for desktop when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[5] transition-opacity duration-300 max-md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div
        className={`fixed z-10 left-0 top-0 w-64 h-screen pt-2 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out max-md:hidden shadow-lg ${
          isOpen ? "translate-x-0" : "-translate-x-[12.5rem]"
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
        
        {/* Dark Mode Toggle at Bottom - Always visible, even when closed */}
        <div className={`absolute bottom-4 left-0 right-0 transition-all duration-300 ${
          isOpen ? "px-4" : "px-2"
        }`}>
          <button
            onClick={toggleDarkMode}
            className={`flex items-center justify-center gap-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 ${
              isOpen ? "w-full px-4 py-2.5" : "w-auto px-3 py-2.5 mx-auto"
            }`}
            aria-label="Toggle dark mode"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <span className={`text-sm font-medium text-gray-700 dark:text-gray-300 transition-all duration-300 whitespace-nowrap ${
                  isOpen ? "opacity-100 translate-x-0" : "opacity-0 w-0 overflow-hidden"
                }`}>
                  Light Mode
                </span>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                <span className={`text-sm font-medium text-gray-700 dark:text-gray-300 transition-all duration-300 whitespace-nowrap ${
                  isOpen ? "opacity-100 translate-x-0" : "opacity-0 w-0 overflow-hidden"
                }`}>
                  Dark Mode
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default LeftBar;
