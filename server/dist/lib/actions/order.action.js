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
exports.fetchOrderById = exports.calculateTotalItemsSold = exports.countTotalOrders = exports.fetchOverallRevenue = exports.searchOrdersByCustomerName = exports.updateOrderStatus = exports.createOrder = exports.fetchOrders = void 0;
const mongoose_1 = require("../mongoose");
const order_model_1 = __importDefault(require("../models/order.model"));
const stockDeduction_service_1 = require("../services/stockDeduction.service");
const stockReservation_service_1 = require("../services/stockReservation.service");
const ingredientStockCalculation_service_1 = require("../services/ingredientStockCalculation.service");
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
        const order = yield order_model_1.default.findOne({ orderId });
        if (!order) {
            throw new Error("Order not found");
        }
        const oldStatus = order.status;
        // Update order status
        const updatedOrder = yield order_model_1.default.findOneAndUpdate({ orderId }, { status: newStatus }, { new: true });
        // Handle stock operations based on status change
        if (oldStatus !== newStatus) {
            const stockCalculationService = new ingredientStockCalculation_service_1.IngredientStockCalculationService();
            const stockCalculation = yield stockCalculationService.calculateOrderIngredientRequirements(order);
            // When changing to "On Process": Deduct stock (from reserved stock)
            if (newStatus === "On Process" && oldStatus !== "On Process") {
                const stockDeductionService = new stockDeduction_service_1.StockDeductionService();
                const deductionResult = yield stockDeductionService.deductStockForOrder(stockCalculation.requirements);
                if (deductionResult.success) {
                    // Release reserved stock (since we're now deducting actual stock)
                    const stockReservationService = new stockReservation_service_1.StockReservationService();
                    yield stockReservationService.releaseReservedStock(stockCalculation.requirements);
                    // Store lot usage metadata if available
                    if (deductionResult.lotUsageMetadata) {
                        yield order_model_1.default.findOneAndUpdate({ orderId }, { lotUsageMetadata: deductionResult.lotUsageMetadata }, { new: true });
                    }
                    console.log(`✅ Order ${orderId} status changed to "On Process", stock deducted from reserved stock`);
                }
                else {
                    console.warn(`⚠️ Failed to deduct stock for order ${orderId} when changing to "On Process"`);
                }
            }
            // When changing to "Cancelled": Release reserved stock
            if (newStatus === "Cancelled" && oldStatus !== "Cancelled") {
                const stockReservationService = new stockReservation_service_1.StockReservationService();
                const releaseResult = yield stockReservationService.releaseReservedStock(stockCalculation.requirements);
                if (releaseResult.success) {
                    console.log(`✅ Order ${orderId} cancelled, reserved stock released`);
                }
                else {
                    console.warn(`⚠️ Failed to release reserved stock for cancelled order ${orderId}`);
                }
            }
        }
        return updatedOrder;
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
// Function to fetch order by orderId with populated product data
const fetchOrderById = (orderId) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        const order = yield order_model_1.default.findOne({ orderId }).populate("whatsappMessageId");
        if (!order) {
            throw new Error("Order not found");
        }
        return order;
    }
    catch (error) {
        console.error("Error fetching order by ID:", error);
        throw error;
    }
});
exports.fetchOrderById = fetchOrderById;
