"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Define the schema for an item in the order
const itemSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
});
// Define the schema for an order
const orderSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    status: { type: String, required: true },
    time: { type: String, required: true },
    items: { type: [itemSchema], required: true },
});
const Order = mongoose_1.default.model("Order", orderSchema);
exports.default = Order;
