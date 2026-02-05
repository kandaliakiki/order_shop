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
exports.LotDeductionService = void 0;
const mongoose_1 = require("../mongoose");
const ingredientLot_model_1 = __importDefault(require("../models/ingredientLot.model"));
const ingredient_model_1 = __importDefault(require("../models/ingredient.model"));
class LotDeductionService {
    /**
     * Find lots to use for an ingredient using FEFO (First Expired First Out)
     * If expiry dates are the same, use FIFO (First In First Out) based on purchase date
     */
    findLotsToUse(ingredientId, requiredQuantity) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, mongoose_1.connectToDB)();
            // Find all active lots for this ingredient (currentStock > 0, not expired)
            const now = new Date();
            const activeLots = yield ingredientLot_model_1.default.find({
                ingredient: ingredientId,
                currentStock: { $gt: 0 },
                expiryDate: { $gt: now }, // Not expired
            })
                .populate("ingredient", "name unit")
                .sort({ expiryDate: 1, purchaseDate: 1 }); // FEFO: Sort by expiry (ascending), then purchase date (ascending)
            const totalAvailable = activeLots.reduce((sum, lot) => sum + lot.currentStock, 0);
            return {
                lots: activeLots,
                totalAvailable,
            };
        });
    }
    /**
     * Deduct stock from lots using FEFO logic
     * Returns information about which lots were used
     */
    deductFromLots(requirements) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, mongoose_1.connectToDB)();
            const lotsUsed = [];
            const errors = [];
            // Check if all ingredients are sufficient first
            const allSufficient = requirements.every((r) => r.isSufficient);
            if (!allSufficient) {
                return {
                    success: false,
                    lotsUsed: [],
                    errors: ["Cannot deduct stock: insufficient ingredients"],
                };
            }
            // Process each ingredient requirement
            for (const requirement of requirements) {
                try {
                    const ingredient = yield ingredient_model_1.default.findById(requirement.ingredientId);
                    if (!ingredient) {
                        errors.push(`Ingredient "${requirement.ingredientName}" not found`);
                        continue;
                    }
                    // Find lots to use (FEFO)
                    const { lots: availableLots, totalAvailable } = yield this.findLotsToUse(requirement.ingredientId, requirement.requiredQuantity);
                    if (totalAvailable < requirement.requiredQuantity) {
                        errors.push(`Insufficient stock for ${requirement.ingredientName}. Required: ${requirement.requiredQuantity} ${requirement.unit}, Available: ${totalAvailable} ${requirement.unit}`);
                        continue;
                    }
                    // Deduct from lots (FEFO order)
                    let remainingToDeduct = requirement.requiredQuantity;
                    const deductedAt = new Date();
                    for (const lot of availableLots) {
                        if (remainingToDeduct <= 0)
                            break;
                        const quantityToDeduct = Math.min(remainingToDeduct, lot.currentStock);
                        const wasFullyUsed = lot.currentStock === quantityToDeduct;
                        // Update lot stock
                        lot.currentStock -= quantityToDeduct;
                        yield lot.save();
                        // Track lot usage
                        lotsUsed.push({
                            lotId: lot._id.toString(),
                            lotNumber: lot.lotId,
                            ingredientId: requirement.ingredientId,
                            ingredientName: requirement.ingredientName,
                            quantityUsed: quantityToDeduct,
                            unit: requirement.unit,
                            expiryDate: lot.expiryDate,
                            deductedAt,
                            status: wasFullyUsed ? "fully_used" : "partially_used",
                        });
                        remainingToDeduct -= quantityToDeduct;
                        console.log(`✅ Deducted ${quantityToDeduct} ${requirement.unit} from ${lot.lotId} (${requirement.ingredientName}). Remaining in lot: ${lot.currentStock} ${requirement.unit}`);
                    }
                    // Sync ingredient aggregate stock
                    yield this.syncIngredientStock(requirement.ingredientId);
                }
                catch (error) {
                    console.error(`❌ Error deducting lots for ${requirement.ingredientName}:`, error);
                    errors.push(`Failed to deduct lots for ${requirement.ingredientName}: ${error.message}`);
                }
            }
            return {
                success: errors.length === 0,
                lotsUsed,
                errors,
            };
        });
    }
    /**
     * Sync ingredient aggregate stock with sum of all lot stocks
     */
    syncIngredientStock(ingredientId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, mongoose_1.connectToDB)();
            const lots = yield ingredientLot_model_1.default.find({ ingredient: ingredientId });
            const totalStock = lots.reduce((sum, lot) => sum + lot.currentStock, 0);
            yield ingredient_model_1.default.findByIdAndUpdate(ingredientId, {
                currentStock: totalStock,
            });
            console.log(`✅ Synced ingredient stock: ${ingredientId} = ${totalStock} (sum of ${lots.length} lots)`);
        });
    }
    /**
     * Get recommended lots for an ingredient (for bake sheet)
     * Returns lots sorted by expiry (FEFO) with availability info
     */
    getRecommendedLots(ingredientId, requiredQuantity) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, mongoose_1.connectToDB)();
            const now = new Date();
            const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            const lots = yield ingredientLot_model_1.default.find({
                ingredient: ingredientId,
                currentStock: { $gt: 0 },
            })
                .sort({ expiryDate: 1, purchaseDate: 1 }) // FEFO
                .lean();
            const totalAvailable = lots.reduce((sum, lot) => sum + lot.currentStock, 0);
            const recommendedLots = lots.map((lot) => ({
                lotId: lot._id.toString(),
                lotNumber: lot.lotId,
                currentStock: lot.currentStock,
                expiryDate: lot.expiryDate,
                purchaseDate: lot.purchaseDate,
                isExpiringSoon: lot.expiryDate <= sevenDaysFromNow && lot.expiryDate > now,
                isExpired: lot.expiryDate <= now,
            }));
            return {
                lots: recommendedLots,
                totalAvailable,
                isSufficient: totalAvailable >= requiredQuantity,
            };
        });
    }
}
exports.LotDeductionService = LotDeductionService;
