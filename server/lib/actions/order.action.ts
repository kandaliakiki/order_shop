import { connectToDB } from "../mongoose";
import Order, { OrderData } from "../models/order.model";
// Function to fetch all orders
export const fetchOrders = async (limit: number = 0) => {
  await connectToDB();

  try {
    const query = Order.find().sort({ createdAt: -1 });
    if (limit > 0) {
      query.limit(limit);
    }
    const orders = await query;
    return orders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};
// Function to create a new order
export const createOrder = async (orderData: OrderData) => {
  await connectToDB();

  try {
    const order = new Order(orderData);
    await order.save();
    return order;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Function to update the status of an order
export const updateOrderStatus = async (orderId: string, newStatus: string) => {
  await connectToDB();

  try {
    const order = await Order.findOneAndUpdate(
      { orderId },
      { status: newStatus },
      { new: true }
    );
    if (!order) {
      throw new Error("Order not found");
    }
    return order;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

// Function to search orders by customer name
export const searchOrdersByCustomerName = async (customerName: string) => {
  await connectToDB();

  try {
    const orders = await Order.find({
      customerName: { $regex: new RegExp(customerName, "i") }, // Case-insensitive search
    }).sort({ createdAt: -1 }); // Sort by createdAt in descending order
    return orders;
  } catch (error) {
    console.error("Error searching orders by customer name:", error);
    throw error;
  }
};

export const fetchOverallRevenue = async () => {
  const orders = await Order.find();
  return orders.reduce((sum, order) => sum + order.total, 0);
};

export const countTotalOrders = async () => {
  return await Order.countDocuments();
};

export const calculateTotalItemsSold = async () => {
  const orders = await Order.find();
  return orders.reduce((sum, order) => {
    return (
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0)
    );
  }, 0);
};
