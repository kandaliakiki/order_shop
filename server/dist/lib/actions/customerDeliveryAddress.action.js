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
exports.deleteCustomerDeliveryAddress = exports.saveCustomerDeliveryAddress = exports.getCustomerDeliveryAddress = void 0;
const mongoose_1 = require("../mongoose");
const customerDeliveryAddress_model_1 = __importDefault(require("../models/customerDeliveryAddress.model"));
/**
 * Get the saved delivery address for a phone number
 */
const getCustomerDeliveryAddress = (phoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        const record = yield customerDeliveryAddress_model_1.default.findOne({ phoneNumber });
        if (!record)
            return null;
        return {
            deliveryAddress: record.deliveryAddress,
            pickupTime: record.pickupTime,
        };
    }
    catch (error) {
        console.error("Error getting customer delivery address:", error);
        return null;
    }
});
exports.getCustomerDeliveryAddress = getCustomerDeliveryAddress;
/**
 * Save or update the delivery address for a phone number
 */
const saveCustomerDeliveryAddress = (phoneNumber, deliveryAddress, pickupTime) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        yield customerDeliveryAddress_model_1.default.findOneAndUpdate({ phoneNumber }, {
            phoneNumber,
            deliveryAddress,
            pickupTime,
            updatedAt: new Date(),
        }, { upsert: true, new: true });
        return true;
    }
    catch (error) {
        console.error("Error saving customer delivery address:", error);
        return false;
    }
});
exports.saveCustomerDeliveryAddress = saveCustomerDeliveryAddress;
/**
 * Delete the delivery address for a phone number (optional, for cleanup)
 */
const deleteCustomerDeliveryAddress = (phoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        yield customerDeliveryAddress_model_1.default.deleteOne({ phoneNumber });
        return true;
    }
    catch (error) {
        console.error("Error deleting customer delivery address:", error);
        return false;
    }
});
exports.deleteCustomerDeliveryAddress = deleteCustomerDeliveryAddress;
