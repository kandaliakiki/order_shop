import Image from "next/image";
import React from "react";
import CardSummary from "./CardSummary";

const SummarySales = async () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
  const response = await fetch(`${backendUrl}/api/dashboardMetrics`, {
    cache: "no-store",
  });
  const { overallRevenue, totalOrders, totalItemsSold, profit } =
    await response.json();
  return (
    <div className="relative flex mt-3 gap-5">
      <CardSummary
        colorTheme="blue" // First card set to blue
        backgroundImageSrc="/assets/backgroundcard-blue.svg"
        title="Overall Revenue"
        value={`$${overallRevenue}`} // Add $ to revenue
        iconSrc="/assets/dollar.svg"
        iconBackgroundColor="green"
      />
      <CardSummary
        colorTheme="red" // Second card set to red
        backgroundImageSrc="/assets/backgroundcard-red.svg"
        title="Orders"
        value={totalOrders}
        iconSrc="/assets/bag.svg"
        iconBackgroundColor="purple" // Changed to white for better contrast
      />
      <CardSummary
        colorTheme="orange" // Third card set to yellow
        backgroundImageSrc="/assets/backgroundcard-yellow.svg"
        title="Customers"
        value={totalItemsSold}
        iconSrc="/assets/customer.svg"
        iconBackgroundColor="black" // Changed to black for better contrast
      />
      <CardSummary
        colorTheme="green" // Fourth card set to green
        backgroundImageSrc="/assets/backgroundcard-green.svg"
        title="Profit"
        value={`$${profit}`} // Add $ to profit
        iconSrc="/assets/profit.svg"
        iconBackgroundColor="yellow" // Changed to white for better contrast
      />
    </div>
  );
};

export default SummarySales;
