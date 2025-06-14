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
exports.calculateTotalItemsSold = exports.countTotalOrders = exports.fetchOverallRevenue = exports.searchOrdersByCustomerName = exports.updateOrderStatus = exports.createOrder = exports.fetchOrders = void 0;
const mongoose_1 = require("../mongoose");
const order_model_1 = __importDefault(require("../models/order.model"));
// Function to fetch all orders
const fetchOrders = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (limit = 0, dateRange) {
    yield (0, mongoose_1.connectToDB)();
    try {
        const query = order_model_1.default.find();
        // Apply date range filter if provided
        if (dateRange && dateRange.from && dateRange.to) {
            query
                .where("createdAt")
                .gte(dateRange.from.getTime())
                .lte(dateRange.to.getTime());
        }
        query.sort({ createdAt: -1 });
        if (limit > 0) {
            query.limit(limit);
        }
        const orders = yield query;
        return orders;
    }
    catch (error) {
        console.error("Error fetching orders:", error);
        throw error;
    }
});
exports.fetchOrders = fetchOrders;
// Function to create a new order
const createOrder = (orderData) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        const order = new order_model_1.default(orderData);
        yield order.save();
        return order;
    }
    catch (error) {
        console.error("Error creating order:", error);
        throw error;
    }
});
exports.createOrder = createOrder;
// Function to update the status of an order
const updateOrderStatus = (orderId, newStatus) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        const order = yield order_model_1.default.findOneAndUpdate({ orderId }, { status: newStatus }, { new: true });
        if (!order) {
            throw new Error("Order not found");
        }
        return order;
    }
    catch (error) {
        console.error("Error updating order status:", error);
        throw error;
    }
});
exports.updateOrderStatus = updateOrderStatus;
// Function to search orders by customer name
const searchOrdersByCustomerName = (customerName, dateRange) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        const query = order_model_1.default.find({
            customerName: { $regex: new RegExp(customerName, "i") }, // Case-insensitive search
        });
        // Apply date range filter if provided
        if (dateRange && dateRange.from && dateRange.to) {
            query
                .where("createdAt")
                .gte(dateRange.from.getTime())
                .lte(dateRange.to.getTime());
        }
        const orders = yield query.sort({ createdAt: -1 }); // Sort by createdAt in descending order
        return orders;
    }
    catch (error) {
        console.error("Error searching orders by customer name:", error);
        throw error;
    }
});
exports.searchOrdersByCustomerName = searchOrdersByCustomerName;
const fetchOverallRevenue = (dateRange) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        const query = order_model_1.default.find();
        // Apply date range filter if provided
        if (dateRange && dateRange.from && dateRange.to) {
            query
                .where("createdAt")
                .gte(dateRange.from.getTime())
                .lte(dateRange.to.getTime());
        }
        const orders = yield query;
        return orders.reduce((sum, order) => sum + order.total, 0);
    }
    catch (error) {
        console.error("Error fetching overall revenue:", error);
        throw error;
    }
});
exports.fetchOverallRevenue = fetchOverallRevenue;
const countTotalOrders = (dateRange) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        const query = order_model_1.default.find();
        // Apply date range filter if provided
        if (dateRange && dateRange.from && dateRange.to) {
            query
                .where("createdAt")
                .gte(dateRange.from.getTime())
                .lte(dateRange.to.getTime());
        }
        return yield query.countDocuments();
    }
    catch (error) {
        console.error("Error counting total orders:", error);
        throw error;
    }
});
exports.countTotalOrders = countTotalOrders;
const calculateTotalItemsSold = (dateRange) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        const query = order_model_1.default.find();
        // Apply date range filter if provided
        if (dateRange && dateRange.from && dateRange.to) {
            query
                .where("createdAt")
                .gte(dateRange.from.getTime())
                .lte(dateRange.to.getTime());
        }
        const orders = yield query;
        return orders.reduce((sum, order) => {
            return (sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0));
        }, 0);
    }
    catch (error) {
        console.error("Error calculating total items sold:", error);
        throw error;
    }
});
exports.calculateTotalItemsSold = calculateTotalItemsSold;
