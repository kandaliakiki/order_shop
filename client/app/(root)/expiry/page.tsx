"use client";

import React, { useState, useEffect } from "react";
import MobileHeader from "@/components/layout_components/MobileHeader";
import { format, differenceInDays } from "date-fns";

interface ExpiringIngredient {
  lotId: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  daysLeft: number;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "http://localhost:8080";

export default function ExpiryPage() {
  const [expiringIngredients, setExpiringIngredients] = useState<ExpiringIngredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [daysFilter, setDaysFilter] = useState(7);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchExpiringIngredients();
  }, [daysFilter]);

  const fetchExpiringIngredients = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/expiry?days=${daysFilter}&limit=50`);
      if (!response.ok) throw new Error("Failed to fetch expiring ingredients");
      const data = await response.json();
      setExpiringIngredients(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredIngredients = expiringIngredients.filter((item) =>
    item.ingredientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUrgencyColor = (daysLeft: number) => {
    if (daysLeft <= 1) return "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800 text-red-800 dark:text-red-300";
    if (daysLeft <= 3) return "bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-800 text-orange-800 dark:text-orange-300";
    return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300";
  };

  return (
    <div className="md:p-5 md:px-4">
      <MobileHeader title="Ingredient Expiry" />
      
      <div className="flex flex-col gap-4">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">
                Expiring Within (days)
              </label>
              <select
                value={daysFilter}
                onChange={(e) => setDaysFilter(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value={1}>1 day</option>
                <option value={3}>3 days</option>
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">Search</label>
              <input
                type="text"
                placeholder="Search ingredient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-8 dark:text-gray-300">Loading...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600 dark:text-red-400">{error}</div>
        ) : filteredIngredients.length > 0 ? (
          <div className="space-y-3">
            {filteredIngredients.map((item) => (
              <div
                key={item.lotId}
                className={`rounded-lg p-4 shadow-sm border-2 ${getUrgencyColor(
                  item.daysLeft
                )}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg dark:text-white">{item.ingredientName}</h3>
                    <p className="text-sm mt-1 dark:text-gray-300">
                      {item.quantity} {item.unit}
                    </p>
                    <p className="text-sm mt-1 dark:text-gray-300">
                      Expires: {format(new Date(item.expiryDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        item.daysLeft <= 1
                          ? "bg-red-500 dark:bg-red-600 text-white"
                          : item.daysLeft <= 3
                          ? "bg-orange-500 dark:bg-orange-600 text-white"
                          : "bg-yellow-500 dark:bg-yellow-600 text-white"
                      }`}
                    >
                      {item.daysLeft} {item.daysLeft === 1 ? "day" : "days"} left
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {searchTerm
              ? "No ingredients found matching your search"
              : `No ingredients expiring within ${daysFilter} days`}
          </div>
        )}
      </div>
    </div>
  );
}
