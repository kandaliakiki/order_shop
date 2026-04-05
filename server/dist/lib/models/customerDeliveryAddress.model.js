"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const customerDeliveryAddressSchema = new mongoose_1.default.Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    deliveryAddress: {
        type: String,
        required: true,
    },
    pickupTime: {
        type: String,
        required: false,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});
const CustomerDeliveryAddress = mongoose_1.default.models.CustomerDeliveryAddress ||
    mongoose_1.default.model("CustomerDeliveryAddress", customerDeliveryAddressSchema);
exports.default = CustomerDeliveryAddress;
