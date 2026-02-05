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
exports.ExpiryCheckService = void 0;
const mongoose_1 = require("../mongoose");
const ingredientLot_model_1 = __importDefault(require("../models/ingredientLot.model"));
const ingredient_model_1 = __importDefault(require("../models/ingredient.model"));
const date_fns_1 = require("date-fns");
class ExpiryCheckService {
    processExpiryCommand(itemName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, mongoose_1.connectToDB)();
                if (itemName) {
                    // Check specific item
                    const ingredient = yield ingredient_model_1.default.findOne({
                        name: { $regex: new RegExp(itemName, "i") },
                    });
                    if (!ingredient) {
                        return {
                            message: `❌ ${itemName} not found in ingredients.`,
                        };
                    }
                    const lots = yield ingredientLot_model_1.default.find({
                        ingredient: ingredient._id,
                        currentStock: { $gt: 0 }, // Only non-empty lots
                    }).sort({ expiryDate: 1 });
                    if (lots.length === 0) {
                        return {
                            message: `✅ ${itemName} - No active lots found.`,
                        };
                    }
                    const expiringSoon = lots.filter((lot) => {
                        const daysUntilExpiry = (0, date_fns_1.differenceInDays)(new Date(lot.expiryDate), new Date());
                        return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
                    });
                    if (expiringSoon.length === 0) {
                        return {
                            message: `✅ ${itemName} - No items expiring in the next 7 days.`,
                        };
                    }
                    const list = expiringSoon
                        .map((lot) => `• ${lot.currentStock} ${lot.unit} - Expires: ${(0, date_fns_1.format)(new Date(lot.expiryDate), "MMM dd, yyyy")} (${(0, date_fns_1.differenceInDays)(new Date(lot.expiryDate), new Date())} days)`)
                        .join("\n");
                    return {
                        message: `⚠️ ${itemName} - Expiring Soon:\n${list}`,
                    };
                }
                else {
                    // Top 5 expiring soonest
                    const allLots = yield ingredientLot_model_1.default.find({
                        currentStock: { $gt: 0 },
                    })
                        .populate("ingredient", "name")
                        .sort({ expiryDate: 1 })
                        .limit(5);
                    if (allLots.length === 0) {
                        return {
                            message: `✅ No active ingredient lots found.`,
                        };
                    }
                    const top5 = allLots
                        .map((lot) => {
                        const daysLeft = (0, date_fns_1.differenceInDays)(new Date(lot.expiryDate), new Date());
                        return {
                            ingredientName: lot.ingredient.name,
                            quantity: lot.currentStock,
                            unit: lot.unit,
                            expiryDate: lot.expiryDate,
                            daysLeft,
                        };
                    })
                        .filter((item) => item.daysLeft <= 7 && item.daysLeft >= 0);
                    if (top5.length === 0) {
                        return {
                            message: `✅ No ingredients expiring in the next 7 days.`,
                        };
                    }
                    const list = top5
                        .map((item) => `• ${item.ingredientName}: ${item.quantity} ${item.unit} - ${(0, date_fns_1.format)(new Date(item.expiryDate), "MMM dd")} (${item.daysLeft} days)`)
                        .join("\n");
                    return {
                        message: `⚠️ Top 5 Expiring Ingredients:\n${list}`,
                    };
                }
            }
            catch (error) {
                console.error("Error processing expiry command:", error);
                return {
                    message: `❌ Error checking expiry: ${error.message}`,
                };
            }
        });
    }
}
exports.ExpiryCheckService = ExpiryCheckService;
