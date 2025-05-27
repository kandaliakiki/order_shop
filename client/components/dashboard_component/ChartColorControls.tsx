"use client";

import React from "react";
import { useDashboardContext } from "@/components/dashboard_component/DashboardContext";
import { Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const chartColors = {
  purple: "#8884d8",
  blue: "#0000ff",
  green: "#82ca9d",
  orange: "#ffa500",
  red: "#ff0000",
  teal: "#008080",
  pink: "#ff69b4",
  indigo: "#4b0082",
};

const ChartColorControls = () => {
  const { chartColor, setChartColor } = useDashboardContext();

  return (
    <div className="flex gap-1 text-sm   min-w-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className=" rounded-lg p-2 flex justify-center items-center bg-gray-200 ">
            <Settings className="h-6 w-6" />
            <span className="sr-only">Chart settings</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <div className="px-3 py-2 text-sm font-medium">Chart Color</div>
          {Object.entries(chartColors).map(([colorName, colorValue]) => (
            <DropdownMenuItem
              key={colorName}
              onClick={() => setChartColor(colorValue)}
              className="flex items-center gap-2"
            >
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: colorValue }}
                aria-hidden="true"
              />
              <span className="capitalize">{colorName}</span>
              {chartColor === colorValue && (
                <svg
                  className="ml-auto h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ChartColorControls;
