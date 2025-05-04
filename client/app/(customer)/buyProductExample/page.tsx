import BuyProductForm from "@/components/customer_buyProduct_component/BuyProductForm";
import BuyProductSection from "@/components/customer_buyProduct_component/BuyProductSection";
import { RestaurantOrderingInterface } from "@/components/customer_buyProduct_component/restaurant-ordering-interface";
import React from "react";

const page = () => {
  return (
    <div>
      <RestaurantOrderingInterface></RestaurantOrderingInterface>
    </div>
  );
};

export default page;
