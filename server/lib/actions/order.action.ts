import { connectToDB } from "../mongoose";
import Order, { OrderData } from "../models/order.model";
import { StockDeductionService } from "../services/stockDeduction.service";
import { StockReservationService } from "../services/stockReservation.service";
import { IngredientStockCalculationService } from "../services/ingredientStockCalculation.service";
import { fetchProducts } from "./product.action";
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

/** Update delivery/pickup details of an existing order (for edit flow). */
export const updateOrderDeliveryDetails = async (
  orderId: string,
  updates: { deliveryAddress?: string; pickupDate?: Date; fulfillmentType?: "pickup" | "delivery"; pickupTime?: string }
): Promise<{ success: boolean; error?: string }> => {
  await connectToDB();
  try {
    const order = await Order.findOne({ orderId });
    if (!order) return { success: false, error: "Order not found" };
    const set: Record<string, unknown> = {};
    if (updates.deliveryAddress !== undefined) set.deliveryAddress = updates.deliveryAddress;
    if (updates.pickupDate !== undefined) set.pickupDate = updates.pickupDate;
    if (updates.fulfillmentType !== undefined) set.fulfillmentType = updates.fulfillmentType;
    if (updates.pickupTime !== undefined) set.pickupTime = updates.pickupTime;
    if (Object.keys(set).length === 0) return { success: true };
    await Order.findOneAndUpdate({ orderId }, set, { new: true });
    return { success: true };
  } catch (e: any) {
    console.error("updateOrderDeliveryDetails:", e);
    return { success: false, error: e.message };
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

/** Fetch orders for a WhatsApp number (for "edit order" flow). Recent first, non-cancelled. */
export const fetchOrdersByWhatsappNumber = async (
  whatsappNumber: string,
  options?: { limit?: number; statuses?: string[] }
) => {
  await connectToDB();
  const limit = options?.limit ?? 20;
  const statuses = options?.statuses ?? ["New Order", "Pending", "On Process", "Completed"];

  // Match as stored: Twilio sends "whatsapp:+62..."
  const orders = await Order.find({
    whatsappNumber,
    status: { $in: statuses },
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return orders;
};

const TAX_RATE = 0.1;

/** Add items to an existing order (merge by product name, recalc totals). */
export const addItemsToOrder = async (
  orderId: string,
  newItems: Array<{ name: string; quantity: number }>
): Promise<{ success: boolean; order?: any; error?: string }> => {
  await connectToDB();

  try {
    const order = await Order.findOne({ orderId });
    if (!order) {
      return { success: false, error: "Order not found" };
    }

    const products = await fetchProducts();
    const findPrice = (name: string): number | null => {
      const n = name.toLowerCase().trim();
      const p = products.find((x) => x.name.toLowerCase().trim() === n);
      return p ? p.price : null;
    };

    const existingItems = order.items || [];
    const norm = (s: string) => s.toLowerCase().trim();
    // Ensure existing items have a valid price (look up from products if missing/NaN)
    const byName = new Map<string, { name: string; quantity: number; price: number }>();
    for (const i of existingItems) {
      const price = typeof i.price === "number" && !Number.isNaN(i.price)
        ? i.price
        : findPrice(i.name);
      const numPrice = price != null ? Number(price) : 0;
      byName.set(norm(i.name), { name: i.name, quantity: i.quantity, price: numPrice });
    }

    for (const item of newItems) {
      const price = findPrice(item.name);
      if (price == null) {
        console.warn(`addItemsToOrder: product not found "${item.name}", skipping`);
        continue;
      }
      const key = norm(item.name);
      const existing = byName.get(key);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        // Use product name from catalog for consistency
        const product = products.find((x) => norm(x.name) === key);
        byName.set(key, {
          name: product ? product.name : item.name,
          quantity: item.quantity,
          price,
        });
      }
    }

    const mergedItems = Array.from(byName.values());
    const subtotal = Math.max(0, mergedItems.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 0), 0));
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    const updated = await Order.findOneAndUpdate(
      { orderId },
      { items: mergedItems, subtotal, tax, total },
      { new: true }
    );

    return { success: true, order: updated };
  } catch (error: any) {
    console.error("Error adding items to order:", error);
    return { success: false, error: error.message };
  }
};

/** Remove items from an existing order by product name (case-insensitive). Recalc totals. */
export const removeItemsFromOrder = async (
  orderId: string,
  productNamesToRemove: string[]
): Promise<{ success: boolean; order?: any; error?: string }> => {
  await connectToDB();

  try {
    const order = await Order.findOne({ orderId });
    if (!order) {
      return { success: false, error: "Order not found" };
    }

    const toRemoveSet = new Set(
      productNamesToRemove.map((n) => n.toLowerCase().trim())
    );
    const remainingItems = (order.items || []).filter(
      (i) => !toRemoveSet.has(i.name.toLowerCase().trim())
    );

    if (remainingItems.length === 0) {
      return { success: false, error: "Cannot remove all items from order" };
    }

    const subtotal = Math.max(0, remainingItems.reduce(
      (sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 0),
      0
    ));
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    const updated = await Order.findOneAndUpdate(
      { orderId },
      { items: remainingItems, subtotal, tax, total },
      { new: true }
    );

    return { success: true, order: updated };
  } catch (error: any) {
    console.error("Error removing items from order:", error);
    return { success: false, error: error.message };
  }
};