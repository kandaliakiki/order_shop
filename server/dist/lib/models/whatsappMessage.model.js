"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const whatsappMessageSchema = new mongoose_1.default.Schema({
    messageId: {
        type: String,
        required: true,
        unique: true,
    },
    from: {
        type: String,
        required: true,
    },
    to: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    orderId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Order",
    },
    analyzed: {
        type: Boolean,
        default: false,
    },
    analysisResult: {
        type: {
            extractedData: mongoose_1.default.Schema.Types.Mixed,
            confidence: Number,
            error: String,
        },
    },
}, {
    timestamps: true,
});
const WhatsAppMessage = mongoose_1.default.models.WhatsAppMessage ||
    mongoose_1.default.model("WhatsAppMessage", whatsappMessageSchema);
exports.default = WhatsAppMessage;
