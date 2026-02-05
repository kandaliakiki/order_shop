import { fetchOrderById, updateOrderStatus } from "./order.action";
import { IngredientStockCalculationService } from "../services/ingredientStockCalculation.service";
import { StockDeductionService } from "../services/stockDeduction.service";
import { WhatsAppMessageFormatter } from "../services/whatsappMessageFormatter.service";
import { getTwilioService } from "../services/twilio.service";
import Order from "../models/order.model";

export interface OrderStockNotificationResult {
  success: boolean;
  orderId: string;
  stockCalculated: boolean;
  stockDeducted: boolean;
  notificationSent: boolean;
  orderStatusUpdated: boolean;
  errors: string[];
}

/**
 * Process stock calculation, deduction, and notification for an order
 * Can be called manually or via cronjob
 * Useful for processing pending orders after restocking
 */
export async function processOrderStockAndNotification(
  orderId: string
): Promise<OrderStockNotificationResult> {
  const errors: string[] = [];
  let stockCalculated = false;
  let stockDeducted = false;
  let notificationSent = false;
  let orderStatusUpdated = false;

  try {
    // Step 1: Fetch order
    let order = await fetchOrderById(orderId);

    if (!order.whatsappNumber) {
      return {
        success: false,
        orderId,
        stockCalculated: false,
        stockDeducted: false,
        notificationSent: false,
        orderStatusUpdated: false,
        errors: ["Order is not from WhatsApp, cannot send notification"],
      };
    }

    // Step 2: Calculate ingredient requirements
    const stockCalculationService = new IngredientStockCalculationService();
    const stockCalculation =
      await stockCalculationService.calculateOrderIngredientRequirements(order);
    stockCalculated = true;

    // Step 3: Check if sufficient now
    if (stockCalculation.allIngredientsSufficient) {
      // Deduct stock
      const stockDeductionService = new StockDeductionService();
      const deductionResult = await stockDeductionService.deductStockForOrder(
        stockCalculation.requirements
      );
      stockDeducted = deductionResult.success;

      if (deductionResult.errors.length > 0) {
        errors.push(...deductionResult.errors);
      }

      // Store lot usage metadata if available
      if (deductionResult.lotUsageMetadata) {
        await Order.findOneAndUpdate(
          { orderId },
          { lotUsageMetadata: deductionResult.lotUsageMetadata },
          { new: true }
        );
        // Refetch order to get updated lotUsageMetadata
        order = await fetchOrderById(orderId);
      }

      // Update status to "New Order" if it was "Pending"
      if (order.status === "Pending") {
        await updateOrderStatus(orderId, "New Order");
        orderStatusUpdated = true;
      }

      // Send confirmation message
      const frontendBaseUrl = process.env.FRONTEND_BASE_URL || process.env.NEXT_PUBLIC_FRONTEND_URL;
      const messageFormatter = new WhatsAppMessageFormatter();
      const message = messageFormatter.formatOrderConfirmationMessage(
        orderId,
        order.lotUsageMetadata,
        frontendBaseUrl
      );

      const twilioService = getTwilioService();
      if (order.whatsappNumber) {
        const cleanNumber = order.whatsappNumber.replace(/^whatsapp:/, "");
        await twilioService.sendWhatsAppMessage(cleanNumber, message);
        notificationSent = true;
      }

      console.log(
        `✅ Order ${orderId} processed: stock deducted, status updated, notification sent`
      );
    } else {
      // Still insufficient - send update message
      const insufficientIngredients = stockCalculation.requirements.filter(
        (r) => !r.isSufficient
      );

      const messageFormatter = new WhatsAppMessageFormatter();
      const message = messageFormatter.formatOutOfStockMessage(
        orderId,
        insufficientIngredients
      );

      const twilioService = getTwilioService();
      if (order.whatsappNumber) {
        const cleanNumber = order.whatsappNumber.replace(/^whatsapp:/, "");
        await twilioService.sendWhatsAppMessage(cleanNumber, message);
        notificationSent = true;
      }

      console.log(`⚠️ Order ${orderId} still pending: insufficient stock`);
    }

    return {
      success: errors.length === 0,
      orderId,
      stockCalculated,
      stockDeducted,
      notificationSent,
      orderStatusUpdated,
      errors,
    };
  } catch (error: any) {
    console.error("❌ Error processing order stock and notification:", error);
    return {
      success: false,
      orderId,
      stockCalculated,
      stockDeducted,
      notificationSent,
      orderStatusUpdated,
      errors: [error.message || "Processing failed"],
    };
  }
}
