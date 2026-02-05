"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processOrderStockAndNotification = void 0;
const order_action_1 = require("./order.action");
const ingredientStockCalculation_service_1 = require("../services/ingredientStockCalculation.service");
const stockDeduction_service_1 = require("../services/stockDeduction.service");
const whatsappMessageFormatter_service_1 = require("../services/whatsappMessageFormatter.service");
const twilio_service_1 = require("../services/twilio.service");
const order_model_1 = __importDefault(require("../models/order.model"));
/**
 * Process stock calculation, deduction, and notification for an order
 * Can be called manually or via cronjob
 * Useful for processing pending orders after restocking
 */
function processOrderStockAndNotification(orderId) {
    return __awaiter(this, void 0, void 0, function* () {
        const errors = [];
        let stockCalculated = false;
        let stockDeducted = false;
        let notificationSent = false;
        let orderStatusUpdated = false;
        try {
            // Step 1: Fetch order
            let order = yield (0, order_action_1.fetchOrderById)(orderId);
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
            const stockCalculationService = new ingredientStockCalculation_service_1.IngredientStockCalculationService();
            const stockCalculation = yield stockCalculationService.calculateOrderIngredientRequirements(order);
            stockCalculated = true;
            // Step 3: Check if sufficient now
            if (stockCalculation.allIngredientsSufficient) {
                // Deduct stock
                const stockDeductionService = new stockDeduction_service_1.StockDeductionService();
                const deductionResult = yield stockDeductionService.deductStockForOrder(stockCalculation.requirements);
                stockDeducted = deductionResult.success;
                if (deductionResult.errors.length > 0) {
                    errors.push(...deductionResult.errors);
                }
                // Store lot usage metadata if available
                if (deductionResult.lotUsageMetadata) {
                    yield order_model_1.default.findOneAndUpdate({ orderId }, { lotUsageMetadata: deductionResult.lotUsageMetadata }, { new: true });
                    // Refetch order to get updated lotUsageMetadata
                    order = yield (0, order_action_1.fetchOrderById)(orderId);
                }
                // Update status to "New Order" if it was "Pending"
                if (order.status === "Pending") {
                    yield (0, order_action_1.updateOrderStatus)(orderId, "New Order");
                    orderStatusUpdated = true;
                }
                // Send confirmation message
                const frontendBaseUrl = process.env.FRONTEND_BASE_URL || process.env.NEXT_PUBLIC_FRONTEND_URL;
                const messageFormatter = new whatsappMessageFormatter_service_1.WhatsAppMessageFormatter();
                const message = messageFormatter.formatOrderConfirmationMessage(orderId, order.lotUsageMetadata, frontendBaseUrl);
                const twilioService = (0, twilio_service_1.getTwilioService)();
                if (order.whatsappNumber) {
                    const cleanNumber = order.whatsappNumber.replace(/^whatsapp:/, "");
                    yield twilioService.sendWhatsAppMessage(cleanNumber, message);
                    notificationSent = true;
                }
                console.log(`✅ Order ${orderId} processed: stock deducted, status updated, notification sent`);
            }
            else {
                // Still insufficient - send update message
                const insufficientIngredients = stockCalculation.requirements.filter((r) => !r.isSufficient);
                const messageFormatter = new whatsappMessageFormatter_service_1.WhatsAppMessageFormatter();
                const message = messageFormatter.formatOutOfStockMessage(orderId, insufficientIngredients);
                const twilioService = (0, twilio_service_1.getTwilioService)();
                if (order.whatsappNumber) {
                    const cleanNumber = order.whatsappNumber.replace(/^whatsapp:/, "");
                    yield twilioService.sendWhatsAppMessage(cleanNumber, message);
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
        }
        catch (error) {
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
    });
}
exports.processOrderStockAndNotification = processOrderStockAndNotification;
