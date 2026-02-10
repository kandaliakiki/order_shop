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
exports.ConversationManager = void 0;
const mongoose_1 = require("../mongoose");
const conversationState_model_1 = __importDefault(require("../models/conversationState.model"));
const ai_service_1 = require("./ai.service");
const productSimilarity_service_1 = require("./productSimilarity.service");
const product_action_1 = require("../actions/product.action");
const whatsappOrderProcessing_action_1 = require("../actions/whatsappOrderProcessing.action");
class ConversationManager {
    constructor() {
        this.aiService = new ai_service_1.AIService();
        this.similarityService = new productSimilarity_service_1.ProductSimilarityService();
    }
    /**
     * Process incoming WhatsApp message in conversational context
     */
    processMessage(messageBody, phoneNumber, twilioMessageId, whatsappMessageMongoId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            yield (0, mongoose_1.connectToDB)();
            try {
                // 1. Get or create conversation state (one per phone number, reused)
                let state = yield conversationState_model_1.default.findOne({ phoneNumber });
                if (!state) {
                    // First time this customer is ordering – create fresh state
                    state = yield conversationState_model_1.default.create({
                        phoneNumber,
                        status: "collecting",
                        collectedData: {},
                        missingFields: ["products", "quantities", "deliveryDate", "deliveryAddress"],
                        conversationHistory: [],
                    });
                }
                else if (state.status !== "collecting") {
                    // Previous conversation was completed/cancelled – hard reset for a new order
                    state.status = "collecting";
                    state.collectedData = {};
                    state.missingFields = ["products", "quantities", "deliveryDate", "deliveryAddress"];
                    state.pendingQuestion = undefined;
                    state.conversationHistory = [];
                    state.lastMessageId = undefined;
                    state.orderId = undefined;
                    yield state.save();
                }
                // 2. Add user message to history
                state.conversationHistory.push({
                    role: "user",
                    message: messageBody,
                    timestamp: new Date(),
                });
                // 3. Get available products
                const availableProducts = yield (0, product_action_1.fetchProducts)();
                const productsForAI = availableProducts.map((p) => ({
                    name: p.name,
                    price: p.price,
                }));
                // 3b. If user is replying after the "list all possibilities" clarification, resolve each phrase ourselves (exact names OK, ambiguous terms get one more clarification)
                const normalize = (s) => s
                    .toLowerCase()
                    .trim()
                    .replace(/\s+/g, " ");
                const filterByMention = (mention, products) => {
                    const m = normalize(mention);
                    return products.filter((p) => p.name.toLowerCase().includes(m));
                };
                if (((_a = state.pendingQuestion) === null || _a === void 0 ? void 0 : _a.type) === "product_clarification") {
                    const items = yield this.aiService.extractProductPhrasesWithQuantities(messageBody);
                    const stillAmbiguous = [];
                    if (!state.collectedData.products)
                        state.collectedData.products = [];
                    for (const item of items) {
                        const phrase = item.phrase.trim();
                        if (!phrase)
                            continue;
                        const exactMatch = productsForAI.find((p) => normalize(p.name) === normalize(phrase));
                        if (exactMatch) {
                            const existing = state.collectedData.products.find((p) => p.name === exactMatch.name);
                            if (existing)
                                existing.quantity = item.quantity;
                            else
                                state.collectedData.products.push({ name: exactMatch.name, quantity: item.quantity, confidence: 1 });
                            continue;
                        }
                        const similar = this.similarityService.findSimilarProducts(phrase, productsForAI, 0.3);
                        const filtered = filterByMention(phrase, similar);
                        const toShow = filtered.length >= 2 ? filtered : similar;
                        if (toShow.length >= 2) {
                            stillAmbiguous.push({ phrase, quantity: item.quantity, options: toShow });
                        }
                        else if (toShow.length === 1) {
                            const existing = state.collectedData.products.find((p) => p.name === toShow[0].name);
                            if (existing)
                                existing.quantity = item.quantity;
                            else
                                state.collectedData.products.push({ name: toShow[0].name, quantity: item.quantity, confidence: 1 });
                        }
                    }
                    if (stillAmbiguous.length > 0) {
                        const lines = [];
                        lines.push("Saya melihat beberapa kata yang bisa berarti beberapa produk berbeda. Berikut daftar kemungkinan produknya:");
                        // Tampilkan juga produk yang sudah pasti supaya konteks pesanan jelas
                        if (state.collectedData.products && state.collectedData.products.length > 0) {
                            lines.push("\nSaat ini pesanan yang sudah kami catat:");
                            for (const p of state.collectedData.products) {
                                const qty = typeof p.quantity === "number" && p.quantity > 0
                                    ? ` ${p.quantity} pcs`
                                    : "";
                                lines.push(`- ${p.name}${qty}`);
                            }
                        }
                        for (const a of stillAmbiguous) {
                            lines.push(`\nUntuk "${a.phrase}":`);
                            for (const p of a.options) {
                                lines.push(`- ${p.name} - Rp ${p.price.toLocaleString("id-ID")}`);
                            }
                        }
                        lines.push("\nMohon sebutkan nama lengkap dari daftar di atas untuk kata-kata tersebut (dan jumlahnya).\n" +
                            'Contoh: "Chocolate Chip Cookie 2 pcs, pain au chocolate 1 pcs".');
                        const combinedQuestion = lines.join("\n");
                        state.pendingQuestion = { type: "product_clarification", questionText: combinedQuestion };
                        state.conversationHistory.push({
                            role: "assistant",
                            message: combinedQuestion,
                            timestamp: new Date(),
                        });
                        state.lastMessageId = twilioMessageId;
                        yield state.save();
                        return {
                            success: true,
                            whatsappResponse: combinedQuestion,
                            shouldCreateOrder: false,
                        };
                    }
                    state.pendingQuestion = undefined;
                    const completeness = this.checkCompleteness(state);
                    const confirmedSummary = state.collectedData.products && state.collectedData.products.length > 0
                        ? state.collectedData.products
                            .map((p) => `${p.name} ${p.quantity} pcs`)
                            .join(", ")
                        : "";
                    const prefix = confirmedSummary
                        ? `Baik, jadi ${confirmedSummary} ya.\n\n`
                        : "";
                    if (!completeness.isComplete) {
                        const question = this.generateFollowUpQuestion(completeness.missingFields[0], state, undefined);
                        const fullMessage = prefix + question;
                        state.pendingQuestion = {
                            type: "missing_field",
                            field: completeness.missingFields[0],
                            questionText: fullMessage,
                        };
                        state.missingFields = completeness.missingFields;
                        state.conversationHistory.push({
                            role: "assistant",
                            message: fullMessage,
                            timestamp: new Date(),
                        });
                        state.lastMessageId = twilioMessageId;
                        yield state.save();
                        return {
                            success: true,
                            whatsappResponse: fullMessage,
                            shouldCreateOrder: false,
                        };
                    }
                    const orderMessage = this.buildOrderMessageFromCollectedData(state.collectedData);
                    const orderResult = yield (0, whatsappOrderProcessing_action_1.processWhatsAppMessageForOrder)(orderMessage, phoneNumber, whatsappMessageMongoId, twilioMessageId, true);
                    if (orderResult.success && orderResult.orderId) {
                        state.status = "completed";
                        state.lastMessageId = twilioMessageId;
                        state.orderId = orderResult.orderId;
                        yield state.save();
                        return {
                            success: true,
                            whatsappResponse: orderResult.whatsappResponse || "✅ Pesanan Anda telah diterima!",
                            orderId: orderResult.orderId,
                            shouldCreateOrder: true,
                        };
                    }
                    else {
                        state.status = "collecting";
                        yield state.save();
                        return {
                            success: false,
                            whatsappResponse: orderResult.whatsappResponse || "❌ Maaf, terjadi kesalahan. Silakan coba lagi.",
                            shouldCreateOrder: false,
                            error: orderResult.error,
                        };
                    }
                }
                // 4. Analyze message with context
                const analysis = yield this.aiService.analyzeWithContext(messageBody, productsForAI, state.conversationHistory.map((h) => ({
                    role: h.role,
                    message: h.message,
                })), {
                    collectedData: state.collectedData,
                    missingFields: state.missingFields,
                });
                // 4b. Let AI decide if the user wants to reset / start over
                if (analysis.intent === "reset") {
                    state.collectedData = {};
                    state.missingFields = ["products", "quantities", "deliveryDate", "deliveryAddress"];
                    state.pendingQuestion = undefined;
                    state.status = "collecting";
                    state.orderId = undefined;
                    // Clear history so old orders are not re-used in context
                    state.conversationHistory = [];
                    const resetMessage = "Baik, semua pesanan sebelumnya sudah saya hapus. Jadi, mau pesan apa saja kali ini? Berapa banyak untuk masing-masing kue, dan kapan mau dikirim?";
                    state.conversationHistory.push({
                        role: "assistant",
                        message: resetMessage,
                        timestamp: new Date(),
                    });
                    state.lastMessageId = twilioMessageId;
                    yield state.save();
                    return {
                        success: true,
                        whatsappResponse: resetMessage,
                        shouldCreateOrder: false,
                    };
                }
                // 5. Check for ambiguous products FIRST (before updating collected data)
                if (analysis.ambiguousProducts && analysis.ambiguousProducts.length > 0) {
                    const ambiguousList = analysis.ambiguousProducts;
                    // Only show products whose name contains the user's term (e.g. "cake" -> no Cheese Biscuit, "cheese" -> no Sweet Cake)
                    const filterByMention = (mention, products) => {
                        const m = normalize(mention);
                        return products.filter((p) => p.name.toLowerCase().includes(m));
                    };
                    const lines = [];
                    lines.push("Saya melihat beberapa kata yang bisa berarti beberapa produk berbeda. Berikut daftar kemungkinan produknya:");
                    // Tampilkan juga produk yang sudah pasti (sudah kami catat) supaya pelanggan tahu apa yang sudah fix
                    if (state.collectedData.products && state.collectedData.products.length > 0) {
                        lines.push("\nSaat ini pesanan yang sudah kami catat:");
                        for (const p of state.collectedData.products) {
                            const qty = typeof p.quantity === "number" && p.quantity > 0
                                ? ` ${p.quantity} pcs`
                                : "";
                            lines.push(`- ${p.name}${qty}`);
                        }
                    }
                    for (const ambiguous of ambiguousList) {
                        // If user's mention exactly matches a product name (e.g. "cheese biscuit" = "Cheese Biscuit"), add it and don't ask
                        const exactProduct = productsForAI.find((p) => normalize(p.name) === normalize(ambiguous.userMention));
                        if (exactProduct) {
                            if (!state.collectedData.products)
                                state.collectedData.products = [];
                            const qty = (_d = (_c = (_b = analysis.extractedData.products) === null || _b === void 0 ? void 0 : _b.find((e) => normalize(e.name) === normalize(exactProduct.name))) === null || _c === void 0 ? void 0 : _c.quantity) !== null && _d !== void 0 ? _d : 1;
                            const existing = state.collectedData.products.find((p) => p.name === exactProduct.name);
                            if (existing)
                                existing.quantity = qty;
                            else
                                state.collectedData.products.push({ name: exactProduct.name, quantity: qty, confidence: 1 });
                            continue;
                        }
                        const similarProducts = this.similarityService.findSimilarProducts(ambiguous.userMention, productsForAI, 0.3);
                        const filtered = filterByMention(ambiguous.userMention, similarProducts);
                        const toShow = filtered.length >= 2 ? filtered : similarProducts;
                        if (toShow.length >= 2) {
                            lines.push(`\nUntuk "${ambiguous.userMention}":`);
                            for (const p of toShow) {
                                lines.push(`- ${p.name} - Rp ${p.price.toLocaleString("id-ID")}`);
                            }
                        }
                    }
                    lines.push("\nMohon tuliskan ulang pesanan dengan nama produk lengkap dan jumlah dari daftar di atas.\n" +
                        'Contoh: "Cheesecake 2 pcs, Sweet Cake 3 pcs, Cheese Biscuit 1 pcs".');
                    const combinedQuestion = lines.join("\n");
                    const hasAmbiguousSections = lines.length > 2;
                    if (hasAmbiguousSections) {
                        state.pendingQuestion = {
                            type: "product_clarification",
                            questionText: combinedQuestion,
                        };
                        state.conversationHistory.push({
                            role: "assistant",
                            message: combinedQuestion,
                            timestamp: new Date(),
                        });
                        state.lastMessageId = twilioMessageId;
                        yield state.save();
                        return {
                            success: true,
                            whatsappResponse: combinedQuestion,
                            shouldCreateOrder: false,
                        };
                    }
                }
                // 6. Update collected data from analysis
                this.updateCollectedData(state, analysis.extractedData);
                // 7. Check completeness
                const completeness = this.checkCompleteness(state);
                if (!completeness.isComplete) {
                    // Generate follow-up question for first missing field
                    const question = this.generateFollowUpQuestion(completeness.missingFields[0], state, analysis.suggestedQuestion);
                    state.pendingQuestion = {
                        type: "missing_field",
                        field: completeness.missingFields[0],
                        questionText: question,
                    };
                    state.missingFields = completeness.missingFields;
                    state.conversationHistory.push({
                        role: "assistant",
                        message: question,
                        timestamp: new Date(),
                    });
                    state.lastMessageId = twilioMessageId;
                    yield state.save();
                    return {
                        success: true,
                        whatsappResponse: question,
                        shouldCreateOrder: false,
                    };
                }
                // 8. All data complete! Build order message from collected data
                const orderMessage = this.buildOrderMessageFromCollectedData(state.collectedData);
                // Create order using existing order processing
                const orderResult = yield (0, whatsappOrderProcessing_action_1.processWhatsAppMessageForOrder)(orderMessage, phoneNumber, whatsappMessageMongoId, twilioMessageId, true // For conversational flow, skip stock checks and just create the order
                );
                if (orderResult.success && orderResult.orderId) {
                    // Mark conversation as completed and store orderId,
                    // but keep this single ConversationState reusable for future orders.
                    state.status = "completed";
                    state.lastMessageId = twilioMessageId;
                    state.orderId = orderResult.orderId;
                    yield state.save();
                    return {
                        success: true,
                        whatsappResponse: orderResult.whatsappResponse || "✅ Pesanan Anda telah diterima!",
                        orderId: orderResult.orderId,
                        shouldCreateOrder: true,
                    };
                }
                else {
                    // Keep status as "collecting" so user can retry with the same data
                    state.status = "collecting";
                    yield state.save();
                    return {
                        success: false,
                        whatsappResponse: orderResult.whatsappResponse ||
                            "❌ Maaf, terjadi kesalahan saat memproses pesanan Anda. Silakan coba lagi.",
                        shouldCreateOrder: false,
                        error: orderResult.error,
                    };
                }
            }
            catch (error) {
                console.error("❌ Error in ConversationManager:", error);
                return {
                    success: false,
                    whatsappResponse: "❌ Maaf, terjadi kesalahan. Silakan coba lagi atau hubungi kami langsung.",
                    shouldCreateOrder: false,
                    error: error.message,
                };
            }
        });
    }
    /**
     * Update collected data from new analysis
     */
    updateCollectedData(state, extractedData) {
        // Update products
        if (extractedData.products && extractedData.products.length > 0) {
            if (!state.collectedData.products) {
                state.collectedData.products = [];
            }
            // Merge products (avoid duplicates)
            for (const product of extractedData.products) {
                const existing = state.collectedData.products.find((p) => p.name === product.name);
                if (existing) {
                    existing.quantity = product.quantity; // Update quantity
                    existing.confidence = product.confidence;
                }
                else {
                    state.collectedData.products.push(product);
                }
            }
        }
        // Update delivery date
        if (extractedData.deliveryDate) {
            state.collectedData.deliveryDate = extractedData.deliveryDate;
        }
        // Update delivery address
        if (extractedData.deliveryAddress) {
            state.collectedData.deliveryAddress = extractedData.deliveryAddress;
        }
        // Update customer name if provided
        if (extractedData.customerName) {
            state.collectedData.customerName = extractedData.customerName;
        }
    }
    /**
     * Check if all required fields are complete
     */
    checkCompleteness(state) {
        const missing = [];
        // Check products
        if (!state.collectedData.products ||
            state.collectedData.products.length === 0) {
            missing.push("products");
        }
        else {
            // Check quantities (all products must have quantity > 0)
            const hasInvalidQuantity = state.collectedData.products.some((p) => !p.quantity || p.quantity <= 0);
            if (hasInvalidQuantity) {
                missing.push("quantities");
            }
        }
        // Check delivery date
        if (!state.collectedData.deliveryDate) {
            missing.push("deliveryDate");
        }
        // Check delivery address
        if (!state.collectedData.deliveryAddress) {
            missing.push("deliveryAddress");
        }
        return {
            isComplete: missing.length === 0,
            missingFields: missing,
        };
    }
    /**
     * Generate follow-up question for missing field
     */
    generateFollowUpQuestion(missingField, state, aiSuggestedQuestion) {
        // Use AI suggestion if available
        if (aiSuggestedQuestion) {
            return aiSuggestedQuestion;
        }
        // Fallback to template questions
        const questions = {
            products: "Produk apa yang ingin Anda pesan? Silakan sebutkan nama produknya.",
            quantities: state.collectedData.products
                ? `Berapa jumlah ${state.collectedData.products.map((p) => p.name).join(" dan ")} yang Anda inginkan?`
                : "Berapa jumlah yang Anda inginkan?",
            deliveryDate: "Kapan Anda ingin pesanan dikirim? (contoh: besok, 15 Februari, atau tanggal lainnya)",
            deliveryAddress: "Bisa berikan alamat pengiriman yang lengkap? (termasuk nama jalan, nomor, dan kota)",
        };
        return questions[missingField] || "Mohon lengkapi informasi pesanan Anda.";
    }
    /**
     * Cancel active conversation
     */
    cancelConversation(phoneNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, mongoose_1.connectToDB)();
            yield conversationState_model_1.default.findOneAndUpdate({ phoneNumber, status: "collecting" }, { status: "cancelled" });
        });
    }
    /**
     * Get active conversation state
     */
    getConversationState(phoneNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, mongoose_1.connectToDB)();
            return yield conversationState_model_1.default.findOne({
                phoneNumber,
                status: "collecting",
            });
        });
    }
    /**
     * Build order message from collected data
     * Formats the data in a way that the existing order processing can understand
     */
    buildOrderMessageFromCollectedData(collectedData) {
        const parts = [];
        // Add products
        if (collectedData.products && collectedData.products.length > 0) {
            for (const product of collectedData.products) {
                parts.push(`${product.name} ${product.quantity}`);
            }
        }
        // Add delivery date
        if (collectedData.deliveryDate) {
            parts.push(`untuk tanggal ${collectedData.deliveryDate}`);
        }
        // Add delivery address
        if (collectedData.deliveryAddress) {
            parts.push(`alamat ${collectedData.deliveryAddress}`);
        }
        return parts.join(", ");
    }
}
exports.ConversationManager = ConversationManager;
