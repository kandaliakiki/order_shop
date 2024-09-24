import React from "react";

const ProductListTableView = () => {
  return (
    <div className="overflow-x-auto mt-5 scrollbar-hide rounded-xl">
      <table className="min-w-full bg-white ">
        <thead className="    ">
          <tr className="text-lg text-left  bg-slate-100  sticky top-0 z-10 ">
            <th className="py-4 px-4 th-border "></th>
            <th className="py-4 px-4 th-border ">Product ID</th>
            <th className="py-4 px-4 th-border">Image</th>
            <th className="py-4 px-4 th-border">Name</th>
            <th className="py-4 px-4 th-border">Category</th>
            <th className="py-4 px-4 th-border">Price</th>
          </tr>
        </thead>
        {/* <tbody>
          {ordersTableData.map((order, index) => (
            <tr key={index} className="">
              <td className="py-4 px-4 border-b">{order.id}</td>
              <td className="py-4 px-4 border-b">{order.customer}</td>
              <td className="py-4 px-4 border-b">{order.product}</td>
              <td className="py-4 px-4 border-b">{order.amount}</td>
              <td className="py-4 px-4 border-b">{order.vendor}</td>
              <td className="py-4 px-4 border-b">
                <span
                  className={`px-2 py-1 rounded ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </td>
              <td className="py-2 px-4 border-b">{order.rating}</td>
            </tr>
          ))}
        </tbody> */}
      </table>
    </div>
  );
};

export default ProductListTableView;
