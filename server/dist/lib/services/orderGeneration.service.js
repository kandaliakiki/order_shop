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
exports.OrderGenerationService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const order_action_1 = require("../actions/order.action");
const product_action_1 = require("../actions/product.action");
class OrderGenerationService {
    constructor() {
        this.TAX_RATE = 0.1; // 10% tax (adjust as needed)
    }
    /**
     * Find product in database by name (case-insensitive)
     */
    findProductByName(products, productName) {
        const normalizedName = productName.toLowerCase().trim();
        return (products.find((p) => p.name.toLowerCase().trim() === normalizedName) ||
            null);
    }
    /**
     * Generate order from AI analysis results
     */
    generateOrder(aiAnalysis, whatsappNumber, whatsappMessageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = [];
            const warnings = [];
            // Validate we have at least one product
            if (!aiAnalysis.products || aiAnalysis.products.length === 0) {
                return {
                    order: null,
                    success: false,
                    errors: ["No products found in the message"],
                };
            }
            // Get all products from database
            const allProducts = yield (0, product_action_1.fetchProducts)();
            // Find products in database by name (AI already matched them)
            const orderItems = [];
            for (const extractedProduct of aiAnalysis.products) {
                const product = this.findProductByName(allProducts, extractedProduct.name);
                if (product) {
                    orderItems.push({
                        name: product.name,
                        quantity: extractedProduct.quantity,
                        price: product.price,
                    });
                }
                else {
                    // Product not found (shouldn't happen if AI matched correctly)
                    warnings.push(`Product "${extractedProduct.name}" not found in database`);
                    errors.push(`Could not find product: "${extractedProduct.name}"`);
                }
            }
            // If no valid products found, fail
            if (orderItems.length === 0) {
                return {
                    order: null,
                    success: false,
                    errors: errors.length > 0 ? errors : ["No valid products found"],
                };
            }
            // Calculate totals
            const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const tax = subtotal * this.TAX_RATE;
            const total = subtotal + tax;
            // Always use "WhatsApp Customer" for WhatsApp orders
            const customerName = "WhatsApp Customer";
            // Extract phone number (remove whatsapp: prefix if present)
            const phoneNumber = whatsappNumber.replace(/^whatsapp:/, "");
            // Parse pickup date if provided, otherwise will default to createdAt in pre-save hook
            let pickupDate;
            if (aiAnalysis.deliveryDate) {
                try {
                    // Parse the date string (should be YYYY-MM-DD format)
                    const dateStr = aiAnalysis.deliveryDate.trim();
                    // Validate format (YYYY-MM-DD)
                    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                        console.warn(`Invalid deliveryDate format: ${dateStr}, using default`);
                        pickupDate = undefined;
                    }
                    else {
                        // Create date at midnight UTC to avoid timezone issues
                        pickupDate = new Date(dateStr + 'T00:00:00.000Z');
                        // Validate date is not invalid and not in the past (allow today and future)
                        if (isNaN(pickupDate.getTime())) {
                            console.warn(`Invalid deliveryDate: ${dateStr}, using default`);
                            pickupDate = undefined;
                        }
                        else {
                            // Check if date is reasonable (not before 2020, not too far in future)
                            const minDate = new Date('2020-01-01');
                            const maxDate = new Date();
                            maxDate.setFullYear(maxDate.getFullYear() + 2); // Allow up to 2 years in future
                            if (pickupDate < minDate || pickupDate > maxDate) {
                                console.warn(`DeliveryDate out of reasonable range: ${dateStr}, using default`);
                                pickupDate = undefined;
                            }
                        }
                    }
                }
                catch (error) {
                    console.error(`Error parsing deliveryDate: ${aiAnalysis.deliveryDate}`, error);
                    pickupDate = undefined; // Error parsing, will use default
                }
            }
            // Build notes including delivery address if provided
            let notes = aiAnalysis.notes || "";
            if (aiAnalysis.deliveryAddress) {
                const addressNote = `Alamat pengiriman: ${aiAnalysis.deliveryAddress}`;
                notes = notes ? `${notes}\n${addressNote}` : addressNote;
            }
            // Build fulfillment info notes if provided
            if (aiAnalysis.fulfillmentType) {
                const typeNote = aiAnalysis.fulfillmentType === "pickup"
                    ? "Metode pemenuhan: Pickup (ambil di toko)."
                    : "Metode pemenuhan: Delivery (dikirim ke alamat).";
                notes = notes ? `${notes}\n${typeNote}` : typeNote;
            }
            if (aiAnalysis.pickupTime) {
                const timeNote = `Waktu pick up / kirim yang diminta: ${aiAnalysis.pickupTime}`;
                notes = notes ? `${notes}\n${timeNote}` : timeNote;
            }
            // Create order data
            const orderData = {
                customerName,
                phoneNumber,
                items: orderItems,
                subtotal,
                tax,
                total,
                status: "New Order",
                createdAt: new Date(),
                pickupDate, // Will default to createdAt if not provided
                // Structured fulfillment info (optional, mostly for display)
                fulfillmentType: aiAnalysis.fulfillmentType,
                pickupTime: aiAnalysis.pickupTime,
                source: "whatsapp",
                whatsappNumber,
                whatsappMessageId: new mongoose_1.default.Types.ObjectId(whatsappMessageId),
                deliveryAddress: aiAnalysis.deliveryAddress || undefined,
                aiAnalysisMetadata: {
                    confidence: aiAnalysis.confidence,
                    extractionMethod: "ai_analysis",
                    rawAnalysis: aiAnalysis,
                },
            };
            // Add notes to order if available (if Order model supports it)
            // For now, we'll include it in the rawAnalysis metadata
            if (notes) {
                orderData.aiAnalysisMetadata.notes = notes;
            }
            try {
                const order = yield (0, order_action_1.createOrder)(orderData);
                return {
                    order,
                    success: true,
                    warnings: warnings.length > 0 ? warnings : undefined,
                };
            }
            catch (error) {
                console.error("Error creating order:", error);
                return {
                    order: null,
                    success: false,
                    errors: [error.message || "Failed to create order"],
                };
            }
        });
    }
}
exports.OrderGenerationService = OrderGenerationService;
