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
            fulfillmentType: String,
            pickupTime: String,
            customerName: String,
            productsToRemove: [String],
        },
        default: {},
    },
    missingFields: {
        type: [String],
        default: [
            "products",
            "quantities",
            "deliveryDate",
            "fulfillmentType",
            "deliveryAddress",
            "pickupTime",
        ],
    },
    pendingQuestion: {
        type: {
            type: String,
            enum: ["missing_field", "product_clarification", "new_or_edit", "order_selection", "add_or_change", "edit_follow_up", "edit_change_delivery", "edit_confirm_items", "edit_confirm_delivery"],
            field: String,
            similarProducts: [{ name: String, price: Number }],
            questionText: String,
            orderList: [{ orderId: String, summary: String }],
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
    orderId: { type: String },
    orderIntent: { type: String, enum: ["new_order", "edit_order"] },
    selectedOrderId: { type: String },
    editMode: { type: String, enum: ["add_items", "change_items"] },
}, {
    timestamps: true,
});
// Index for finding active conversations
conversationStateSchema.index({ phoneNumber: 1, status: 1 });
const ConversationState = mongoose_1.default.models.ConversationState ||
    mongoose_1.default.model("ConversationState", conversationStateSchema);
exports.default = ConversationState;
