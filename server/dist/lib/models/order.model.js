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
const mongoose_1 = __importDefault(require("mongoose"));
const counter_model_1 = __importDefault(require("./counter.model")); // Import the counter model
// Custom function to generate sequential orderId with 'O-' prefix
function generateOrderId() {
    return __awaiter(this, void 0, void 0, function* () {
        const counter = yield counter_model_1.default.findByIdAndUpdate({ _id: "orderId" }, { $inc: { seq: 1 } }, { new: true, upsert: true });
        const seq = counter.seq.toString().padStart(4, "0"); // Ensure 4 digits
        return `O-${seq}`; // Prefix with 'O-'
    });
}
// Define the schema for an item in the order
const itemSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
});
// Define the schema for an order
const orderSchema = new mongoose_1.default.Schema({
    orderId: {
        type: String,
        unique: true,
    },
    customerName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    items: { type: [itemSchema], required: true },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    status: { type: String, default: "New Order" }, // Add status field
    createdAt: { type: Date, default: Date.now },
});
// Middleware to generate orderId before saving
orderSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.orderId) {
            this.orderId = yield generateOrderId();
        }
        next();
    });
});
const Order = mongoose_1.default.model("Order", orderSchema);
exports.default = Order;
