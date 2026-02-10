"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngredientStockCalculationService = void 0;
const product_action_1 = require("../actions/product.action");
class IngredientStockCalculationService {
    /**
     * Calculate ingredient requirements for an order
     */
    calculateOrderIngredientRequirements(order) {
        return __awaiter(this, void 0, void 0, function* () {
            const requirements = [];
            const warnings = [];
            const ingredientMap = new Map();
            // Get all products from database
            const allProducts = yield (0, product_action_1.fetchProducts)();
            // Process each order item
            for (const orderItem of order.items) {
                // Find product in database by name
                const product = allProducts.find((p) => p.name.toLowerCase().trim() === orderItem.name.toLowerCase().trim());
                if (!product) {
                    warnings.push(`Product "${orderItem.name}" not found in database`);
                    continue;
                }
                // Check if product has ingredients
                if (!product.ingredients || product.ingredients.length === 0) {
                    warnings.push(`Product "${orderItem.name}" has no ingredients configured`);
                    continue;
                }
                // Calculate ingredient requirements for this product
                for (const productIngredient of product.ingredients) {
                    const ingredient = productIngredient.ingredient;
                    const ingredientId = ingredient._id.toString();
                    // Calculate required quantity: order quantity × ingredient quantity per product
                    const requiredQuantity = orderItem.quantity * productIngredient.quantity;
                    // Check if we already have this ingredient in our map
                    if (ingredientMap.has(ingredientId)) {
                        // Add to existing requirement
                        const existing = ingredientMap.get(ingredientId);
                        existing.requiredQuantity += requiredQuantity;
                    }
                    else {
                        // Create new requirement entry
                        const requirement = {
                            ingredientId,
                            ingredientName: ingredient.name,
                            unit: productIngredient.unit, // Use unit from product ingredient config
                            requiredQuantity,
                            currentStock: ingredient.currentStock,
                            minimumStock: ingredient.minimumStock,
                            isSufficient: false, // Will calculate below (considering reservedStock)
                            shortage: 0, // Will calculate below
                        };
                        ingredientMap.set(ingredientId, requirement);
                    }
                }
            }
            // Calculate sufficiency and shortages (considering reservedStock)
            for (const requirement of ingredientMap.values()) {
                // Get fresh ingredient data to check reservedStock
                const freshIngredient = yield (yield Promise.resolve().then(() => __importStar(require("../models/ingredient.model")))).default.findById(requirement.ingredientId);
                const reservedStock = (freshIngredient === null || freshIngredient === void 0 ? void 0 : freshIngredient.reservedStock) || 0;
                const availableStock = requirement.currentStock - reservedStock;
                requirement.isSufficient = availableStock >= requirement.requiredQuantity;
                requirement.shortage = requirement.isSufficient
                    ? 0
                    : requirement.requiredQuantity - availableStock;
                requirements.push(requirement);
            }
            // Sort by shortage (most critical first)
            requirements.sort((a, b) => b.shortage - a.shortage);
            return {
                orderId: order.orderId || "",
                allIngredientsSufficient: requirements.every((r) => r.isSufficient),
                requirements,
                warnings,
            };
        });
    }
}
exports.IngredientStockCalculationService = IngredientStockCalculationService;
