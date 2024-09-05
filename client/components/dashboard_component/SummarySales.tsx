import Image from "next/image";
import React from "react";
import CardSummary from "./CardSummary";

const SummarySales = () => {
  return (
    <div className="relative flex mt-3 gap-5">
      <CardSummary
        colorTheme="blue" // First card set to blue
        backgroundImageSrc="/assets/backgroundcard-blue.svg"
        title="Overall Revenue"
        value="$25,912"
        iconSrc="/assets/dollar.svg"
        iconBackgroundColor="green"
      />
      <CardSummary
        colorTheme="red" // Second card set to red
        backgroundImageSrc="/assets/backgroundcard-red.svg"
        title="Orders"
        value="36,894"
        iconSrc="/assets/bag.svg"
        iconBackgroundColor="purple" // Changed to white for better contrast
      />
      <CardSummary
        colorTheme="orange" // Third card set to yellow
        backgroundImageSrc="/assets/backgroundcard-yellow.svg"
        title="Customers"
        value="183.35M"
        iconSrc="/assets/customer.svg"
        iconBackgroundColor="black" // Changed to black for better contrast
      />
      <CardSummary
        colorTheme="green" // Fourth card set to green
        backgroundImageSrc="/assets/backgroundcard-green.svg"
        title="Profit"
        value="$165.89K"
        iconSrc="/assets/profit.svg"
        iconBackgroundColor="yellow" // Changed to white for better contrast
      />
    </div>
  );
};

export default SummarySales;
