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
exports.TestingChatService = void 0;
const mongoose_1 = require("../mongoose");
const mongoose_2 = require("mongoose");
const conversationState_model_1 = __importDefault(require("../models/conversationState.model"));
const conversationManager_service_1 = require("./conversationManager.service");
class TestingChatService {
    constructor() {
        this.conversationManager = new conversationManager_service_1.ConversationManager();
    }
    processMessage(phoneNumber_1, message_1) {
        return __awaiter(this, arguments, void 0, function* (phoneNumber, message, includeDebug = false) {
            var _a;
            try {
                yield (0, mongoose_1.connectToDB)();
                const ts = Date.now();
                const result = yield this.conversationManager.processMessage(message, phoneNumber, `test_${ts}`, new mongoose_2.Types.ObjectId().toString());
                const response = {
                    success: result.success,
                    whatsappResponse: result.whatsappResponse,
                };
                if (includeDebug) {
                    const conversation = yield conversationState_model_1.default.findOne({ phoneNumber });
                    if (conversation) {
                        response.debugInfo = {
                            currentState: this.getCurrentState(conversation),
                            missingFields: conversation.missingFields,
                            products: ((_a = conversation.collectedData) === null || _a === void 0 ? void 0 : _a.products) || [],
                            collectedData: conversation.collectedData,
                            conversationHistory: conversation.conversationHistory,
                            status: conversation.status,
                            pendingQuestion: conversation.pendingQuestion,
                        };
                    }
                }
                return response;
            }
            catch (error) {
                console.error("Testing chat service error:", error);
                return {
                    success: false,
                    whatsappResponse: "Maaf, terjadi kesalahan saat memproses pesanan.",
                    error: error instanceof Error ? error.message : "Unknown error",
                };
            }
        });
    }
    getConversation(phoneNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            yield (0, mongoose_1.connectToDB)();
            const conversation = yield conversationState_model_1.default.findOne({ phoneNumber });
            if (!conversation) {
                return null;
            }
            return {
                phoneNumber: conversation.phoneNumber,
                status: conversation.status,
                createdAt: conversation.createdAt,
                updatedAt: conversation.updatedAt,
                messageCount: ((_a = conversation.conversationHistory) === null || _a === void 0 ? void 0 : _a.length) || 0,
                currentState: this.getCurrentState(conversation),
                missingFields: conversation.missingFields,
                products: ((_b = conversation.collectedData) === null || _b === void 0 ? void 0 : _b.products) || [],
                conversationHistory: conversation.conversationHistory || [],
                collectedData: conversation.collectedData,
                pendingQuestion: conversation.pendingQuestion,
            };
        });
    }
    resetConversation(phoneNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, mongoose_1.connectToDB)();
            yield conversationState_model_1.default.deleteOne({ phoneNumber });
        });
    }
    getCurrentState(conversation) {
        var _a, _b, _c;
        const pendingType = (_a = conversation.pendingQuestion) === null || _a === void 0 ? void 0 : _a.type;
        if (!pendingType) {
            return ((_c = (_b = conversation.collectedData) === null || _b === void 0 ? void 0 : _b.products) === null || _c === void 0 ? void 0 : _c.length)
                ? "collect_field"
                : "collect_products";
        }
        const stateMap = {
            missing_field: "collect_field",
            product_clarification: "clarify_products",
            new_or_edit: "new_order_check",
            order_selection: "edit_select_order",
            add_or_change: "edit_collect_changes",
            edit_confirm_items: "edit_confirm_items",
            edit_confirm_delivery: "edit_confirm_delivery",
            edit_change_delivery: "edit_change_delivery",
            confirm_previous_address: "confirm_address",
            confirm_items_done: "confirm_items_done",
        };
        return stateMap[pendingType] || "unknown";
    }
}
exports.TestingChatService = TestingChatService;
