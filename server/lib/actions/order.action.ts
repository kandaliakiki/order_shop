import { connectToDB } from "../mongoose";
import Order, { OrderData } from "../models/order.model";
import { StockDeductionService } from "../services/stockDeduction.service";
import { StockReservationService } from "../services/stockReservation.service";
import { IngredientStockCalculationService } from "../services/ingredientStockCalculation.service";
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
    const order = await Order.findOne({ orderId });
    if (!order) {
      throw new Error("Order not found");
    }

    const oldStatus = order.status;

    // Update order status
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId },
      { status: newStatus },
      { new: true }
    );

    // Handle stock operations based on status change
    if (oldStatus !== newStatus) {
      const stockCalculationService = new IngredientStockCalculationService();
      const stockCalculation = await stockCalculationService.calculateOrderIngredientRequirements(order);

      // When changing to "On Process": Deduct stock (from reserved stock)
      if (newStatus === "On Process" && oldStatus !== "On Process") {
        const stockDeductionService = new StockDeductionService();
        const deductionResult = await stockDeductionService.deductStockForOrder(
          stockCalculation.requirements
        );

        if (deductionResult.success) {
          // Release reserved stock (since we're now deducting actual stock)
          const stockReservationService = new StockReservationService();
          await stockReservationService.releaseReservedStock(stockCalculation.requirements);

          // Store lot usage metadata if available
          if (deductionResult.lotUsageMetadata) {
            await Order.findOneAndUpdate(
              { orderId },
              { lotUsageMetadata: deductionResult.lotUsageMetadata },
              { new: true }
            );
          }
          console.log(`✅ Order ${orderId} status changed to "On Process", stock deducted from reserved stock`);
        } else {
          console.warn(`⚠️ Failed to deduct stock for order ${orderId} when changing to "On Process"`);
        }
      }

      // When changing to "Cancelled": Release reserved stock
      if (newStatus === "Cancelled" && oldStatus !== "Cancelled") {
        const stockReservationService = new StockReservationService();
        const releaseResult = await stockReservationService.releaseReservedStock(
          stockCalculation.requirements
        );
        if (releaseResult.success) {
          console.log(`✅ Order ${orderId} cancelled, reserved stock released`);
        } else {
          console.warn(`⚠️ Failed to release reserved stock for cancelled order ${orderId}`);
        }
      }
    }

    return updatedOrder;
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

// Function to fetch order by orderId with populated product data
export const fetchOrderById = async (orderId: string) => {
  await connectToDB();

  try {
    const order = await Order.findOne({ orderId }).populate(
      "whatsappMessageId"
    );

    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    throw error;
  }
};