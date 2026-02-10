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
exports.processWhatsAppMessageForOrder = void 0;
const ai_service_1 = require("../services/ai.service");
const orderGeneration_service_1 = require("../services/orderGeneration.service");
const ingredientStockCalculation_service_1 = require("../services/ingredientStockCalculation.service");
const stockReservation_service_1 = require("../services/stockReservation.service");
const whatsappMessageFormatter_service_1 = require("../services/whatsappMessageFormatter.service");
const order_action_1 = require("./order.action");
const whatsappMessage_action_1 = require("./whatsappMessage.action");
const product_action_1 = require("./product.action");
const order_action_2 = require("./order.action");
const order_model_1 = __importDefault(require("../models/order.model"));
/**
 * Process WhatsApp message: Analyze with AI, generate order, check stock, and respond.
 * When collectedData is provided (from conversational flow), order is built from it so pickupTime/fulfillmentType are persisted.
 */
function processWhatsAppMessageForOrder(messageBody_1, whatsappNumber_1, whatsappMessageMongoId_1, twilioMessageId_1) {
    return __awaiter(this, arguments, void 0, function* (messageBody, whatsappNumber, whatsappMessageMongoId, // MongoDB _id (for order generation)
    twilioMessageId, // Twilio messageId/SID (for message updates)
    skipStockCheck = false, // If true, just create order without stock checks/reservations
    collectedData // When set, use this for order instead of AI-parsing messageBody
    ) {
        var _a, _b;
        try {
            let aiAnalysis;
            if (collectedData && collectedData.products && collectedData.products.length > 0) {
                // Build order from conversational collected data so pickupTime, fulfillmentType, etc. are persisted
                aiAnalysis = {
                    products: collectedData.products.map((p) => ({
                        name: p.name,
                        quantity: p.quantity,
                        confidence: 1,
                    })),
                    deliveryDate: collectedData.deliveryDate,
                    deliveryAddress: collectedData.deliveryAddress,
                    fulfillmentType: collectedData.fulfillmentType,
                    pickupTime: collectedData.pickupTime,
                    confidence: 1,
                };
            }
            else {
                // Step 1: AI Analysis
                const availableProducts = yield fetchProductsForAI();
                aiAnalysis = yield analyzeMessageWithAI(messageBody, availableProducts);
            }
            // Step 2: Generate Order (initially with "New Order" status)
            const orderResult = yield generateOrderFromAnalysis(aiAnalysis, whatsappNumber, whatsappMessageMongoId);
            if (!orderResult.success || !orderResult.order) {
                yield (0, whatsappMessage_action_1.updateMessageAnalysis)(twilioMessageId, {
                    extractedData: aiAnalysis,
                    confidence: aiAnalysis.confidence,
                    error: ((_a = orderResult.errors) === null || _a === void 0 ? void 0 : _a.join(", ")) || "Failed to generate order",
                });
                return {
                    success: false,
                    error: ((_b = orderResult.errors) === null || _b === void 0 ? void 0 : _b.join(", ")) || "Failed to generate order",
                    whatsappResponse: "❌ Sorry, we couldn't process your order. Please try again or contact us.",
                };
            }
            // Step 3: Link message to order
            yield (0, whatsappMessage_action_1.linkMessageToOrder)(twilioMessageId, orderResult.order._id.toString());
            let whatsappResponse;
            if (!skipStockCheck) {
                // Step 4: Calculate ingredient requirements
                const stockCalculationService = new ingredientStockCalculation_service_1.IngredientStockCalculationService();
                const order = yield (0, order_action_2.fetchOrderById)(orderResult.order.orderId);
                const stockCalculation = yield stockCalculationService.calculateOrderIngredientRequirements(order);
                // Step 4.5: Store stock calculation in order metadata (before deduction)
                const stockCalculationMetadata = {
                    calculatedAt: new Date(),
                    allIngredientsSufficient: stockCalculation.allIngredientsSufficient,
                    requirements: stockCalculation.requirements.map((req) => ({
                        ingredientId: req.ingredientId,
                        ingredientName: req.ingredientName,
                        unit: req.unit,
                        requiredQuantity: req.requiredQuantity,
                        stockAtTimeOfOrder: req.currentStock, // Store stock level BEFORE deduction
                        wasSufficient: req.isSufficient,
                    })),
                    warnings: stockCalculation.warnings,
                };
                // Update order with stock calculation metadata
                yield order_model_1.default.findOneAndUpdate({ orderId: orderResult.order.orderId }, { stockCalculationMetadata }, { new: true });
                // Step 5: Check stock and process accordingly
                const messageFormatter = new whatsappMessageFormatter_service_1.WhatsAppMessageFormatter();
                if (stockCalculation.allIngredientsSufficient) {
                    // All ingredients sufficient: RESERVE stock (don't deduct yet)
                    const stockReservationService = new stockReservation_service_1.StockReservationService();
                    const order = yield (0, order_action_2.fetchOrderById)(orderResult.order.orderId);
                    const reservationResult = yield stockReservationService.reserveStockForOrder(stockCalculation.requirements, order.pickupDate);
                    if (reservationResult.success) {
                        // Keep status as "New Order" (already set)
                        // Stock is reserved but not deducted - will be deducted when status changes to "On Process"
                        const frontendBaseUrl = process.env.FRONTEND_BASE_URL || process.env.NEXT_PUBLIC_FRONTEND_URL;
                        whatsappResponse = messageFormatter.formatOrderConfirmationMessage(orderResult.order.orderId, undefined, // No lot usage metadata yet (will be set when actually deducted)
                        frontendBaseUrl);
                        console.log("✅ Order confirmed, stock reserved (will be deducted when processing)");
                    }
                    else {
                        // Reservation failed (shouldn't happen if all sufficient, but handle it)
                        yield (0, order_action_1.updateOrderStatus)(orderResult.order.orderId, "Pending");
                        whatsappResponse = messageFormatter.formatOutOfStockMessage(orderResult.order.orderId, stockCalculation.requirements.filter((r) => !r.isSufficient));
                        console.warn("⚠️ Stock reservation failed, order marked as Pending");
                    }
                }
                else {
                    // Insufficient ingredients: Mark as Pending, don't deduct stock
                    yield (0, order_action_1.updateOrderStatus)(orderResult.order.orderId, "Pending");
                    const insufficientIngredients = stockCalculation.requirements.filter((r) => !r.isSufficient);
                    whatsappResponse = messageFormatter.formatOutOfStockMessage(orderResult.order.orderId, insufficientIngredients);
                    console.log("⚠️ Order marked as Pending due to insufficient stock");
                }
            }
            else {
                // Skip all stock checks/reservations: just confirm order creation
                const frontendBaseUrl = process.env.FRONTEND_BASE_URL || process.env.NEXT_PUBLIC_FRONTEND_URL;
                const baseUrl = frontendBaseUrl ? frontendBaseUrl.replace(/\/$/, "") : null;
                const orderLink = baseUrl ? `${baseUrl}/order/${orderResult.order.orderId}` : null;
                let confirmLines = `✅ Pesanan Anda sudah kami terima.\n\n` +
                    `Order ID: *${orderResult.order.orderId}*.\n`;
                if (orderResult.order.fulfillmentType) {
                    confirmLines += orderResult.order.fulfillmentType === "pickup"
                        ? `📦 Ambil di toko (pickup).\n`
                        : `🚚 Dikirim (delivery).\n`;
                }
                if (orderResult.order.pickupTime) {
                    confirmLines += `🕐 Waktu: ${orderResult.order.pickupTime}\n`;
                }
                confirmLines += (orderLink ? `📱 Lihat detail pesanan: ${orderLink}\n\n` : "\n") +
                    `Kami akan cek stok dan mengonfirmasi berikutnya bila diperlukan.`;
                whatsappResponse = confirmLines;
                console.log("✅ Order created without stock checks (skipStockCheck=true)");
            }
            // Step 6: Update message analysis
            yield (0, whatsappMessage_action_1.updateMessageAnalysis)(twilioMessageId, {
                extractedData: aiAnalysis,
                confidence: aiAnalysis.confidence,
            });
            return {
                success: true,
                orderId: orderResult.order.orderId,
                whatsappResponse,
            };
        }
        catch (error) {
            console.error("❌ Error processing WhatsApp message for order:", error);
            yield (0, whatsappMessage_action_1.updateMessageAnalysis)(twilioMessageId, {
                error: error.message || "AI analysis failed",
            });
            return {
                success: false,
                error: error.message || "Processing failed",
                whatsappResponse: "❌ Sorry, an error occurred while processing your order. Please contact us.",
            };
        }
    });
}
exports.processWhatsAppMessageForOrder = processWhatsAppMessageForOrder;
/**
 * Fetch products and format for AI context
 */
function fetchProductsForAI() {
    return __awaiter(this, void 0, void 0, function* () {
        const products = yield (0, product_action_1.fetchProducts)();
        return products.map((p) => ({
            name: p.name,
            price: p.price,
        }));
    });
}
/**
 * Analyze WhatsApp message with AI to extract order information
 */
function analyzeMessageWithAI(messageBody, availableProducts) {
    return __awaiter(this, void 0, void 0, function* () {
        const aiService = new ai_service_1.AIService();
        const aiAnalysis = yield aiService.analyzeWhatsAppMessage(messageBody, availableProducts);
        console.log("🤖 AI Analysis Result:", JSON.stringify(aiAnalysis, null, 2));
        return aiAnalysis;
    });
}
/**
 * Generate order from AI analysis results
 */
function generateOrderFromAnalysis(aiAnalysis, whatsappNumber, whatsappMessageId) {
    return __awaiter(this, void 0, void 0, function* () {
        const orderGenerationService = new orderGeneration_service_1.OrderGenerationService();
        return yield orderGenerationService.generateOrder(aiAnalysis, whatsappNumber, whatsappMessageId);
    });
}
/**
 * Update WhatsApp message with analysis results and order status
 */
function updateMessageWithAnalysisResults(whatsappMessageId, aiAnalysis, orderResult) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (orderResult.success && orderResult.order) {
            yield (0, whatsappMessage_action_1.updateMessageAnalysis)(whatsappMessageId, {
                extractedData: aiAnalysis,
                confidence: aiAnalysis.confidence,
            });
            console.log("✅ Order generated:", orderResult.order.orderId);
        }
        else {
            const errorMessage = ((_a = orderResult.errors) === null || _a === void 0 ? void 0 : _a.join(", ")) || "No products could be matched";
            yield (0, whatsappMessage_action_1.updateMessageAnalysis)(whatsappMessageId, {
                extractedData: aiAnalysis,
                confidence: aiAnalysis.confidence,
                error: errorMessage,
            });
            console.error("❌ Failed to generate order:", orderResult.errors);
        }
    });
}
