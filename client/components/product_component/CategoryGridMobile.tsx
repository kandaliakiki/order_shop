import React, { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import useCategorySelection from "./useCategorySelection";

const CategoryGridMobile = ({ isAdmin }: { isAdmin: boolean }) => {
  const {
    selectedCategory,
    setSelectedCategory,
    filteredCategories,
    currentCategory,
    getProductCountByCategoryId,
    setCurrentCategory,
    ALL_CATEGORIES,
  } = useCategorySelection(isAdmin);

  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(
    {}
  );

  useEffect(() => {
    const fetchCounts = async () => {
      const counts: Record<string, number> = {};
      // Get count for ALL_CATEGORIES
      counts[ALL_CATEGORIES._id] = await getProductCountByCategoryId(
        ALL_CATEGORIES._id
      );

      // Get counts for other categories
      for (const category of filteredCategories) {
        counts[category._id] = await getProductCountByCategoryId(category._id);
      }
      setCategoryCounts(counts);
    };

    fetchCounts();
  }, [filteredCategories, getProductCountByCategoryId]);

  return (
    <div className="max-md:px-4   pb-2">
      <label className="max-md:text-sm text-lg font-medium text-gray-700 dark:text-gray-300 mb-1 block text-left">
        Category
      </label>
      <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-900">
        <div className="grid grid-cols-2 gap-2">
          <button
            key={ALL_CATEGORIES._id}
            onClick={() => {
              setCurrentCategory(ALL_CATEGORIES._id);
              setSelectedCategory(ALL_CATEGORIES._id);
            }}
            className={cn(
              "flex items-center gap-2 p-2 rounded-md text-left text-xs transition-colors",
              currentCategory._id === ALL_CATEGORIES._id
                ? "bg-teal-600 dark:bg-teal-700 text-white"
                : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
            )}
          >
            <Image
              src="/assets/bakeries.png"
              alt="category icon"
              width={20}
              height={20}
              className="mr-2"
            />
            <div className="flex-1 min-w-0">
              <div className="truncate font-medium">{ALL_CATEGORIES.name}</div>
              <div
                  className={cn(
                    "text-xs",
                    currentCategory._id === ALL_CATEGORIES._id
                      ? "text-teal-100"
                      : "text-gray-500 dark:text-gray-400"
                  )}
              >
                {categoryCounts[ALL_CATEGORIES._id] || 0} items
              </div>
            </div>
          </button>
          {filteredCategories.map((category) => (
            <button
              key={category._id}
              onClick={() => {
                setCurrentCategory(category._id);
                setSelectedCategory(category._id);
              }}
              className={cn(
                "flex items-center gap-2 p-2 rounded-md text-left text-xs transition-colors",
                currentCategory._id === category._id
                  ? "bg-teal-600 dark:bg-teal-700 text-white"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
              )}
            >
              <Image
                src={
                  category.imageUrl === ""
                    ? "/assets/bakeries.png"
                    : category.imageUrl
                }
                alt="category icon"
                width={20}
                height={20}
                className="mr-2"
              />
              <div className="flex-1 min-w-0">
                <div className="truncate font-medium">{category.name}</div>
                <div
                  className={cn(
                    "text-xs",
                    currentCategory._id === category._id
                      ? "text-teal-100"
                      : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  {categoryCounts[category._id] || 0} items
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryGridMobile;
