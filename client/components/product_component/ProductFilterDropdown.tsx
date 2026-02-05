import React, { useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { useProducts } from "./ProductContext";

const ProductFilterDropdown = () => {
  const { setMaxPrice, isApplied, setIsApplied } = useProducts();
  const [sliderValue, setSliderValue] = useState(5);
  const [sliderElement, setSliderElement] = useState<HTMLInputElement | null>(
    null
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!sliderElement) return;

    const updateSliderBackground = () => {
      const value =
        ((Number(sliderElement.value) - Number(sliderElement.min)) /
          (Number(sliderElement.max) - Number(sliderElement.min))) *
        100;
      sliderElement.style.setProperty("--value", `${value}%`);
    };

    updateSliderBackground();
    sliderElement.addEventListener("input", updateSliderBackground);

    return () => {
      sliderElement.removeEventListener("input", updateSliderBackground);
    };
  }, [sliderElement, sliderValue]);

  const handleApply = () => {
    setIsOpen(false);
    setMaxPrice(sliderValue);
    setIsApplied(true);
  };

  const handleClear = () => {
    setIsOpen(false);
    setMaxPrice(0);
    setIsApplied(false);
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <div
            className={`flex md:w-24 max-md:p-2 bg-white dark:bg-gray-800 rounded-md h-7 max-md:h-8 items-center justify-center 
        gap-1 border-2 cursor-pointer transition-colors ${
          isApplied 
            ? "text-teal-600 dark:text-teal-400 border-teal-600 dark:border-teal-500" 
            : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
        }`}
          >
            <Image
              src={
                isApplied ? "/assets/filter-active.svg" : "/assets/filter.svg"
              }
              alt="filter icon"
              width={20}
              height={20}
              className={isApplied ? "" : "dark:invert dark:opacity-80"}
            />
            <p className="max-md:hidden">Filter</p>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-64 px-0 py-0 dark:bg-gray-900 dark:border-gray-800"
          side="bottom"
          align="end"
        >
          <DropdownMenuLabel className="dark:text-white">Filter</DropdownMenuLabel>
          <DropdownMenuSeparator className="dark:bg-gray-800" />
          <DropdownMenuGroup className="flex flex-col gap-0  ">
            <DropdownMenuItem
              className="focus:bg-transparent px-0 py-0 "
              onSelect={(event) => event.preventDefault()}
            >
              <div className="w-full shadow-lg rounded-md px-3 py-1 font-medium text-gray-500 dark:text-gray-300">
                <p className="dark:text-white">Max Price</p>
                <div className="flex justify-between items-center gap-2">
                  <p className="text-center dark:text-gray-300">0</p>
                  <Input
                    type="range"
                    min="0"
                    max="10"
                    value={sliderValue}
                    onChange={(e) =>
                      setSliderValue(Math.round(Number(e.target.value)))
                    }
                    className="w-full custom-slider dark:bg-gray-800"
                    ref={setSliderElement}
                  />
                  <p className="text-center flex dark:text-gray-300">$&nbsp;{sliderValue}</p>
                </div>
                <div className="w-full flex justify-center items-center  gap-3 mt-2">
                  <Button
                    className="bg-teal-600 dark:bg-teal-700 text-sm hover:bg-teal-700 dark:hover:bg-teal-600 h-8 text-white"
                    onClick={handleApply}
                  >
                    Apply
                  </Button>
                  <Button
                    className="bg-slate-500 dark:bg-slate-600 text-sm hover:bg-slate-700 dark:hover:bg-slate-500 h-8 text-white"
                    onClick={handleClear}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default ProductFilterDropdown;
