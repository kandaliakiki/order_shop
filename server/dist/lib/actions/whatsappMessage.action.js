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
exports.linkMessageToOrder = exports.updateMessageAnalysis = exports.fetchWhatsAppMessagesByOrderId = exports.fetchWhatsAppMessageById = exports.fetchWhatsAppMessages = exports.createWhatsAppMessage = void 0;
const mongoose_1 = require("../mongoose");
const whatsappMessage_model_1 = __importDefault(require("../models/whatsappMessage.model"));
// Create a new WhatsApp message
const createWhatsAppMessage = (messageData) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        const message = new whatsappMessage_model_1.default(messageData);
        yield message.save();
        return message;
    }
    catch (error) {
        console.error("Error creating WhatsApp message:", error);
        throw error;
    }
});
exports.createWhatsAppMessage = createWhatsAppMessage;
// Fetch all WhatsApp messages
const fetchWhatsAppMessages = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        const messages = yield whatsappMessage_model_1.default.find({})
            .populate("orderId")
            .sort({ createdAt: -1 });
        return messages;
    }
    catch (error) {
        console.error("Error fetching WhatsApp messages:", error);
        throw error;
    }
});
exports.fetchWhatsAppMessages = fetchWhatsAppMessages;
// Fetch message by ID
const fetchWhatsAppMessageById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        const message = yield whatsappMessage_model_1.default.findById(id).populate("orderId");
        if (!message) {
            throw new Error("Message not found");
        }
        return message;
    }
    catch (error) {
        console.error("Error fetching WhatsApp message by ID:", error);
        throw error;
    }
});
exports.fetchWhatsAppMessageById = fetchWhatsAppMessageById;
// Fetch messages by order ID
const fetchWhatsAppMessagesByOrderId = (orderId) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        const messages = yield whatsappMessage_model_1.default.find({ orderId }).sort({
            createdAt: -1,
        });
        return messages;
    }
    catch (error) {
        console.error("Error fetching messages by order ID:", error);
        throw error;
    }
});
exports.fetchWhatsAppMessagesByOrderId = fetchWhatsAppMessagesByOrderId;
// Update message analysis result
const updateMessageAnalysis = (messageId, analysisResult) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        const message = yield whatsappMessage_model_1.default.findOneAndUpdate({ messageId }, {
            analyzed: true,
            analysisResult,
        }, { new: true });
        return message;
    }
    catch (error) {
        console.error("Error updating message analysis:", error);
        throw error;
    }
});
exports.updateMessageAnalysis = updateMessageAnalysis;
// Link message to order
const linkMessageToOrder = (messageId, orderId) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        const message = yield whatsappMessage_model_1.default.findOneAndUpdate({ messageId }, { orderId }, { new: true });
        return message;
    }
    catch (error) {
        console.error("Error linking message to order:", error);
        throw error;
    }
});
exports.linkMessageToOrder = linkMessageToOrder;
