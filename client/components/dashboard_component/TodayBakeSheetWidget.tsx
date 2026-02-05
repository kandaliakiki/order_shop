"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import Link from "next/link";

interface BakeSheet {
  _id: string;
  sheetId: string;
  date: string;
  items: Array<{
    productName: string;
    quantity: number;
  }>;
  stockChecks?: Array<{
    name: string;
    sufficient: boolean;
  }>;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "http://localhost:8080";

export default function TodayBakeSheetWidget() {
  const [bakeSheet, setBakeSheet] = useState<BakeSheet | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTodayBakeSheet();
  }, []);

  const fetchTodayBakeSheet = async () => {
    setLoading(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const response = await fetch(`${BACKEND_URL}/api/bakesheet?date=${today}`);
      if (response.ok) {
        const data = await response.json();
        // Find today's sheet
        const todaySheet = data.find(
          (sheet: BakeSheet) => sheet.date === today || sheet.dateRange?.start === today
        );
        setBakeSheet(todaySheet || null);
      }
    } catch (error) {
      console.error("Error fetching today's bake sheet:", error);
    } finally {
      setLoading(false);
    }
  };

  const hasInsufficientStock =
    bakeSheet?.stockChecks?.some((check) => !check.sufficient) || false;
  const totalProducts = bakeSheet?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Today's Bake Sheet</h3>
        <Link
          href="/bake-sheet"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          View All
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-4 text-gray-500">Loading...</div>
      ) : bakeSheet ? (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Products:</span>
            <span className="font-semibold">{totalProducts}</span>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Products Needed:</p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {bakeSheet.items.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.productName}</span>
                  <span className="font-medium">{item.quantity}</span>
                </div>
              ))}
              {bakeSheet.items.length > 5 && (
                <p className="text-xs text-gray-500">
                  +{bakeSheet.items.length - 5} more
                </p>
              )}
            </div>
          </div>

          {hasInsufficientStock && (
            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              ⚠️ Some ingredients insufficient
            </div>
          )}

          {!hasInsufficientStock && bakeSheet.items.length > 0 && (
            <div className="p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
              ✅ All ingredients sufficient
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500 text-sm">
          No bake sheet for today
        </div>
      )}
    </div>
  );
}
