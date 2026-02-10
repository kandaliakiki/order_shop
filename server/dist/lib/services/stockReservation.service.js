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
exports.StockReservationService = void 0;
const mongoose_1 = require("../mongoose");
const ingredient_model_1 = __importDefault(require("../models/ingredient.model"));
class StockReservationService {
    /**
     * Reserve ingredient stock for an order (without deducting)
     * This reserves stock so it can't be used by other orders
     * Stock is only deducted when order status changes to "On Process"
     */
    reserveStockForOrder(requirements, pickupDate) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, mongoose_1.connectToDB)();
            const reservedIngredients = [];
            const errors = [];
            // Check if all ingredients are sufficient (considering reserved stock)
            for (const requirement of requirements) {
                const ingredient = yield ingredient_model_1.default.findById(requirement.ingredientId);
                if (!ingredient) {
                    errors.push(`Ingredient "${requirement.ingredientName}" not found`);
                    continue;
                }
                // Calculate available stock: currentStock - reservedStock
                const availableStock = ingredient.currentStock - (ingredient.reservedStock || 0);
                if (availableStock < requirement.requiredQuantity) {
                    errors.push(`Insufficient stock for ${requirement.ingredientName}. Required: ${requirement.requiredQuantity} ${requirement.unit}, Available: ${availableStock} ${requirement.unit}`);
                }
            }
            if (errors.length > 0) {
                return {
                    success: false,
                    reservedIngredients: [],
                    errors,
                };
            }
            // Reserve stock for each ingredient
            for (const requirement of requirements) {
                try {
                    const ingredient = yield ingredient_model_1.default.findById(requirement.ingredientId);
                    if (!ingredient) {
                        errors.push(`Ingredient "${requirement.ingredientName}" not found`);
                        continue;
                    }
                    // Add to reserved stock
                    const currentReserved = ingredient.reservedStock || 0;
                    ingredient.reservedStock = currentReserved + requirement.requiredQuantity;
                    yield ingredient.save();
                    const availableStock = ingredient.currentStock - ingredient.reservedStock;
                    reservedIngredients.push({
                        ingredientId: requirement.ingredientId,
                        ingredientName: requirement.ingredientName,
                        quantityReserved: requirement.requiredQuantity,
                        newReservedStock: ingredient.reservedStock,
                        availableStock: availableStock,
                    });
                    console.log(`✅ Reserved ${requirement.requiredQuantity} ${requirement.unit} of ${requirement.ingredientName}. Reserved: ${ingredient.reservedStock} ${requirement.unit}, Available: ${availableStock} ${requirement.unit}`);
                }
                catch (error) {
                    console.error(`❌ Error reserving stock for ${requirement.ingredientName}:`, error);
                    errors.push(`Failed to reserve stock for ${requirement.ingredientName}: ${error.message}`);
                }
            }
            return {
                success: errors.length === 0,
                reservedIngredients,
                errors,
            };
        });
    }
    /**
     * Release reserved stock (e.g., when order is cancelled)
     */
    releaseReservedStock(requirements) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, mongoose_1.connectToDB)();
            const errors = [];
            for (const requirement of requirements) {
                try {
                    const ingredient = yield ingredient_model_1.default.findById(requirement.ingredientId);
                    if (!ingredient) {
                        errors.push(`Ingredient "${requirement.ingredientName}" not found`);
                        continue;
                    }
                    // Release reserved stock
                    const currentReserved = ingredient.reservedStock || 0;
                    ingredient.reservedStock = Math.max(0, currentReserved - requirement.requiredQuantity);
                    yield ingredient.save();
                    console.log(`✅ Released ${requirement.requiredQuantity} ${requirement.unit} of ${requirement.ingredientName}. Reserved: ${ingredient.reservedStock} ${requirement.unit}`);
                }
                catch (error) {
                    console.error(`❌ Error releasing stock for ${requirement.ingredientName}:`, error);
                    errors.push(`Failed to release stock for ${requirement.ingredientName}: ${error.message}`);
                }
            }
            return {
                success: errors.length === 0,
                errors,
            };
        });
    }
}
exports.StockReservationService = StockReservationService;
