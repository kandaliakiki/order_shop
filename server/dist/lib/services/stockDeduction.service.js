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
exports.StockDeductionService = void 0;
const mongoose_1 = require("../mongoose");
const ingredient_model_1 = __importDefault(require("../models/ingredient.model"));
const lotDeduction_service_1 = require("./lotDeduction.service");
class StockDeductionService {
    constructor() {
        this.lotDeductionService = new lotDeduction_service_1.LotDeductionService();
    }
    /**
     * Deduct ingredient stock for an order using FEFO lot-based deduction
     * Only deducts if all ingredients are sufficient
     * Falls back to aggregate deduction if no lots exist
     */
    deductStockForOrder(requirements) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, mongoose_1.connectToDB)();
            const deductedIngredients = [];
            const errors = [];
            // Check if all ingredients are sufficient first
            const allSufficient = requirements.every((r) => r.isSufficient);
            if (!allSufficient) {
                return {
                    success: false,
                    deductedIngredients: [],
                    errors: ["Cannot deduct stock: insufficient ingredients"],
                };
            }
            // Try lot-based deduction first
            const lotDeductionResult = yield this.lotDeductionService.deductFromLots(requirements);
            if (lotDeductionResult.success && lotDeductionResult.lotsUsed.length > 0) {
                // Lot-based deduction succeeded
                // Get updated stock for each ingredient
                for (const requirement of requirements) {
                    const ingredient = yield ingredient_model_1.default.findById(requirement.ingredientId);
                    if (ingredient) {
                        deductedIngredients.push({
                            ingredientId: requirement.ingredientId,
                            ingredientName: requirement.ingredientName,
                            quantityDeducted: requirement.requiredQuantity,
                            newStock: ingredient.currentStock,
                        });
                    }
                }
                return {
                    success: true,
                    deductedIngredients,
                    lotUsageMetadata: {
                        lotsUsed: lotDeductionResult.lotsUsed,
                        deductedAt: new Date(),
                    },
                    errors: [],
                };
            }
            // Fallback: Aggregate deduction (if no lots exist or lot deduction failed)
            console.log("⚠️ Lot-based deduction not available, falling back to aggregate deduction");
            for (const requirement of requirements) {
                try {
                    const ingredient = yield ingredient_model_1.default.findById(requirement.ingredientId);
                    if (!ingredient) {
                        errors.push(`Ingredient "${requirement.ingredientName}" not found`);
                        continue;
                    }
                    // Calculate new stock
                    const newStock = ingredient.currentStock - requirement.requiredQuantity;
                    // Update ingredient stock
                    ingredient.currentStock = newStock;
                    yield ingredient.save();
                    deductedIngredients.push({
                        ingredientId: requirement.ingredientId,
                        ingredientName: requirement.ingredientName,
                        quantityDeducted: requirement.requiredQuantity,
                        newStock: ingredient.currentStock,
                    });
                    console.log(`✅ Deducted ${requirement.requiredQuantity} ${requirement.unit} of ${requirement.ingredientName}. New stock: ${ingredient.currentStock} ${requirement.unit}`);
                }
                catch (error) {
                    console.error(`❌ Error deducting stock for ${requirement.ingredientName}:`, error);
                    errors.push(`Failed to deduct stock for ${requirement.ingredientName}: ${error.message}`);
                }
            }
            return {
                success: errors.length === 0,
                deductedIngredients,
                errors,
            };
        });
    }
}
exports.StockDeductionService = StockDeductionService;
