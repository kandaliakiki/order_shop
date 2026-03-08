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
const order_action_1 = require("../actions/order.action");
const whatsappMessageFormatter_service_1 = require("./whatsappMessageFormatter.service");
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
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
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
                        missingFields: [
                            "products",
                            "quantities",
                            "deliveryDate",
                            "fulfillmentType",
                            "deliveryAddress",
                            "pickupTime",
                        ],
                        conversationHistory: [],
                    });
                }
                else if (state.status !== "collecting") {
                    // Previous conversation was completed/cancelled – hard reset for a new order
                    state.status = "collecting";
                    state.collectedData = {};
                    state.missingFields = [
                        "products",
                        "quantities",
                        "deliveryDate",
                        "fulfillmentType",
                        "deliveryAddress",
                        "pickupTime",
                    ];
                    state.pendingQuestion = undefined;
                    state.conversationHistory = [];
                    state.lastMessageId = undefined;
                    state.orderId = undefined;
                    state.orderIntent = undefined;
                    state.selectedOrderId = undefined;
                    state.editMode = undefined;
                    yield state.save();
                }
                // 2. Add user message to history
                state.conversationHistory.push({
                    role: "user",
                    message: messageBody,
                    timestamp: new Date(),
                });
                // 2b. New vs edit order: if user has existing orders and we haven't chosen yet, ask or handle reply
                const existingOrders = yield (0, order_action_1.fetchOrdersByWhatsappNumber)(phoneNumber, { limit: 10 });
                const hasOrders = existingOrders && existingOrders.length > 0;
                // Only ask "new or edit?" when we're not already waiting for that answer (otherwise we'd re-ask on every message)
                if (hasOrders && state.orderIntent == null && ((_a = state.pendingQuestion) === null || _a === void 0 ? void 0 : _a.type) !== "new_or_edit") {
                    const askNewOrEdit = "Kamu udah punya pesanan nih. Mau pesan baru atau edit yang ada?";
                    state.pendingQuestion = {
                        type: "new_or_edit",
                        questionText: askNewOrEdit,
                    };
                    state.conversationHistory.push({ role: "assistant", message: askNewOrEdit, timestamp: new Date() });
                    state.lastMessageId = twilioMessageId;
                    yield state.save();
                    return { success: true, whatsappResponse: askNewOrEdit, shouldCreateOrder: false };
                }
                if (((_b = state.pendingQuestion) === null || _b === void 0 ? void 0 : _b.type) === "new_or_edit") {
                    const normalized = messageBody.toLowerCase().trim();
                    const wantsNew = /^(pesan\s*baru|order\s*baru|baru|new|tambah\s*pesanan|new\s*order)$/.test(normalized) ||
                        normalized.includes("pesan baru") ||
                        normalized.includes("order baru");
                    const wantsEdit = /^(edit|ubah|edit\s*pesanan|edit\s*order)$/.test(normalized) ||
                        normalized.includes("edit pesanan") ||
                        normalized.includes("ubah pesanan");
                    if (wantsNew) {
                        state.orderIntent = "new_order";
                        state.pendingQuestion = undefined;
                        yield state.save();
                        // Fall through to normal flow (will run AI analysis below)
                    }
                    else if (wantsEdit) {
                        state.orderIntent = "edit_order";
                        const orderList = existingOrders.slice(0, 10).map((o) => ({
                            orderId: o.orderId,
                            summary: (o.items || []).map((i) => `${i.name} ${i.quantity}`).join(", ") || "(no items)",
                        }));
                        const lines = ["Pesanan kamu:\n"];
                        orderList.forEach((o, i) => {
                            lines.push(`${i + 1}. *${o.orderId}* – ${o.summary}`);
                        });
                        lines.push("\nMau edit yang mana? Balas nomor (1, 2, ...) atau ID pesanan (misal O-0501).");
                        const orderSelectionText = lines.join("\n");
                        state.pendingQuestion = {
                            type: "order_selection",
                            questionText: orderSelectionText,
                            orderList,
                        };
                        state.conversationHistory.push({ role: "assistant", message: orderSelectionText, timestamp: new Date() });
                        state.lastMessageId = twilioMessageId;
                        yield state.save();
                        return { success: true, whatsappResponse: orderSelectionText, shouldCreateOrder: false };
                    }
                    else {
                        const retry = "Pilih satu aja ya: *pesan baru* atau *edit*.";
                        state.conversationHistory.push({ role: "assistant", message: retry, timestamp: new Date() });
                        state.lastMessageId = twilioMessageId;
                        yield state.save();
                        return { success: true, whatsappResponse: retry, shouldCreateOrder: false };
                    }
                }
                if (((_c = state.pendingQuestion) === null || _c === void 0 ? void 0 : _c.type) === "order_selection") {
                    let list = state.pendingQuestion.orderList || [];
                    if (list.length === 0) {
                        const refetched = yield (0, order_action_1.fetchOrdersByWhatsappNumber)(phoneNumber, { limit: 10 });
                        list = (refetched || []).map((o) => ({
                            orderId: o.orderId,
                            summary: (o.items || []).map((i) => `${i.name} ${i.quantity}`).join(", ") || "(no items)",
                        }));
                    }
                    const trimmed = messageBody.trim();
                    const normalized = trimmed.toLowerCase();
                    let chosenId = null;
                    const num = parseInt(trimmed, 10);
                    if (!isNaN(num) && num >= 1 && num <= list.length) {
                        chosenId = list[num - 1].orderId;
                    }
                    if (!chosenId && /^O-\d+$/i.test(trimmed)) {
                        chosenId = trimmed;
                    }
                    if (!chosenId && list.length > 0 && (normalized === "pertama" || normalized === "first" || normalized === "1")) {
                        chosenId = list[0].orderId;
                    }
                    if (chosenId) {
                        const normalizedId = (0, order_action_1.normalizeOrderId)(chosenId);
                        state.selectedOrderId = normalizedId;
                        state.editMode = "add_items";
                        state.pendingQuestion = undefined;
                        state.missingFields = ["products", "quantities"];
                        state.collectedData = {};
                        const order = yield (0, order_action_1.fetchOrderById)(normalizedId);
                        const itemsList = ((_d = order === null || order === void 0 ? void 0 : order.items) === null || _d === void 0 ? void 0 : _d.length) ?
                            "Isi pesanan sekarang:\n" +
                                order.items.map((i) => `• ${i.name}: ${i.quantity} pcs`).join("\n") + "\n\n"
                            : "";
                        const askEdit = `Oke, pesanan *${normalizedId}*.\n\n${itemsList}Mau tambah atau ubah apa? Tulis aja produk + jumlah (misal: Chiffon 2, Cheesecake 1), atau mau hapus item (misal: hapus Cheesecake).`;
                        state.conversationHistory.push({ role: "assistant", message: askEdit, timestamp: new Date() });
                        state.lastMessageId = twilioMessageId;
                        yield state.save();
                        return { success: true, whatsappResponse: askEdit, shouldCreateOrder: false };
                    }
                    if (this.isShowMenuRequest(messageBody)) {
                        const products = yield (0, product_action_1.fetchProducts)();
                        const menuList = this.formatMenuList(products.map((p) => ({ name: p.name, price: p.price })));
                        const orderListLines = ["Pesanan kamu:\n"];
                        list.forEach((o, i) => {
                            orderListLines.push(`${i + 1}. *${o.orderId}* – ${o.summary}`);
                        });
                        orderListLines.push("\nMau edit yang mana? Balas nomor (1, 2, ...) atau ID pesanan (misal O-0501).");
                        const withMenu = `*Daftar menu lengkap:*\n\n${menuList}\n\n——\n\n${orderListLines.join("\n")}`;
                        state.conversationHistory.push({ role: "assistant", message: withMenu, timestamp: new Date() });
                        state.lastMessageId = twilioMessageId;
                        yield state.save();
                        return { success: true, whatsappResponse: withMenu, shouldCreateOrder: false };
                    }
                    const retry = "Pilih pesanan ya: nomor (1, 2, ...) atau ID (misal O-0501).";
                    state.conversationHistory.push({ role: "assistant", message: retry, timestamp: new Date() });
                    state.lastMessageId = twilioMessageId;
                    yield state.save();
                    return { success: true, whatsappResponse: retry, shouldCreateOrder: false };
                }
                // Edit flow: when waiting for "what to add/change?" (add_items, no pendingQuestion), handle "show menu" and "no changes"
                if (state.orderIntent === "edit_order" &&
                    state.selectedOrderId &&
                    state.editMode === "add_items" &&
                    !state.pendingQuestion) {
                    if (this.isShowMenuRequest(messageBody)) {
                        const products = yield (0, product_action_1.fetchProducts)();
                        const menuList = this.formatMenuList(products.map((p) => ({ name: p.name, price: p.price })));
                        const order = yield (0, order_action_1.fetchOrderById)(state.selectedOrderId);
                        const itemsList = ((_e = order === null || order === void 0 ? void 0 : order.items) === null || _e === void 0 ? void 0 : _e.length)
                            ? "Isi pesanan sekarang:\n" +
                                order.items.map((i) => `• ${i.name}: ${i.quantity} pcs`).join("\n") + "\n\n"
                            : "";
                        const oid = state.selectedOrderId;
                        const withMenu = `*Daftar menu lengkap:*\n\n${menuList}\n\n——\n\nOke, pesanan *${oid}*.\n\n${itemsList}Mau tambah atau ubah apa? Tulis aja produk + jumlah (misal: Chiffon 2, Cheesecake 1), atau mau hapus item (misal: hapus Cheesecake).`;
                        state.conversationHistory.push({ role: "assistant", message: withMenu, timestamp: new Date() });
                        state.lastMessageId = twilioMessageId;
                        yield state.save();
                        return { success: true, whatsappResponse: withMenu, shouldCreateOrder: false };
                    }
                    // "Done / no changes" in edit add_items is handled by AI intent "done_no_more_changes" in section 4c (no keyword shortcut)
                }
                // New order / greeting: when user asks for menu, return full menu list (not just "here is the menu" with no list)
                if (this.isShowMenuRequest(messageBody) &&
                    (state.orderIntent !== "edit_order" || !state.selectedOrderId) &&
                    ((_f = state.pendingQuestion) === null || _f === void 0 ? void 0 : _f.type) !== "order_selection") {
                    const products = yield (0, product_action_1.fetchProducts)();
                    const menuList = this.formatMenuList(products.map((p) => ({ name: p.name, price: p.price })));
                    const menuResponse = `Ini nih menunya:\n\n${menuList}\n\n——\n\nMau pesan apa? Tulis nama + jumlah (misal: Chiffon 2, Cheesecake 1).`;
                    state.conversationHistory.push({ role: "assistant", message: menuResponse, timestamp: new Date() });
                    state.lastMessageId = twilioMessageId;
                    yield state.save();
                    return { success: true, whatsappResponse: menuResponse, shouldCreateOrder: false };
                }
                // 2c. Edit: user confirming items (back-and-forth until they say ya/betul)
                if (((_g = state.pendingQuestion) === null || _g === void 0 ? void 0 : _g.type) === "edit_confirm_items" && state.selectedOrderId) {
                    const normalized = messageBody.toLowerCase().trim();
                    const confirmed = /^(ya|betul|benar|sudah benar|ok|oke|correct|yes|konfirmasi)$/.test(normalized) ||
                        normalized === "ya" || normalized === "betul" ||
                        this.isNoChangesRequest(messageBody);
                    if (confirmed) {
                        const askDelivery = "Tanggal, alamat, jam mau *sama* aja atau mau *ubah*?\n\nBalas: sama / ubah";
                        state.pendingQuestion = { type: "edit_confirm_delivery", questionText: askDelivery };
                        state.conversationHistory.push({ role: "assistant", message: askDelivery, timestamp: new Date() });
                        state.lastMessageId = twilioMessageId;
                        yield state.save();
                        return { success: true, whatsappResponse: askDelivery, shouldCreateOrder: false };
                    }
                    // User sent more changes: re-analyze and show proposed again
                    const productsForAI = (yield (0, product_action_1.fetchProducts)()).map((p) => ({ name: p.name, price: p.price }));
                    const analysis = yield this.aiService.analyzeWithContext(messageBody, productsForAI, state.conversationHistory.map((h) => ({ role: h.role, message: h.message })), Object.assign({ collectedData: state.collectedData, missingFields: ["products", "quantities"], userMightIndicateDone: this.isNoChangesRequest(messageBody) }, (state.selectedOrderId ? { editOrderContext: { orderId: state.selectedOrderId } } : {})));
                    if (analysis.intent === "done_no_more_changes") {
                        const askDelivery = "Tanggal, alamat, jam mau *sama* aja atau mau *ubah*?\n\nBalas: sama / ubah";
                        state.pendingQuestion = { type: "edit_confirm_delivery", questionText: askDelivery };
                        state.conversationHistory.push({ role: "assistant", message: askDelivery, timestamp: new Date() });
                        state.lastMessageId = twilioMessageId;
                        yield state.save();
                        return { success: true, whatsappResponse: askDelivery, shouldCreateOrder: false };
                    }
                    if (((_h = analysis.extractedData.products) === null || _h === void 0 ? void 0 : _h.length) && state.selectedOrderId) {
                        const order = yield (0, order_action_1.fetchOrderById)(state.selectedOrderId);
                        if ((_j = order === null || order === void 0 ? void 0 : order.items) === null || _j === void 0 ? void 0 : _j.length) {
                            const currentProposed = this.buildCurrentProposedOrderItems(order.items, state.collectedData.products);
                            this.applyEditIntents(analysis.extractedData.products, currentProposed);
                        }
                    }
                    this.updateCollectedData(state, analysis.extractedData);
                    const msg = yield this.buildProposedEditSummary(state.selectedOrderId, state);
                    state.pendingQuestion = { type: "edit_confirm_items", questionText: msg };
                    state.conversationHistory.push({ role: "assistant", message: msg, timestamp: new Date() });
                    state.lastMessageId = twilioMessageId;
                    yield state.save();
                    return { success: true, whatsappResponse: msg, shouldCreateOrder: false };
                }
                // 2c2. Edit: user confirming delivery (sama = apply and save; ubah = ask for new detail)
                if (((_k = state.pendingQuestion) === null || _k === void 0 ? void 0 : _k.type) === "edit_confirm_delivery" && state.selectedOrderId) {
                    const normalized = messageBody.toLowerCase().trim();
                    const same = /^(sama|tetap|ya|betul|ok|oke|tidak|no)$/.test(normalized) || normalized.includes("sama") || normalized.includes("tetap");
                    const wantChange = /^(ubah|change|ubah alamat|ubah tanggal|ubah jam)$/.test(normalized) || normalized.includes("ubah");
                    if (same && !wantChange) {
                        const oid = (0, order_action_1.normalizeOrderId)(state.selectedOrderId);
                        const toRemove = state.collectedData.productsToRemove || [];
                        const toAdd = (state.collectedData.products || []).map((p) => ({ name: p.name, quantity: p.quantity }));
                        if (toRemove.length > 0) {
                            const removeResult = yield (0, order_action_1.removeItemsFromOrder)(oid, toRemove);
                            if (!removeResult.success) {
                                state.conversationHistory.push({ role: "assistant", message: removeResult.error || "❌ Gagal menghapus item.", timestamp: new Date() });
                                yield state.save();
                                return { success: false, whatsappResponse: removeResult.error || "❌ Gagal menghapus item.", shouldCreateOrder: false };
                            }
                        }
                        if (toAdd.length > 0) {
                            const addResult = yield (0, order_action_1.addItemsToOrder)(oid, toAdd);
                            if (!addResult.success) {
                                state.conversationHistory.push({ role: "assistant", message: addResult.error || "❌ Gagal menambah item.", timestamp: new Date() });
                                yield state.save();
                                return { success: false, whatsappResponse: addResult.error || "❌ Gagal menambah item.", shouldCreateOrder: false };
                            }
                        }
                        state.status = "completed";
                        state.pendingQuestion = undefined;
                        state.lastMessageId = twilioMessageId;
                        state.orderId = oid;
                        yield state.save();
                        const formatter = new whatsappMessageFormatter_service_1.WhatsAppMessageFormatter();
                        const frontendBaseUrl = process.env.FRONTEND_BASE_URL || process.env.NEXT_PUBLIC_FRONTEND_URL;
                        const updatedOrder = yield (0, order_action_1.fetchOrderById)(oid);
                        const finalMsg = formatter.formatCustomerOrderConfirmation({
                            orderId: oid,
                            fulfillmentType: updatedOrder === null || updatedOrder === void 0 ? void 0 : updatedOrder.fulfillmentType,
                            pickupTime: updatedOrder === null || updatedOrder === void 0 ? void 0 : updatedOrder.pickupTime,
                            frontendBaseUrl,
                        });
                        state.conversationHistory.push({ role: "assistant", message: finalMsg, timestamp: new Date() });
                        yield state.save();
                        return { success: true, whatsappResponse: finalMsg, orderId: oid, shouldCreateOrder: false };
                    }
                    if (wantChange) {
                        const askDetail = "Oke. Kirim aja alamat baru / tanggal / jam.\n\nMisal: jam 4 sore, besok, Jl. Merdeka No 1.";
                        state.pendingQuestion = { type: "edit_change_delivery", questionText: askDetail };
                        state.conversationHistory.push({ role: "assistant", message: askDetail, timestamp: new Date() });
                        state.lastMessageId = twilioMessageId;
                        yield state.save();
                        return { success: true, whatsappResponse: askDetail, shouldCreateOrder: false };
                    }
                    const askAgain = "*Sama* aja atau mau *ubah*? Balas salah satu.";
                    state.conversationHistory.push({ role: "assistant", message: askAgain, timestamp: new Date() });
                    state.lastMessageId = twilioMessageId;
                    yield state.save();
                    return { success: true, whatsappResponse: askAgain, shouldCreateOrder: false };
                }
                // 2c3. After editing: ask add more or change delivery (legacy; new flow uses confirm items -> confirm delivery -> save)
                if (((_l = state.pendingQuestion) === null || _l === void 0 ? void 0 : _l.type) === "edit_follow_up") {
                    const normalized = messageBody.toLowerCase().trim();
                    const wantsAdd = /tambah|add/i.test(normalized) || /^[\d\s\w]+\s+\d+\s*(pcs)?$/i.test(normalized);
                    const wantsChange = /ubah|change|alamat|tanggal|jam|delivery|pickup|dikirim|ambil/i.test(normalized);
                    if (wantsAdd && !wantsChange) {
                        state.collectedData.products = [];
                        state.collectedData.productsToRemove = undefined;
                        state.missingFields = ["products", "quantities"];
                        state.pendingQuestion = undefined;
                        yield state.save();
                        // Fall through to AI analysis so "tambah cheesecake 2" gets extracted
                    }
                    else if (wantsChange) {
                        const askDetail = "Oke. Kirim aja alamat baru / tanggal / jam.\n\nMisal: jam 4 sore, besok, Jl. Merdeka No 1.";
                        state.pendingQuestion = { type: "edit_change_delivery", questionText: askDetail };
                        state.conversationHistory.push({ role: "assistant", message: askDetail, timestamp: new Date() });
                        state.lastMessageId = twilioMessageId;
                        yield state.save();
                        return { success: true, whatsappResponse: askDetail, shouldCreateOrder: false };
                    }
                    else {
                        const askAgain = "Mau *tambah* item lagi atau *ubah* alamat/tanggal/jam? Balas: tambah / ubah";
                        state.pendingQuestion = { type: "edit_follow_up", questionText: askAgain };
                        state.conversationHistory.push({ role: "assistant", message: askAgain, timestamp: new Date() });
                        state.lastMessageId = twilioMessageId;
                        yield state.save();
                        return { success: true, whatsappResponse: askAgain, shouldCreateOrder: false };
                    }
                }
                // 2d. Edit: user sent new delivery details -> update delivery, apply item changes, then send final confirmation
                if (((_m = state.pendingQuestion) === null || _m === void 0 ? void 0 : _m.type) === "edit_change_delivery" && state.selectedOrderId) {
                    const oid = (0, order_action_1.normalizeOrderId)(state.selectedOrderId);
                    const analysis = yield this.aiService.analyzeWithContext(messageBody, (yield (0, product_action_1.fetchProducts)()).map((p) => ({ name: p.name, price: p.price })), state.conversationHistory.map((h) => ({ role: h.role, message: h.message })), { collectedData: state.collectedData, missingFields: [] });
                    const u = analysis.extractedData;
                    const updates = {};
                    if (u.deliveryAddress)
                        updates.deliveryAddress = u.deliveryAddress;
                    if (u.pickupTime)
                        updates.pickupTime = u.pickupTime;
                    if (u.fulfillmentType)
                        updates.fulfillmentType = u.fulfillmentType;
                    if (u.deliveryDate) {
                        try {
                            const parsed = new Date(u.deliveryDate);
                            if (!isNaN(parsed.getTime()))
                                updates.pickupDate = parsed;
                        }
                        catch (_) { }
                    }
                    yield (0, order_action_1.updateOrderDeliveryDetails)(oid, updates);
                    const toRemove = state.collectedData.productsToRemove || [];
                    const toAdd = (state.collectedData.products || []).map((p) => ({ name: p.name, quantity: p.quantity }));
                    if (toRemove.length > 0)
                        yield (0, order_action_1.removeItemsFromOrder)(oid, toRemove);
                    if (toAdd.length > 0)
                        yield (0, order_action_1.addItemsToOrder)(oid, toAdd);
                    state.status = "completed";
                    state.pendingQuestion = undefined;
                    state.lastMessageId = twilioMessageId;
                    state.orderId = oid;
                    yield state.save();
                    const formatter = new whatsappMessageFormatter_service_1.WhatsAppMessageFormatter();
                    const frontendBaseUrl = process.env.FRONTEND_BASE_URL || process.env.NEXT_PUBLIC_FRONTEND_URL;
                    const updatedOrder = yield (0, order_action_1.fetchOrderById)(oid);
                    const finalMsg = formatter.formatCustomerOrderConfirmation({
                        orderId: oid,
                        fulfillmentType: updatedOrder === null || updatedOrder === void 0 ? void 0 : updatedOrder.fulfillmentType,
                        pickupTime: updatedOrder === null || updatedOrder === void 0 ? void 0 : updatedOrder.pickupTime,
                        frontendBaseUrl,
                    });
                    state.conversationHistory.push({ role: "assistant", message: finalMsg, timestamp: new Date() });
                    yield state.save();
                    return { success: true, whatsappResponse: finalMsg, orderId: oid, shouldCreateOrder: false };
                }
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
                if (((_o = state.pendingQuestion) === null || _o === void 0 ? void 0 : _o.type) === "product_clarification") {
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
                        lines.push("Ada beberapa kata yang bisa maksudnya beda produk nih. Kemungkinannya:");
                        // Tampilkan juga produk yang sudah pasti supaya konteks pesanan jelas
                        if (state.collectedData.products && state.collectedData.products.length > 0) {
                            lines.push("\nYang udah kami catat:");
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
                        lines.push("\nTulis aja nama lengkap dari list di atas + jumlah.\nContoh: Chocolate Chip Cookie 2, pain au chocolate 1.");
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
                        ? `Oke, jadi ${confirmedSummary} ya.\n\n`
                        : "";
                    if (!completeness.isComplete) {
                        const question = yield this.generateFollowUpQuestion(completeness.missingFields[0], state, undefined);
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
                    // Edit order: show proposed items and ask for confirmation (no DB write yet)
                    if (state.orderIntent === "edit_order" && state.selectedOrderId && state.editMode === "add_items") {
                        const oid = state.selectedOrderId;
                        const msg = yield this.buildProposedEditSummary(oid, state);
                        state.pendingQuestion = { type: "edit_confirm_items", questionText: msg };
                        state.lastMessageId = twilioMessageId;
                        state.orderId = oid;
                        state.conversationHistory.push({ role: "assistant", message: msg, timestamp: new Date() });
                        yield state.save();
                        return { success: true, whatsappResponse: msg, orderId: oid, shouldCreateOrder: false };
                    }
                    const orderMessage = this.buildOrderMessageFromCollectedData(state.collectedData);
                    const collectedForOrder = {
                        products: (state.collectedData.products || []).map((p) => ({
                            name: p.name,
                            quantity: p.quantity,
                        })),
                        deliveryDate: state.collectedData.deliveryDate,
                        deliveryAddress: state.collectedData.deliveryAddress,
                        fulfillmentType: state.collectedData.fulfillmentType,
                        pickupTime: state.collectedData.pickupTime,
                    };
                    const orderResult = yield (0, whatsappOrderProcessing_action_1.processWhatsAppMessageForOrder)(orderMessage, phoneNumber, whatsappMessageMongoId, twilioMessageId, true, collectedForOrder);
                    if (orderResult.success && orderResult.orderId) {
                        state.status = "completed";
                        state.lastMessageId = twilioMessageId;
                        state.orderId = orderResult.orderId;
                        yield state.save();
                        return {
                            success: true,
                            whatsappResponse: orderResult.whatsappResponse || "✅ Pesanan kamu udah kami terima!",
                            orderId: orderResult.orderId,
                            shouldCreateOrder: true,
                        };
                    }
                    else {
                        state.status = "collecting";
                        yield state.save();
                        return {
                            success: false,
                            whatsappResponse: orderResult.whatsappResponse || "❌ Maaf, ada error. Coba lagi ya.",
                            shouldCreateOrder: false,
                            error: orderResult.error,
                        };
                    }
                }
                // 4. Analyze message with context
                const analysis = yield this.aiService.analyzeWithContext(messageBody, productsForAI, state.conversationHistory.map((h) => ({
                    role: h.role,
                    message: h.message,
                })), Object.assign({ collectedData: state.collectedData, missingFields: state.missingFields, userMightIndicateDone: this.isNoChangesRequest(messageBody) }, (state.orderIntent === "edit_order" && state.selectedOrderId
                    ? { editOrderContext: { orderId: state.selectedOrderId } }
                    : {})));
                // 4b. Let AI decide if the user wants to reset / start over
                if (analysis.intent === "reset") {
                    state.collectedData = {};
                    state.missingFields = [
                        "products",
                        "quantities",
                        "deliveryDate",
                        "fulfillmentType",
                        "deliveryAddress",
                        "pickupTime",
                    ];
                    state.pendingQuestion = undefined;
                    state.status = "collecting";
                    state.orderId = undefined;
                    state.orderIntent = undefined;
                    state.selectedOrderId = undefined;
                    state.editMode = undefined;
                    // Clear history so old orders are not re-used in context
                    state.conversationHistory = [];
                    const resetMessage = "Oke, pesanan tadi udah saya hapus. Mau pesan apa sekarang? Sebutin aja item + jumlah + kapan mau dikirim.";
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
                // 4c. AI says user is done adding/changing items -> ask for delivery (new order) or go to delivery confirm (edit)
                if (analysis.intent === "done_no_more_changes") {
                    const completeness = this.checkCompleteness(state);
                    const deliveryOnlyMissing = completeness.missingFields.length > 0 &&
                        !completeness.missingFields.includes("products") &&
                        !completeness.missingFields.includes("quantities");
                    if (!state.selectedOrderId && ((_p = state.collectedData.products) === null || _p === void 0 ? void 0 : _p.length) > 0 && !completeness.isComplete && deliveryOnlyMissing) {
                        const question = yield this.generateFollowUpQuestion(completeness.missingFields[0], state, undefined);
                        state.pendingQuestion = {
                            type: "missing_field",
                            field: completeness.missingFields[0],
                            questionText: question,
                        };
                        state.conversationHistory.push({
                            role: "assistant",
                            message: question,
                            timestamp: new Date(),
                        });
                        state.missingFields = completeness.missingFields;
                        state.lastMessageId = twilioMessageId;
                        yield state.save();
                        return {
                            success: true,
                            whatsappResponse: question,
                            shouldCreateOrder: false,
                        };
                    }
                    if (state.orderIntent === "edit_order" &&
                        state.editMode === "add_items" &&
                        state.selectedOrderId) {
                        state.collectedData.products = [];
                        state.collectedData.productsToRemove = undefined;
                        const askDelivery = "Tanggal, alamat, jam mau *sama* aja atau mau *ubah*?\n\nBalas: sama / ubah";
                        state.pendingQuestion = { type: "edit_confirm_delivery", questionText: askDelivery };
                        state.conversationHistory.push({
                            role: "assistant",
                            message: askDelivery,
                            timestamp: new Date(),
                        });
                        state.lastMessageId = twilioMessageId;
                        yield state.save();
                        return { success: true, whatsappResponse: askDelivery, shouldCreateOrder: false };
                    }
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
                    lines.push("Ada beberapa kata yang bisa maksudnya beda produk nih. Kemungkinannya:");
                    // Tampilkan juga produk yang sudah pasti (sudah kami catat) supaya pelanggan tahu apa yang sudah fix
                    if (state.collectedData.products && state.collectedData.products.length > 0) {
                        lines.push("\nYang udah kami catat:");
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
                            const qty = (_s = (_r = (_q = analysis.extractedData.products) === null || _q === void 0 ? void 0 : _q.find((e) => normalize(e.name) === normalize(exactProduct.name))) === null || _r === void 0 ? void 0 : _r.quantity) !== null && _s !== void 0 ? _s : 1;
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
                    lines.push("\nTulis ulang aja dengan nama lengkap + jumlah dari list di atas.\nContoh: Cheesecake 2, Sweet Cake 3, Cheese Biscuit 1.");
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
                // 6. Edit mode: resolve add/subtract/replace from AI editIntent before merging into state
                if (state.orderIntent === "edit_order" &&
                    state.selectedOrderId &&
                    ((_t = analysis.extractedData.products) === null || _t === void 0 ? void 0 : _t.length)) {
                    const order = yield (0, order_action_1.fetchOrderById)(state.selectedOrderId);
                    if ((_u = order === null || order === void 0 ? void 0 : order.items) === null || _u === void 0 ? void 0 : _u.length) {
                        const currentProposed = this.buildCurrentProposedOrderItems(order.items, state.collectedData.products);
                        this.applyEditIntents(analysis.extractedData.products, currentProposed);
                    }
                }
                // 7. Update collected data from analysis
                this.updateCollectedData(state, analysis.extractedData);
                // 8. Check completeness
                const completeness = this.checkCompleteness(state);
                if (!completeness.isComplete) {
                    // Generate follow-up question for first missing field
                    const question = yield this.generateFollowUpQuestion(completeness.missingFields[0], state, analysis.suggestedQuestion);
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
                // 8. All data complete! New order: create. Edit: show proposed items and ask confirm (no DB write yet)
                if (state.orderIntent === "edit_order" && state.selectedOrderId && state.editMode === "add_items") {
                    const oid = state.selectedOrderId;
                    const msg = yield this.buildProposedEditSummary(oid, state);
                    state.pendingQuestion = { type: "edit_confirm_items", questionText: msg };
                    state.lastMessageId = twilioMessageId;
                    state.orderId = oid;
                    state.conversationHistory.push({ role: "assistant", message: msg, timestamp: new Date() });
                    yield state.save();
                    return { success: true, whatsappResponse: msg, orderId: oid, shouldCreateOrder: false };
                }
                const orderMessage = this.buildOrderMessageFromCollectedData(state.collectedData);
                const collectedForOrder = {
                    products: (state.collectedData.products || []).map((p) => ({
                        name: p.name,
                        quantity: p.quantity,
                    })),
                    deliveryDate: state.collectedData.deliveryDate,
                    deliveryAddress: state.collectedData.deliveryAddress,
                    fulfillmentType: state.collectedData.fulfillmentType,
                    pickupTime: state.collectedData.pickupTime,
                };
                const orderResult = yield (0, whatsappOrderProcessing_action_1.processWhatsAppMessageForOrder)(orderMessage, phoneNumber, whatsappMessageMongoId, twilioMessageId, true, // For conversational flow, skip stock checks and just create the order
                collectedForOrder);
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
                        whatsappResponse: orderResult.whatsappResponse ||
                            "❌ Maaf, ada error waktu proses pesanan. Coba lagi ya.",
                        shouldCreateOrder: false,
                        error: orderResult.error,
                    };
                }
            }
            catch (error) {
                console.error("❌ Error in ConversationManager:", error);
                return {
                    success: false,
                    whatsappResponse: "❌ Maaf, ada error. Coba lagi atau hubungi kami langsung ya.",
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
        // Update fulfillment type (pickup vs delivery) whenever the user clearly says pickup or delivery
        // (e.g. "mau di ambil besok jam 3 sore" → pickup) so we don't get stuck asking "what else?"
        if (extractedData.fulfillmentType === "pickup" || extractedData.fulfillmentType === "delivery") {
            state.collectedData.fulfillmentType = extractedData.fulfillmentType;
        }
        // Update pickup / delivery time (free‑form string)
        if (extractedData.pickupTime) {
            state.collectedData.pickupTime = extractedData.pickupTime;
        }
        // Update customer name if provided
        if (extractedData.customerName) {
            state.collectedData.customerName = extractedData.customerName;
        }
        // When editing: products to remove (from "hapus X", etc.)
        if (extractedData.productsToRemove && extractedData.productsToRemove.length > 0) {
            state.collectedData.productsToRemove = extractedData.productsToRemove;
        }
    }
    /** Build current proposed quantities: order items overwritten by collectedData.products (for edit flow). */
    buildCurrentProposedOrderItems(orderItems, collectedProducts) {
        const norm = (s) => s.toLowerCase().trim();
        const map = new Map();
        for (const i of orderItems) {
            map.set(norm(i.name), i.quantity);
        }
        if (collectedProducts === null || collectedProducts === void 0 ? void 0 : collectedProducts.length) {
            for (const p of collectedProducts) {
                map.set(norm(p.name), p.quantity);
            }
        }
        return map;
    }
    /**
     * Apply AI editIntent (add/subtract/replace) to compute final quantity. Mutates products in place.
     * Uses currentProposed so "tambah 2" after "nya 3 aja" uses 3 as base → 5.
     */
    applyEditIntents(products, currentProposed) {
        var _a;
        const norm = (s) => s.toLowerCase().trim();
        for (const p of products) {
            const intent = p.editIntent || "replace";
            const key = norm(p.name);
            const current = (_a = currentProposed.get(key)) !== null && _a !== void 0 ? _a : 0;
            if (intent === "add") {
                p.quantity = current + p.quantity;
            }
            else if (intent === "subtract") {
                p.quantity = Math.max(0, current - p.quantity);
            }
            // "replace": keep p.quantity as-is (already the new total)
        }
    }
    /**
     * Check if all required fields are complete
     */
    checkCompleteness(state) {
        const missing = [];
        const isEditAddItems = state.orderIntent === "edit_order" && state.editMode === "add_items";
        const hasRemovals = !!(state.collectedData.productsToRemove && state.collectedData.productsToRemove.length > 0);
        // Check products (when editing, we can have only removals and no products to add)
        if (!isEditAddItems || !hasRemovals) {
            if (!state.collectedData.products ||
                state.collectedData.products.length === 0) {
                missing.push("products");
            }
            else {
                const hasInvalidQuantity = state.collectedData.products.some((p) => !p.quantity || p.quantity <= 0);
                if (hasInvalidQuantity) {
                    missing.push("quantities");
                }
            }
        }
        else if (isEditAddItems && hasRemovals) {
            // Edit with only removals: no products required
        }
        if (!isEditAddItems) {
            if (!state.collectedData.deliveryDate) {
                missing.push("deliveryDate");
            }
            if (!state.collectedData.fulfillmentType) {
                missing.push("fulfillmentType");
            }
            if (state.collectedData.fulfillmentType === "delivery" &&
                !state.collectedData.deliveryAddress) {
                missing.push("deliveryAddress");
            }
            if (!state.collectedData.pickupTime) {
                missing.push("pickupTime");
            }
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
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            // Always use our clear template for fulfillmentType and pickupTime so we never show
            // generic "what else?" / "ada lagi?" when we're actually waiting for pickup/delivery or time
            if (missingField === "fulfillmentType" || missingField === "pickupTime") {
                const questions = {
                    fulfillmentType: "Mau *ambil di toko* (pickup) atau *dikirim* (delivery)?\n\nBalas: pickup / delivery",
                    pickupTime: state.collectedData.fulfillmentType === "delivery"
                        ? "Jam berapa mau dikirim? (misal: jam 10 pagi, jam 3 sore)"
                        : state.collectedData.fulfillmentType === "pickup"
                            ? "Jam berapa mau ambil di toko? (misal: jam 10 pagi, jam 3 sore)"
                            : "Jam berapa pesanan mau siap? (misal: jam 10 pagi, jam 3 sore)",
                };
                return questions[missingField];
            }
            // In edit mode we only need products/quantities – show current order items so user knows what's in O-xxx
            const isEditAddItems = state.orderIntent === "edit_order" && state.editMode === "add_items";
            if (isEditAddItems && (missingField === "products" || missingField === "quantities")) {
                const oid = state.selectedOrderId || "";
                const order = yield (0, order_action_1.fetchOrderById)(oid);
                const itemsList = ((_a = order === null || order === void 0 ? void 0 : order.items) === null || _a === void 0 ? void 0 : _a.length)
                    ? "Isi pesanan sekarang:\n" +
                        order.items.map((i) => `• ${i.name}: ${i.quantity} pcs`).join("\n") + "\n\n"
                    : "";
                return `${itemsList}Mau tambah/ubah apa ke pesanan *${oid}*? Tulis produk + jumlah (misal: Chiffon 2, Cheesecake 1) atau mau hapus (misal: hapus Cheesecake).`;
            }
            // Use AI suggestion if available for other fields
            if (aiSuggestedQuestion) {
                return aiSuggestedQuestion;
            }
            // Fallback to template questions
            const questions = {
                products: "Mau pesan apa? Sebutin aja nama produknya.",
                quantities: state.collectedData.products
                    ? `Berapa banyak ${state.collectedData.products.map((p) => p.name).join(" dan ")}?`
                    : "Berapa banyak?",
                deliveryDate: "Kapan mau dikirim? (misal: besok, 15 Feb, atau tanggal lain)",
                deliveryAddress: "Alamat pengirimannya mana? (jalan, nomor, kota)",
                fulfillmentType: "Mau *ambil di toko* (pickup) atau *dikirim* (delivery)?\n\nBalas: pickup / delivery",
                pickupTime: state.collectedData.fulfillmentType === "delivery"
                    ? "Jam berapa mau dikirim? (misal: jam 10 pagi, jam 3 sore)"
                    : state.collectedData.fulfillmentType === "pickup"
                        ? "Jam berapa mau ambil di toko? (misal: jam 10 pagi, jam 3 sore)"
                        : "Jam berapa pesanan mau siap? (misal: jam 10 pagi, jam 3 sore)",
            };
            return questions[missingField] || "Lengkapi dulu ya datanya.";
        });
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
     * Build proposed order summary for edit flow (no DB write).
     * Order items + additions - removals = proposed list. Returns message text.
     */
    buildProposedEditSummary(orderId, state) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield (0, order_action_1.fetchOrderById)(orderId);
            if (!order || !order.items)
                return "Pesanan ga ketemu.";
            const norm = (s) => s.toLowerCase().trim();
            const proposed = new Map();
            for (const i of order.items) {
                proposed.set(norm(i.name), { name: i.name, quantity: i.quantity });
            }
            for (const name of state.collectedData.productsToRemove || []) {
                const key = Array.from(proposed.keys()).find((k) => k === norm(name));
                if (key)
                    proposed.delete(key);
            }
            for (const p of state.collectedData.products || []) {
                proposed.set(norm(p.name), { name: p.name, quantity: p.quantity });
            }
            const lines = Array.from(proposed.values()).map((v) => `• ${v.name}: ${v.quantity} pcs`);
            if (lines.length === 0)
                return "Pesanan kosong. Mau tambah apa?";
            return (`Pesanan kamu saat ini (*${orderId}*):\n\n` +
                lines.join("\n") +
                `\n\nUdah benar belum? Balas *ya* / *betul* buat konfirmasi, atau sebutin yang mau diubah.`);
        });
    }
    /** Format product list as menu text (name + price in IDR). */
    formatMenuList(products) {
        return products
            .map((p) => `• ${p.name} - Rp ${p.price.toLocaleString("id-ID")}`)
            .join("\n");
    }
    /** True if user is asking to see the full menu. */
    isShowMenuRequest(message) {
        const n = message.toLowerCase().trim().replace(/\s+/g, " ");
        const patterns = [
            /lihat\s+menu/,
            /mau\s+lihat\s+menu/,
            /tampilkan\s+menu/,
            /daftar\s+menu/,
            /semua\s+menu/,
            /lihat\s+semua\s+menu/,
            /show\s+menu/,
            /menu\s+dong/,
            /mau\s+lihat\s+semua\s+menunya/,
            /lihat\s+menunya/,
            /^\s*menu\s*$/,
        ];
        return patterns.some((re) => re.test(n));
    }
    /** True if user says no changes / already correct (edit flow) or "that's all" / "done" (new order). */
    isNoChangesRequest(message) {
        const n = message.toLowerCase().trim().replace(/\s+/g, " ");
        const patterns = [
            /^sudah\s+benar$/,
            /^tidak\s+ada$/,
            /tidak\s+jadi/,
            /ga\s+jadi/,
            /gak\s+jadi/,
            /sudah\s+oke/,
            /oke\s+aja/,
            /tidak\s+usah\s+ubah/,
            /gak\s+usah\s+ubah/,
            /sudah\s+cukup/,
            /tidak\s+jadi\s+di\s+ubah/,
            /no\s+change/,
            /already\s+ok/,
            /sudah\s+ok/,
            /tetap\s+aja/,
            /ga\s+perlu\s+ubah/,
            /tidak\s+perlu\s+ubah/,
            /^sudah$/,
            /^done$/,
            /^udah$/,
            /sudah\s+selesai/,
            /that'?s\s+it$/,
            /tidak\s+ada\s+lagi/,
            /ga\s+ada\s+lagi/,
            /gak\s+ada\s+lagi/,
            /sudah\s+lengkap/,
            /that'?s\s+all$/,
            /^sip$/,
            /oke\s+sudah/,
        ];
        return patterns.some((re) => re.test(n));
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
