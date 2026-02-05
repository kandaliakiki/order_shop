"use client";

import React, { useEffect, useState } from "react";
import { useDashboardContext } from "@/components/dashboard_component/DashboardContext";

interface ProductData {
  name: string;
  quantity: number;
}

const ProductPerformanceMetrics = () => {
  const { orders } = useDashboardContext();
  const [totalProductsSold, setTotalProductsSold] = useState(0);
  const [topProduct, setTopProduct] = useState<ProductData | null>(null);
  const [uniqueProductsCount, setUniqueProductsCount] = useState(0);

  useEffect(() => {
    const productMap = new Map<string, number>();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (productMap.has(item.name)) {
          productMap.set(item.name, productMap.get(item.name)! + item.quantity);
        } else {
          productMap.set(item.name, item.quantity);
        }
      });
    });

    const data = Array.from(productMap, ([name, quantity]) => ({
      name,
      quantity,
    }));

    const totalSold = data.reduce((sum, product) => sum + product.quantity, 0);
    setTotalProductsSold(totalSold);

    const top = data.reduce(
      (prev, current) => (prev.quantity > current.quantity ? prev : current),
      { name: "", quantity: 0 }
    );
    setTopProduct(top);

    setUniqueProductsCount(data.length);
  }, [orders]);

  return (
    <div className="flex w-full justify-between mt-5 border-dashed border-2 border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 py-3">
      <div className="flex flex-col items-center justify-center w-full border-dashed border-r-2 border-gray-200 dark:border-gray-700">
        <p className="lg:text-xl text-lg dark:text-white">{totalProductsSold}</p>
        <p className="text-neutral-400 dark:text-gray-400 lg:text-base text-sm text-center">
          Total Products Sold
        </p>
      </div>
      <div className="flex flex-col items-center justify-center w-full border-dashed border-r-2 border-gray-200 dark:border-gray-700">
        <p className="lg:text-xl text-lg dark:text-white">
          {topProduct?.name} ({topProduct?.quantity})
        </p>
        <p className="text-neutral-400 dark:text-gray-400 lg:text-base text-sm text-center">
          Top Product
        </p>
      </div>
      <div className="flex flex-col items-center justify-center w-full border-gray-200 dark:border-gray-700">
        <p className="lg:text-xl text-lg dark:text-white">{uniqueProductsCount}</p>
        <p className="text-neutral-400 dark:text-gray-400 lg:text-base text-sm text-center">
          Unique Products Sold
        </p>
      </div>
    </div>
  );
};

export default ProductPerformanceMetrics;
