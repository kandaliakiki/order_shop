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
exports.WasteLoggingService = void 0;
const ai_service_1 = require("./ai.service");
const mongoose_1 = require("../mongoose");
const product_model_1 = __importDefault(require("../models/product.model"));
const ingredient_model_1 = __importDefault(require("../models/ingredient.model"));
const wasteLog_model_1 = __importDefault(require("../models/wasteLog.model"));
const lotDeduction_service_1 = require("./lotDeduction.service");
class WasteLoggingService {
    constructor() {
        this.aiService = new ai_service_1.AIService();
        this.lotDeductionService = new lotDeduction_service_1.LotDeductionService();
    }
    processWasteCommand(text, whatsappNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, mongoose_1.connectToDB)();
                // 1. AI extraction
                const extracted = yield this.aiService.analyzeWasteMessage(text);
                if (extracted.items.length === 0) {
                    return {
                        success: false,
                        message: "❌ No waste information found. Please specify item, quantity, and reason.\n\nExample: /waste 5 croissants burnt",
                    };
                }
                // 2. Convert waste items to ingredient requirements (for FEFO deduction)
                const ingredientRequirementsMap = new Map();
                const results = [];
                for (const item of extracted.items) {
                    let found = false;
                    // Check if it's a product
                    const product = yield product_model_1.default.findOne({
                        name: { $regex: new RegExp(item.name, "i") },
                    }).populate("ingredients.ingredient");
                    if (product && product.ingredients && product.ingredients.length > 0) {
                        // Convert product waste to ingredient requirements
                        for (const ing of product.ingredients) {
                            const ingredient = ing.ingredient;
                            if (ingredient) {
                                const totalToDeduct = ing.quantity * item.quantity;
                                const key = `${ingredient._id.toString()}_${ing.unit}`;
                                // Check if ingredient already in requirements map
                                if (ingredientRequirementsMap.has(key)) {
                                    const existingReq = ingredientRequirementsMap.get(key);
                                    existingReq.requiredQuantity += totalToDeduct;
                                    existingReq.isSufficient = existingReq.currentStock >= existingReq.requiredQuantity;
                                    existingReq.shortage = existingReq.isSufficient
                                        ? 0
                                        : existingReq.requiredQuantity - existingReq.currentStock;
                                }
                                else {
                                    // Fetch fresh ingredient data
                                    const freshIngredient = yield ingredient_model_1.default.findById(ingredient._id);
                                    if (freshIngredient) {
                                        ingredientRequirementsMap.set(key, {
                                            ingredientId: freshIngredient._id.toString(),
                                            ingredientName: freshIngredient.name,
                                            unit: ing.unit,
                                            requiredQuantity: totalToDeduct,
                                            currentStock: freshIngredient.currentStock,
                                            minimumStock: freshIngredient.minimumStock,
                                            isSufficient: freshIngredient.currentStock >= totalToDeduct,
                                            shortage: freshIngredient.currentStock >= totalToDeduct
                                                ? 0
                                                : totalToDeduct - freshIngredient.currentStock,
                                        });
                                    }
                                }
                            }
                        }
                        found = true;
                    }
                    else {
                        // Check if it's an ingredient
                        const ingredient = yield ingredient_model_1.default.findOne({
                            name: { $regex: new RegExp(item.name, "i") },
                        });
                        if (ingredient) {
                            const key = `${ingredient._id.toString()}_${item.unit}`;
                            // Check if ingredient already in requirements map
                            if (ingredientRequirementsMap.has(key)) {
                                const existingReq = ingredientRequirementsMap.get(key);
                                existingReq.requiredQuantity += item.quantity;
                                existingReq.isSufficient = existingReq.currentStock >= existingReq.requiredQuantity;
                                existingReq.shortage = existingReq.isSufficient
                                    ? 0
                                    : existingReq.requiredQuantity - existingReq.currentStock;
                            }
                            else {
                                // Fetch fresh ingredient data
                                const freshIngredient = yield ingredient_model_1.default.findById(ingredient._id);
                                if (freshIngredient) {
                                    ingredientRequirementsMap.set(key, {
                                        ingredientId: freshIngredient._id.toString(),
                                        ingredientName: freshIngredient.name,
                                        unit: item.unit,
                                        requiredQuantity: item.quantity,
                                        currentStock: freshIngredient.currentStock,
                                        minimumStock: freshIngredient.minimumStock,
                                        isSufficient: freshIngredient.currentStock >= item.quantity,
                                        shortage: freshIngredient.currentStock >= item.quantity
                                            ? 0
                                            : item.quantity - freshIngredient.currentStock,
                                    });
                                }
                            }
                            found = true;
                        }
                    }
                    if (found) {
                        // Log waste entry
                        yield wasteLog_model_1.default.create({
                            itemName: item.name,
                            quantity: item.quantity,
                            unit: item.unit,
                            reason: item.reason,
                            loggedBy: whatsappNumber,
                            loggedAt: new Date(),
                        });
                        results.push(`✅ ${item.quantity} ${item.unit} ${item.name} (${item.reason})`);
                    }
                    else {
                        results.push(`❌ ${item.name} not found`);
                    }
                }
                // 3. Convert map to array and ensure all are marked as sufficient for waste deduction
                // (For waste, we deduct regardless of current stock level)
                const ingredientRequirements = Array.from(ingredientRequirementsMap.values()).map(req => (Object.assign(Object.assign({}, req), { isSufficient: true })));
                // 4. Deduct from lots using FEFO (First Expired First Out)
                if (ingredientRequirements.length > 0) {
                    const deductionResult = yield this.lotDeductionService.deductFromLots(ingredientRequirements);
                    if (!deductionResult.success && deductionResult.errors.length > 0) {
                        console.warn("Some waste deductions failed:", deductionResult.errors);
                        // Still return success but note the errors
                        results.push(`\n⚠️ Note: Some stock deductions had issues. Please check manually.`);
                    }
                }
                return {
                    success: true,
                    message: `Waste Logged:\n${results.join("\n")}`,
                };
            }
            catch (error) {
                console.error("Error processing waste command:", error);
                return {
                    success: false,
                    message: `❌ Error logging waste: ${error.message}`,
                };
            }
        });
    }
}
exports.WasteLoggingService = WasteLoggingService;
