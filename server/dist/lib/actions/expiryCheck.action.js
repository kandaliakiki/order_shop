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
exports.fetchIngredientLotsByIngredient = exports.fetchExpiringIngredients = void 0;
const mongoose_1 = require("../mongoose");
const ingredientLot_model_1 = __importDefault(require("../models/ingredientLot.model"));
const date_fns_1 = require("date-fns");
const fetchExpiringIngredients = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (days = 7, limit = 5) {
    yield (0, mongoose_1.connectToDB)();
    try {
        const allLots = yield ingredientLot_model_1.default.find({
            currentStock: { $gt: 0 },
        })
            .populate("ingredient", "name unit currentStock")
            .sort({ expiryDate: 1 })
            .limit(limit * 10); // Get more to filter
        const now = new Date();
        const expiring = allLots
            .map((lot) => {
            const daysLeft = (0, date_fns_1.differenceInDays)(new Date(lot.expiryDate), now);
            return {
                lotId: lot.lotId,
                ingredientId: lot.ingredient._id,
                ingredientName: lot.ingredient.name,
                quantity: lot.currentStock,
                unit: lot.unit,
                expiryDate: lot.expiryDate,
                daysLeft,
            };
        })
            .filter((item) => item.daysLeft <= days && item.daysLeft >= 0)
            .slice(0, limit);
        return expiring;
    }
    catch (error) {
        console.error("Error fetching expiring ingredients:", error);
        throw error;
    }
});
exports.fetchExpiringIngredients = fetchExpiringIngredients;
const fetchIngredientLotsByIngredient = (ingredientId) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        return yield ingredientLot_model_1.default.find({
            ingredient: ingredientId,
            currentStock: { $gt: 0 },
        })
            .sort({ expiryDate: 1 });
    }
    catch (error) {
        console.error("Error fetching ingredient lots:", error);
        throw error;
    }
});
exports.fetchIngredientLotsByIngredient = fetchIngredientLotsByIngredient;
