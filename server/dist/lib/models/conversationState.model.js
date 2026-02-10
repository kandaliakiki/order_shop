"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const conversationStateSchema = new mongoose_1.default.Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    status: {
        type: String,
        enum: ["collecting", "completed", "cancelled"],
        default: "collecting",
    },
    collectedData: {
        type: {
            products: [
                {
                    name: String,
                    quantity: Number,
                    confidence: Number,
                },
            ],
            deliveryDate: String,
            deliveryAddress: String,
            customerName: String,
        },
        default: {},
    },
    missingFields: {
        type: [String],
        default: ["products", "quantities", "deliveryDate", "deliveryAddress"],
    },
    pendingQuestion: {
        type: {
            type: String,
            enum: ["missing_field", "product_clarification"],
            field: String,
            similarProducts: [
                {
                    name: String,
                    price: Number,
                },
            ],
            questionText: String,
        },
    },
    conversationHistory: [
        {
            role: {
                type: String,
                enum: ["user", "assistant"],
            },
            message: String,
            timestamp: Date,
        },
    ],
    lastMessageId: String,
    orderId: {
        type: String,
    },
}, {
    timestamps: true,
});
// Index for finding active conversations
conversationStateSchema.index({ phoneNumber: 1, status: 1 });
const ConversationState = mongoose_1.default.models.ConversationState ||
    mongoose_1.default.model("ConversationState", conversationStateSchema);
exports.default = ConversationState;
