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
exports.BakeSheetService = void 0;
const mongoose_1 = require("../mongoose");
const bakeSheet_action_1 = require("../actions/bakeSheet.action");
const date_fns_1 = require("date-fns");
const ai_service_1 = require("./ai.service");
class BakeSheetService {
    constructor() {
        this.aiService = new ai_service_1.AIService();
    }
    processBakeSheetCommand(dateInput, whatsappNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, mongoose_1.connectToDB)();
                // 1. Parse date input using AI for complex date ranges
                let startDate;
                let endDate;
                if (dateInput && dateInput.trim()) {
                    try {
                        // Use AI to parse natural language date ranges
                        const parsed = yield this.aiService.parseDateRange(dateInput.trim());
                        startDate = parsed.dateRange.start;
                        endDate = parsed.dateRange.end;
                    }
                    catch (error) {
                        console.error("AI date parsing failed, trying simple parsing:", error);
                        // Fallback to simple parsing
                        const lower = dateInput.toLowerCase().trim();
                        if (lower === "today") {
                            startDate = (0, date_fns_1.format)(new Date(), "yyyy-MM-dd");
                            endDate = startDate;
                        }
                        else if (lower === "tomorrow") {
                            startDate = (0, date_fns_1.format)(new Date(Date.now() + 24 * 60 * 60 * 1000), "yyyy-MM-dd");
                            endDate = startDate;
                        }
                        else {
                            // Try to use as-is (might be YYYY-MM-DD format)
                            startDate = dateInput;
                            endDate = dateInput;
                        }
                    }
                }
                else {
                    // Default to today
                    startDate = (0, date_fns_1.format)(new Date(), "yyyy-MM-dd");
                    endDate = startDate;
                }
                // 2. Generate bake sheet (real-time, no storage)
                const bakeSheet = yield (0, bakeSheet_action_1.generateBakeSheetFromOrders)(startDate, endDate);
                // 3. Format as WhatsApp message with detailed breakdown
                const dateDisplay = bakeSheet.dateRange.start === bakeSheet.dateRange.end
                    ? bakeSheet.dateRange.start
                    : `${bakeSheet.dateRange.start} to ${bakeSheet.dateRange.end}`;
                let message = `📋 *Daily Bake Sheet - ${dateDisplay}*\n\n`;
                message += `*Total Orders:* ${bakeSheet.totalOrders}\n\n`;
                // If there's a daily breakdown (date range), show it
                if (bakeSheet.dailyBreakdown && bakeSheet.dailyBreakdown.length > 0) {
                    message += `*Daily Breakdown:*\n\n`;
                    bakeSheet.dailyBreakdown.forEach((day) => {
                        message += `📅 *${day.date}* (${day.orders} order${day.orders !== 1 ? 's' : ''})\n`;
                        // Products for this day
                        if (day.items && day.items.length > 0) {
                            message += `  *Products:*\n`;
                            day.items.forEach((item) => {
                                message += `  • ${item.productName}: ${item.quantity}\n`;
                            });
                        }
                        // Ingredients for this day
                        if (day.ingredientRequirements && day.ingredientRequirements.length > 0) {
                            message += `  *Ingredients Needed:*\n`;
                            day.ingredientRequirements.forEach((ing) => {
                                message += `  • ${ing.ingredientName}: ${ing.quantity} ${ing.unit}\n`;
                            });
                        }
                        message += `\n`;
                    });
                }
                else {
                    // Single date or no daily breakdown - show overall summary
                    // Products needed
                    if (bakeSheet.items.length > 0) {
                        message += `*Products Needed:*\n`;
                        bakeSheet.items.forEach((item) => {
                            message += `• ${item.productName}: ${item.quantity}\n`;
                        });
                        message += `\n`;
                    }
                    else {
                        message += `No orders for this date.\n\n`;
                    }
                    // Ingredient requirements - need to fetch ingredient names
                    if (bakeSheet.ingredientRequirements && bakeSheet.ingredientRequirements.length > 0) {
                        const Ingredient = (yield Promise.resolve().then(() => __importStar(require("../models/ingredient.model")))).default;
                        message += `*Ingredients Needed:*\n`;
                        for (const ing of bakeSheet.ingredientRequirements) {
                            const ingredient = yield Ingredient.findById(ing.ingredientId).lean();
                            const ingredientName = (ingredient === null || ingredient === void 0 ? void 0 : ingredient.name) || 'Unknown';
                            message += `• ${ingredientName}: ${ing.quantity} ${ing.unit}\n`;
                        }
                        message += `\n`;
                    }
                }
                // Stock status
                const insufficient = bakeSheet.stockChecks.filter((s) => !s.sufficient);
                if (insufficient.length === 0) {
                    message += `*Stock Status:* ✅ All ingredients sufficient\n`;
                }
                else {
                    message += `*Stock Status:* ⚠️ Insufficient:\n`;
                    insufficient.forEach((i) => {
                        message += `• ${i.name}: Need ${i.needed} ${i.unit}, Have ${i.available} ${i.unit}\n`;
                    });
                }
                return {
                    success: true,
                    message,
                };
            }
            catch (error) {
                console.error("Error processing bake sheet command:", error);
                return {
                    success: false,
                    message: `❌ Error: ${error.message}`,
                };
            }
        });
    }
}
exports.BakeSheetService = BakeSheetService;
