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
exports.StockAdditionService = void 0;
const mongoose_1 = require("../mongoose");
const ingredient_model_1 = __importDefault(require("../models/ingredient.model"));
const ingredientLot_model_1 = __importDefault(require("../models/ingredientLot.model"));
const ai_service_1 = require("./ai.service");
const date_fns_1 = require("date-fns");
class StockAdditionService {
    constructor() {
        this.aiService = new ai_service_1.AIService();
    }
    processStockAddition(message, whatsappNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, mongoose_1.connectToDB)();
                // 1. Parse user input with AI
                const parsed = yield this.aiService.parseStockAddition(message);
                if (!parsed.ingredientName || parsed.quantity <= 0) {
                    return {
                        success: false,
                        message: `❌ Could not parse stock information. Please provide ingredient name and quantity.\nExample: "/stock 10kg flour"`,
                    };
                }
                // 2. Find ingredient (fuzzy match)
                const ingredient = yield this.findIngredient(parsed.ingredientName);
                if (!ingredient) {
                    return {
                        success: false,
                        message: `❌ Ingredient "${parsed.ingredientName}" not found. Please check the name and try again.`,
                    };
                }
                // 3. Calculate expiry date with priority logic
                // Priority: user-specified > ingredient.defaultExpiryDays > AI prediction > safe default (30 days)
                const { expiryDate, expirySource } = yield this.calculateExpiryDate(ingredient, parsed.expiryDays);
                // 4. Create lot
                const lot = yield ingredientLot_model_1.default.create({
                    ingredient: ingredient._id,
                    quantity: parsed.quantity,
                    unit: parsed.unit || ingredient.unit,
                    expiryDate: expiryDate,
                    purchaseDate: new Date(),
                    supplier: parsed.supplier,
                    cost: parsed.cost,
                    currentStock: parsed.quantity, // New lot, full quantity available
                    expirySource: expirySource, // Track how expiry was determined
                });
                // 5. Update ingredient total stock
                ingredient.currentStock += parsed.quantity;
                yield ingredient.save();
                // 6. Format response
                const expiryDays = this.getDaysUntilExpiry(expiryDate);
                const expiryDateStr = (0, date_fns_1.format)(expiryDate, "MMM dd, yyyy");
                let response = `✅ Added ${parsed.quantity} ${parsed.unit || ingredient.unit} ${ingredient.name}\n`;
                response += `📦 Lot ID: ${lot.lotId}\n`;
                response += `📅 Expiry: ${expiryDateStr} (${expiryDays} days)`;
                // Add note if AI failed and defaulted to 30 days
                if (expirySource === "default") {
                    response += `\n⚠️ Note: Expiry date defaulted to 30 days (AI prediction unavailable)`;
                }
                response += `\n📊 Total Stock: ${ingredient.currentStock} ${ingredient.unit}`;
                if (parsed.supplier) {
                    response += `\n🏪 Supplier: ${parsed.supplier}`;
                }
                if (parsed.cost) {
                    response += `\n💰 Cost: $${parsed.cost.toFixed(2)}`;
                }
                return {
                    success: true,
                    message: response,
                };
            }
            catch (error) {
                console.error("Error processing stock addition:", error);
                return {
                    success: false,
                    message: `❌ Error: ${error.message || "Failed to add stock"}`,
                };
            }
        });
    }
    findIngredient(name) {
        return __awaiter(this, void 0, void 0, function* () {
            // Try exact match first
            let ingredient = yield ingredient_model_1.default.findOne({
                name: { $regex: new RegExp(`^${name}$`, "i") },
            });
            if (ingredient)
                return ingredient;
            // Try partial match
            ingredient = yield ingredient_model_1.default.findOne({
                name: { $regex: new RegExp(name, "i") },
            });
            return ingredient;
        });
    }
    calculateExpiryDate(ingredient, customExpiryDays) {
        return __awaiter(this, void 0, void 0, function* () {
            // PRIORITY 1: User-specified expiry (from WhatsApp)
            if (customExpiryDays) {
                return {
                    expiryDate: (0, date_fns_1.addDays)(new Date(), customExpiryDays),
                    expirySource: "user",
                };
            }
            // PRIORITY 2: Ingredient's defaultExpiryDays (from database)
            if (ingredient.defaultExpiryDays && ingredient.defaultExpiryDays > 0) {
                return {
                    expiryDate: (0, date_fns_1.addDays)(new Date(), ingredient.defaultExpiryDays),
                    expirySource: "database",
                };
            }
            // PRIORITY 3: AI Prediction (only if ingredient.defaultExpiryDays is NOT set)
            try {
                const predictedDays = yield this.aiService.predictExpiryDays(ingredient.name);
                return {
                    expiryDate: (0, date_fns_1.addDays)(new Date(), predictedDays),
                    expirySource: "ai",
                };
            }
            catch (error) {
                console.error("AI prediction failed, using safe default (30 days):", error);
                // PRIORITY 4: Safe default (30 days) if AI fails
                return {
                    expiryDate: (0, date_fns_1.addDays)(new Date(), 30),
                    expirySource: "default",
                };
            }
        });
    }
    getDaysUntilExpiry(expiryDate) {
        return Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    }
}
exports.StockAdditionService = StockAdditionService;
