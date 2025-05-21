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
            className={`flex w-24 bg-white rounded-md h-7 items-center justify-center 
        gap-1 border-2 cursor-pointer ${
          isApplied ? "text-teal-600 border-teal-600" : "border-gray-300"
        }`}
          >
            <Image
              src={
                isApplied ? "/assets/filter-active.svg" : "/assets/filter.svg"
              }
              alt="filter icon"
              width={20}
              height={20}
            />
            <p className="">Filter</p>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-64 px-0 py-0"
          side="bottom"
          align="end"
        >
          <DropdownMenuLabel>Filter</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup className="flex flex-col gap-0  ">
            <DropdownMenuItem
              className="focus:bg-transparent px-0 py-0 "
              onSelect={(event) => event.preventDefault()}
            >
              <div className="w-full shadow-lg rounded-md px-3 py-1 font-medium text-gray-500">
                <p>Max Price</p>
                <div className="flex justify-between items-center gap-2">
                  <p className="text-center">0</p>
                  <Input
                    type="range"
                    min="0"
                    max="10"
                    value={sliderValue}
                    onChange={(e) =>
                      setSliderValue(Math.round(Number(e.target.value)))
                    }
                    className="w-full custom-slider"
                    ref={setSliderElement}
                  />
                  <p className="text-center flex">$&nbsp;{sliderValue}</p>
                </div>
                <div className="w-full flex justify-center items-center  gap-3 mt-2">
                  <Button
                    className="bg-teal-600 text-sm hover:bg-teal-700 h-8"
                    onClick={handleApply}
                  >
                    Apply
                  </Button>
                  <Button
                    className="bg-slate-500 text-sm hover:bg-slate-700 h-8"
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
