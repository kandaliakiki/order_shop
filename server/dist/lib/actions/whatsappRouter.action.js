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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCommand = void 0;
const bakeSheet_service_1 = require("../services/bakeSheet.service");
const wasteLogging_service_1 = require("../services/wasteLogging.service");
const expiryCheck_service_1 = require("../services/expiryCheck.service");
const stockAddition_service_1 = require("../services/stockAddition.service");
function handleCommand(command, args, whatsappNumber, messageId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            switch (command) {
                case "bakesheet":
                    const bakeSheetService = new bakeSheet_service_1.BakeSheetService();
                    const bakeSheetResult = yield bakeSheetService.processBakeSheetCommand(args, whatsappNumber);
                    return bakeSheetResult.message;
                case "waste":
                    const wasteService = new wasteLogging_service_1.WasteLoggingService();
                    const wasteResult = yield wasteService.processWasteCommand(args, whatsappNumber);
                    return wasteResult.message;
                case "expiry":
                    const expiryService = new expiryCheck_service_1.ExpiryCheckService();
                    const expiryResult = yield expiryService.processExpiryCommand(args.trim() || undefined);
                    return expiryResult.message;
                case "stock":
                    const stockService = new stockAddition_service_1.StockAdditionService();
                    const stockResult = yield stockService.processStockAddition(args, whatsappNumber);
                    return stockResult.message;
                default:
                    return '❌ Unknown command. Type "menu" to see options.';
            }
        }
        catch (error) {
            console.error(`Error handling /${command} command:`, error);
            return `❌ Error processing /${command} command: ${error.message}`;
        }
    });
}
exports.handleCommand = handleCommand;
