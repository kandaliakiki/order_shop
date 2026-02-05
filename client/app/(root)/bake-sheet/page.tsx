"use client";

import React, { useState, useEffect } from "react";
import MobileHeader from "@/components/layout_components/MobileHeader";
import { format, startOfDay, endOfDay, addDays } from "date-fns";

interface BakeSheet {
  _id?: string;
  sheetId?: string;
  date: string;
  dateRange: {
    start: string;
    end: string;
  };
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
  }>;
  ingredientRequirements?: Array<{
    ingredientId: string;
    quantity: number;
    unit: string;
  }>;
  stockChecks?: Array<{
    name: string;
    needed: number;
    available: number;
    unit: string;
    sufficient: boolean;
    recommendedLots?: Array<{
      lotId: string;
      lotNumber: string;
      currentStock: number;
      expiryDate: string;
      purchaseDate?: string;
      isExpiringSoon: boolean;
      isExpired: boolean;
    }>;
    totalAvailable: number;
  }>;
  totalOrders: number;
  dailyBreakdown?: Array<{
    date: string;
    orders: number;
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
    }>;
    ingredientRequirements?: Array<{
      ingredientId: string;
      ingredientName: string;
      quantity: number;
      unit: string;
    }>;
  }>;
  status?: "draft" | "confirmed" | "completed";
  createdAt?: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "http://localhost:8080";

export default function BakeSheetPage() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [activeButton, setActiveButton] = useState<"today" | "tomorrow" | null>("today"); // Default to today
  const [bakeSheets, setBakeSheets] = useState<BakeSheet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch bake sheets for selected date range
  useEffect(() => {
    fetchBakeSheets();
  }, [startDate, endDate]);

  const fetchBakeSheets = async () => {
    setLoading(true);
    setError(null);
    try {
      const startDateString = format(startDate, "yyyy-MM-dd");
      const endDateString = format(endDate, "yyyy-MM-dd");
      // Use new simple fetch endpoint (real-time, no document storage)
      const response = await fetch(
        `${BACKEND_URL}/api/bakesheet/generate?startDate=${startDateString}&endDate=${endDateString}`
      );
      if (!response.ok) throw new Error("Failed to fetch bake sheets");
      const data = await response.json();
      // Convert single bake sheet to array format for compatibility
      setBakeSheets([data]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTodayClick = () => {
    const today = new Date();
    setStartDate(today);
    setEndDate(today);
    setActiveButton("today");
  };

  const handleTomorrowClick = () => {
    const tomorrow = addDays(new Date(), 1);
    setStartDate(tomorrow);
    setEndDate(tomorrow);
    setActiveButton("tomorrow");
  };

  const handleDateChange = (isStartDate: boolean, newDate: Date) => {
    if (isStartDate) {
      setStartDate(newDate);
    } else {
      // Ensure end date is not before start date
      if (newDate < startDate) {
        setEndDate(startDate);
      } else {
        setEndDate(newDate);
      }
    }
    // Clear button highlight when manually changing dates
    setActiveButton(null);
  };

  return (
    <div className="md:p-5 md:px-4">
      <MobileHeader title="Daily Bake Sheet" />
      
      <div className="flex flex-col gap-6">
        {/* Date Range Picker */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm max-w-4xl border border-gray-200 dark:border-gray-800">
          <label className="block text-sm font-medium mb-3 dark:text-white">Select Date Range</label>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={format(startDate, "yyyy-MM-dd")}
                    onChange={(e) => handleDateChange(true, new Date(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={format(endDate, "yyyy-MM-dd")}
                    onChange={(e) => handleDateChange(false, new Date(e.target.value))}
                    min={format(startDate, "yyyy-MM-dd")}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
            {/* Quick Action Buttons - Beside date inputs on desktop, below on mobile */}
            <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleTodayClick}
                    className={`px-4 py-2 text-sm rounded-md transition-colors font-medium ${
                      activeButton === "today"
                        ? "bg-sky-950 dark:bg-blue-600 text-white border border-sky-950 dark:border-blue-600"
                        : "bg-blue-50 dark:bg-gray-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-gray-700 hover:bg-blue-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={handleTomorrowClick}
                    className={`px-4 py-2 text-sm rounded-md transition-colors font-medium ${
                      activeButton === "tomorrow"
                        ? "bg-sky-950 dark:bg-blue-600 text-white border border-sky-950 dark:border-blue-600"
                        : "bg-blue-50 dark:bg-gray-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-gray-700 hover:bg-blue-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    Tomorrow
                  </button>
            </div>
          </div>
        </div>

        {/* Selected Date Details */}
        {loading ? (
          <div className="text-center py-8 dark:text-gray-300">Loading...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600 dark:text-red-400">{error}</div>
        ) : bakeSheets.length > 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">
              {startDate.getTime() === endDate.getTime()
                ? format(startDate, "MMMM dd, yyyy")
                : `${format(startDate, "MMM dd, yyyy")} - ${format(endDate, "MMM dd, yyyy")}`}
            </h3>
            {bakeSheets.map((sheet, idx) => (
              <div key={sheet._id || `sheet-${idx}`} className="space-y-4">
                {/* Daily Breakdown (show when date range is selected and breakdown exists) */}
                {startDate.getTime() !== endDate.getTime() && sheet.dailyBreakdown && sheet.dailyBreakdown.length > 0 ? (
                  <div>
                    <h4 className="font-medium mb-3 dark:text-white">Daily Product Breakdown</h4>
                    <div className="space-y-4">
                      {sheet.dailyBreakdown.map((day, dayIdx) => (
                        <div key={dayIdx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-semibold text-gray-800 dark:text-white">
                              {format(new Date(day.date), "MMM dd, yyyy")}
                            </h5>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{day.orders} order(s)</span>
                          </div>
                          <div className="space-y-1 mt-2">
                            {day.items.length > 0 ? (
                              <>
                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Products:</p>
                                {day.items.map((item, itemIdx) => (
                                  <div key={itemIdx} className="flex justify-between p-2 bg-white dark:bg-gray-900 rounded text-sm border border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-900 dark:text-gray-100">{item.productName}</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{item.quantity}</span>
                                  </div>
                                ))}
                              </>
                            ) : (
                              <p className="text-sm text-gray-500 dark:text-gray-400">No products needed</p>
                            )}
                            {day.ingredientRequirements && day.ingredientRequirements.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-700">
                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Ingredients Needed:</p>
                                {day.ingredientRequirements.map((ing, ingIdx) => (
                                  <div key={ingIdx} className="flex justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm border border-blue-200 dark:border-blue-800">
                                    <span className="text-gray-900 dark:text-blue-200">{ing.ingredientName}</span>
                                    <span className="font-medium text-gray-900 dark:text-blue-200">{ing.quantity} {ing.unit}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                
                {/* Overall Products Needed (always show) */}
                <div>
                  <h4 className="font-medium mb-2 dark:text-white">Overall Products Needed</h4>
                  <div className="space-y-2">
                    {sheet.items.length > 0 ? (
                      sheet.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                          <span className="text-gray-900 dark:text-gray-100">{item.productName}</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{item.quantity}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No products needed</p>
                    )}
                  </div>
                </div>

                {sheet.stockChecks && sheet.stockChecks.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 dark:text-white">Ingredient Stock Status</h4>
                    <div className="space-y-2">
                      {sheet.stockChecks.map((check, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded ${
                            check.sufficient
                              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                              : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold dark:text-white">{check.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                Need: {check.needed} {check.unit} | Available: {check.available} {check.unit}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                check.sufficient
                                  ? "bg-green-200 text-green-800"
                                  : "bg-red-200 text-red-800"
                              }`}
                            >
                              {check.sufficient ? "✓ Sufficient" : "✗ Insufficient"}
                            </span>
                          </div>
                          {/* Recommended Lots */}
                          {check.recommendedLots && check.recommendedLots.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-700">
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Recommended Lots (FEFO):</p>
                              <div className="space-y-1">
                                {check.recommendedLots.slice(0, 3).map((lot, lotIdx) => (
                                  <div
                                    key={lotIdx}
                                    className={`text-xs p-2 rounded ${
                                      lot.isExpired
                                        ? "bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800"
                                        : lot.isExpiringSoon
                                        ? "bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-800"
                                        : "bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
                                    }`}
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className="font-mono font-medium dark:text-gray-200">{lot.lotNumber}</span>
                                      <span className="text-gray-600 dark:text-gray-300">
                                        {lot.currentStock} {check.unit}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                      <span className="text-gray-500 dark:text-gray-400">
                                        Exp: {format(new Date(lot.expiryDate), "MMM dd")}
                                      </span>
                                      {lot.isExpired && (
                                        <span className="text-red-600 dark:text-red-400 font-medium">Expired</span>
                                      )}
                                      {lot.isExpiringSoon && !lot.isExpired && (
                                        <span className="text-orange-600 dark:text-orange-400 font-medium">Expiring Soon</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                                {check.recommendedLots.length > 3 && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    +{check.recommendedLots.length - 3} more lots
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <span
                    className={`px-3 py-1 rounded text-sm ${
                      sheet.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : sheet.status === "confirmed"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {sheet.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No bake sheet found for{" "}
            {startDate.getTime() === endDate.getTime()
              ? format(startDate, "MMMM dd, yyyy")
              : `${format(startDate, "MMM dd, yyyy")} - ${format(endDate, "MMM dd, yyyy")}`}
          </div>
        )}
      </div>
    </div>
  );
}
