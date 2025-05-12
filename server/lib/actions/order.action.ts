import { connectToDB } from "../mongoose";
import Order, { OrderData } from "../models/order.model";
// Function to fetch all orders
export const fetchOrders = async (
  limit: number = 0,
  dateRange?: { from: Date; to: Date }
) => {
  await connectToDB();

  try {
    const query = Order.find();

    // Apply date range filter if provided
    if (dateRange && dateRange.from && dateRange.to) {
      query
        .where("createdAt")
        .gte(dateRange.from.getTime())
        .lte(dateRange.to.getTime());
    }

    query.sort({ createdAt: -1 });

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
export const searchOrdersByCustomerName = async (
  customerName: string,
  dateRange?: { from: Date; to: Date }
) => {
  await connectToDB();

  try {
    const query = Order.find({
      customerName: { $regex: new RegExp(customerName, "i") }, // Case-insensitive search
    });

    // Apply date range filter if provided
    if (dateRange && dateRange.from && dateRange.to) {
      query
        .where("createdAt")
        .gte(dateRange.from.getTime())
        .lte(dateRange.to.getTime());
    }

    const orders = await query.sort({ createdAt: -1 }); // Sort by createdAt in descending order
    return orders;
  } catch (error) {
    console.error("Error searching orders by customer name:", error);
    throw error;
  }
};

export const fetchOverallRevenue = async (dateRange?: {
  from: Date;
  to: Date;
}) => {
  await connectToDB();

  try {
    const query = Order.find();

    // Apply date range filter if provided
    if (dateRange && dateRange.from && dateRange.to) {
      query
        .where("createdAt")
        .gte(dateRange.from.getTime())
        .lte(dateRange.to.getTime());
    }

    const orders = await query;
    return orders.reduce((sum, order) => sum + order.total, 0);
  } catch (error) {
    console.error("Error fetching overall revenue:", error);
    throw error;
  }
};

export const countTotalOrders = async (dateRange?: {
  from: Date;
  to: Date;
}) => {
  await connectToDB();

  try {
    const query = Order.find();

    // Apply date range filter if provided
    if (dateRange && dateRange.from && dateRange.to) {
      query
        .where("createdAt")
        .gte(dateRange.from.getTime())
        .lte(dateRange.to.getTime());
    }

    return await query.countDocuments();
  } catch (error) {
    console.error("Error counting total orders:", error);
    throw error;
  }
};

export const calculateTotalItemsSold = async (dateRange?: {
  from: Date;
  to: Date;
}) => {
  await connectToDB();

  try {
    const query = Order.find();

    // Apply date range filter if provided
    if (dateRange && dateRange.from && dateRange.to) {
      query
        .where("createdAt")
        .gte(dateRange.from.getTime())
        .lte(dateRange.to.getTime());
    }

    const orders = await query;
    return orders.reduce((sum, order) => {
      return (
        sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0)
      );
    }, 0);
  } catch (error) {
    console.error("Error calculating total items sold:", error);
    throw error;
  }
};
