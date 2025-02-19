import { connectToDB } from "../mongoose";
import Order from "../models/order.model";

// Function to fetch all orders
export const fetchOrders = async () => {
  await connectToDB();

  try {
    const orders = await Order.find({});
    return orders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};
