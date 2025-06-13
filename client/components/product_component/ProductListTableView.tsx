import React from "react";
import FetchedProductRowsDesktop from "./FetchedProductRowsDesktop";
import { useProducts } from "./ProductContext";
import { Checkbox } from "../ui/checkbox";
import FetchedProductRowsMobile from "./FetchedProductRowsMobile";

const ProductListTableView = () => {
  const { products, selectedProducts, setSelectedProducts } = useProducts();
  // Check if all products are selected
  const allSelected =
    products.length > 0 && selectedProducts.length === products.length;

  // Toggle all products selection
  const toggleAllSelection = () => {
    if (allSelected) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((product) => product._id));
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-12 px-4 py-3 text-left">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAllSelection}
                  className="bg-white border-gray-300"
                />
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-900">
                Product ID
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-900">
                Image
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-900">
                Name
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-900">
                Category
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-900">
                Price
              </th>
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <FetchedProductRowsDesktop></FetchedProductRowsDesktop>
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={allSelected}
              onCheckedChange={toggleAllSelection}
              className="bg-white border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">
              Select All
            </span>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          <FetchedProductRowsMobile></FetchedProductRowsMobile>
        </div>
      </div>
    </div>
  );
};

export default ProductListTableView;
