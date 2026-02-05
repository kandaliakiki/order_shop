"use client";

import React, { useState, useEffect } from "react";
import { format, differenceInDays } from "date-fns";
import Link from "next/link";

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

export default function ExpiringIngredientsWidget() {
  const [expiringIngredients, setExpiringIngredients] = useState<ExpiringIngredient[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExpiringIngredients();
  }, []);

  const fetchExpiringIngredients = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/expiry?days=7&limit=5`);
      if (response.ok) {
        const data = await response.json();
        setExpiringIngredients(data);
      }
    } catch (error) {
      console.error("Error fetching expiring ingredients:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (daysLeft: number) => {
    if (daysLeft <= 1) return "text-red-600";
    if (daysLeft <= 3) return "text-orange-600";
    return "text-yellow-600";
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Expiring Ingredients</h3>
        <Link
          href="/expiry"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          View All
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-4 text-gray-500">Loading...</div>
      ) : expiringIngredients.length > 0 ? (
        <div className="space-y-2">
          {expiringIngredients.map((item) => (
            <div
              key={item.lotId}
              className="flex justify-between items-center p-2 bg-gray-50 rounded"
            >
              <div className="flex-1">
                <p className="font-medium text-sm">{item.ingredientName}</p>
                <p className="text-xs text-gray-600">
                  {item.quantity} {item.unit}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${getUrgencyColor(item.daysLeft)}`}>
                  {item.daysLeft} {item.daysLeft === 1 ? "day" : "days"}
                </p>
                <p className="text-xs text-gray-500">
                  {format(new Date(item.expiryDate), "MMM dd")}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500 text-sm">
          ✅ No ingredients expiring in the next 7 days
        </div>
      )}
    </div>
  );
}
