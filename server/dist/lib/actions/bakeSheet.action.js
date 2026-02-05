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
exports.generateBakeSheetFromOrders = exports.updateBakeSheetStatus = exports.createBakeSheet = exports.fetchBakeSheetById = exports.fetchBakeSheets = void 0;
const mongoose_1 = require("../mongoose");
const bakeSheet_model_1 = __importDefault(require("../models/bakeSheet.model"));
const order_model_1 = __importDefault(require("../models/order.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const ingredient_model_1 = __importDefault(require("../models/ingredient.model"));
const lotDeduction_service_1 = require("../services/lotDeduction.service");
const date_fns_1 = require("date-fns");
const fetchBakeSheets = (date) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        const query = {};
        if (date) {
            // Support both single date and date range format
            query.$or = [
                { date: date },
                { "dateRange.start": date },
                { "dateRange.end": date },
            ];
        }
        return yield bakeSheet_model_1.default.find(query)
            .populate("items.productId", "name price")
            .sort({ createdAt: -1 });
    }
    catch (error) {
        console.error("Error fetching bake sheets:", error);
        throw error;
    }
});
exports.fetchBakeSheets = fetchBakeSheets;
const fetchBakeSheetById = (sheetId) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        return yield bakeSheet_model_1.default.findOne({ sheetId })
            .populate("items.productId", "name price");
    }
    catch (error) {
        console.error("Error fetching bake sheet by ID:", error);
        throw error;
    }
});
exports.fetchBakeSheetById = fetchBakeSheetById;
const createBakeSheet = (bakeSheetData) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        const bakeSheet = new bakeSheet_model_1.default(bakeSheetData);
        yield bakeSheet.save();
        return bakeSheet;
    }
    catch (error) {
        console.error("Error creating bake sheet:", error);
        throw error;
    }
});
exports.createBakeSheet = createBakeSheet;
const updateBakeSheetStatus = (sheetId, status) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        return yield bakeSheet_model_1.default.findOneAndUpdate({ sheetId }, { status }, { new: true });
    }
    catch (error) {
        console.error("Error updating bake sheet status:", error);
        throw error;
    }
});
exports.updateBakeSheetStatus = updateBakeSheetStatus;
/**
 * Generate bake sheet from orders (simple fetch, no document storage)
 * Queries orders by pickupDate and calculates ingredients needed
 */
const generateBakeSheetFromOrders = (startDate, // YYYY-MM-DD format, defaults to today
endDate // YYYY-MM-DD format, defaults to startDate
) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    // 1. Parse date range (default to today)
    const startDateStr = startDate || (0, date_fns_1.format)(new Date(), "yyyy-MM-dd");
    const endDateStr = endDate || startDateStr;
    const startDateObj = new Date(startDateStr);
    startDateObj.setHours(0, 0, 0, 0);
    const endDateObj = new Date(endDateStr);
    endDateObj.setHours(23, 59, 59, 999);
    // 2. Query orders by PICKUP DATE (not createdAt)
    // Exclude Cancelled and Completed orders (Option B)
    // For orders without pickupDate, fallback to createdAt
    const orders = yield order_model_1.default.find({
        $and: [
            {
                $or: [
                    { pickupDate: { $gte: startDateObj, $lte: endDateObj } },
                    // Fallback: if pickupDate not set, use createdAt (for existing orders)
                    {
                        $or: [
                            { pickupDate: { $exists: false } },
                            { pickupDate: null }
                        ],
                        createdAt: { $gte: startDateObj, $lte: endDateObj }
                    },
                ],
            },
            { status: { $nin: ["Cancelled", "Completed"] } }, // Exclude cancelled and completed
        ],
    }).sort({ pickupDate: 1, createdAt: 1 });
    // 3. Aggregate products (overall + per day)
    const productAggregation = {};
    const dailyProductAggregation = {};
    const ordersByDate = {};
    // Group orders by date
    orders.forEach((order) => {
        // Use pickupDate if available, otherwise use createdAt
        const orderDate = order.pickupDate
            ? (0, date_fns_1.format)(new Date(order.pickupDate), "yyyy-MM-dd")
            : (0, date_fns_1.format)(new Date(order.createdAt), "yyyy-MM-dd");
        if (!ordersByDate[orderDate]) {
            ordersByDate[orderDate] = [];
        }
        ordersByDate[orderDate].push(order);
    });
    // Aggregate products per day and overall
    Object.entries(ordersByDate).forEach(([date, dateOrders]) => {
        dailyProductAggregation[date] = {};
        dateOrders.forEach((order) => {
            order.items.forEach((item) => {
                // Overall aggregation
                if (productAggregation[item.name]) {
                    productAggregation[item.name] += item.quantity;
                }
                else {
                    productAggregation[item.name] = item.quantity;
                }
                // Daily aggregation
                if (dailyProductAggregation[date][item.name]) {
                    dailyProductAggregation[date][item.name] += item.quantity;
                }
                else {
                    dailyProductAggregation[date][item.name] = item.quantity;
                }
            });
        });
    });
    // 4. Calculate ingredient requirements
    const products = yield product_model_1.default.find({}).populate("ingredients.ingredient", "name unit currentStock");
    const ingredientRequirements = {};
    for (const [productName, totalQuantity] of Object.entries(productAggregation)) {
        const product = products.find((p) => p.name.toLowerCase() === productName.toLowerCase());
        if (product && product.ingredients) {
            product.ingredients.forEach((ing) => {
                const ingredient = ing.ingredient;
                if (ingredient) {
                    const totalNeeded = ing.quantity * totalQuantity;
                    const key = `${ingredient._id}_${ing.unit}`;
                    if (ingredientRequirements[key]) {
                        ingredientRequirements[key].quantity += totalNeeded;
                    }
                    else {
                        ingredientRequirements[key] = {
                            quantity: totalNeeded,
                            unit: ing.unit,
                        };
                    }
                }
            });
        }
    }
    // 5. Check stock and get recommended lots (FEFO)
    const lotDeductionService = new lotDeduction_service_1.LotDeductionService();
    const stockChecks = [];
    for (const [key, req] of Object.entries(ingredientRequirements)) {
        const [ingredientId, unit] = key.split("_");
        const ingredient = yield ingredient_model_1.default.findById(ingredientId);
        if (ingredient) {
            const lotRecommendations = yield lotDeductionService.getRecommendedLots(ingredientId, req.quantity);
            stockChecks.push({
                name: ingredient.name,
                needed: req.quantity,
                available: ingredient.currentStock,
                unit: req.unit,
                sufficient: ingredient.currentStock >= req.quantity,
                recommendedLots: lotRecommendations.lots,
                totalAvailable: lotRecommendations.totalAvailable,
            });
        }
    }
    // 6. Format items
    const items = Object.entries(productAggregation).map(([name, qty]) => {
        var _a;
        const product = products.find((p) => p.name.toLowerCase() === name.toLowerCase());
        return {
            productId: ((_a = product === null || product === void 0 ? void 0 : product._id) === null || _a === void 0 ? void 0 : _a.toString()) || "",
            productName: name,
            quantity: qty,
        };
    });
    // 7. Calculate daily ingredient requirements
    const dailyIngredientRequirements = {};
    // Calculate ingredients needed per day
    Object.entries(dailyProductAggregation).forEach(([date, dateProducts]) => {
        dailyIngredientRequirements[date] = {};
        Object.entries(dateProducts).forEach(([productName, quantity]) => {
            const product = products.find((p) => p.name.toLowerCase() === productName.toLowerCase());
            if (product && product.ingredients) {
                product.ingredients.forEach((ing) => {
                    const ingredient = ing.ingredient;
                    if (ingredient) {
                        const needed = ing.quantity * quantity;
                        const key = `${ingredient._id}_${ing.unit}`;
                        if (dailyIngredientRequirements[date][key]) {
                            dailyIngredientRequirements[date][key].quantity += needed;
                        }
                        else {
                            dailyIngredientRequirements[date][key] = {
                                quantity: needed,
                                unit: ing.unit,
                            };
                        }
                    }
                });
            }
        });
    });
    // 8. Format daily breakdown
    const dailyBreakdown = yield Promise.all(Object.entries(dailyProductAggregation)
        .sort() // Sort by date
        .map((_a) => __awaiter(void 0, [_a], void 0, function* ([date, dateProducts]) {
        const dateOrders = ordersByDate[date] || [];
        const dateIngredientReqs = dailyIngredientRequirements[date] || {};
        // Get ingredient names for the daily breakdown
        const ingredientReqs = yield Promise.all(Object.entries(dateIngredientReqs).map((_b) => __awaiter(void 0, [_b], void 0, function* ([key, req]) {
            const [ingredientId, unit] = key.split("_");
            const ingredient = yield ingredient_model_1.default.findById(ingredientId);
            return {
                ingredientId,
                ingredientName: (ingredient === null || ingredient === void 0 ? void 0 : ingredient.name) || "Unknown",
                quantity: req.quantity,
                unit: req.unit,
            };
        })));
        return {
            date,
            orders: dateOrders.length,
            items: Object.entries(dateProducts).map(([name, qty]) => {
                var _a;
                const product = products.find((p) => p.name.toLowerCase() === name.toLowerCase());
                return {
                    productId: ((_a = product === null || product === void 0 ? void 0 : product._id) === null || _a === void 0 ? void 0 : _a.toString()) || "",
                    productName: name,
                    quantity: qty,
                };
            }),
            ingredientRequirements: ingredientReqs,
        };
    })));
    return {
        date: startDateStr === endDateStr ? startDateStr : `${startDateStr}_to_${endDateStr}`,
        dateRange: {
            start: startDateStr,
            end: endDateStr,
        },
        items,
        ingredientRequirements: Object.entries(ingredientRequirements).map(([key, req]) => {
            const [ingredientId, unit] = key.split("_");
            return Object.assign({ ingredientId }, req);
        }),
        stockChecks,
        totalOrders: orders.length,
        // Return dailyBreakdown if date range is selected (not single day) and there are orders
        dailyBreakdown: startDateStr !== endDateStr && dailyBreakdown.length > 0 ? dailyBreakdown : undefined,
    };
});
exports.generateBakeSheetFromOrders = generateBakeSheetFromOrders;
