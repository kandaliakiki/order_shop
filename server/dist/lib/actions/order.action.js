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
exports.fetchOrders = void 0;
const mongoose_1 = require("../mongoose");
const order_model_1 = __importDefault(require("../models/order.model"));
// Function to fetch all orders
const fetchOrders = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        const orders = yield order_model_1.default.find({});
        return orders;
    }
    catch (error) {
        console.error("Error fetching orders:", error);
        throw error;
    }
});
exports.fetchOrders = fetchOrders;
