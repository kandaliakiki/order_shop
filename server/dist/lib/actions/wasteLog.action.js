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
exports.createWasteLog = exports.fetchWasteLogsByDateRange = exports.fetchWasteLogs = void 0;
const mongoose_1 = require("../mongoose");
const wasteLog_model_1 = __importDefault(require("../models/wasteLog.model"));
const fetchWasteLogs = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (limit = 0) {
    yield (0, mongoose_1.connectToDB)();
    try {
        const query = wasteLog_model_1.default.find().sort({ loggedAt: -1 });
        if (limit > 0) {
            query.limit(limit);
        }
        return yield query;
    }
    catch (error) {
        console.error("Error fetching waste logs:", error);
        throw error;
    }
});
exports.fetchWasteLogs = fetchWasteLogs;
const fetchWasteLogsByDateRange = (from, to) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        return yield wasteLog_model_1.default.find({
            loggedAt: {
                $gte: from,
                $lte: to,
            },
        }).sort({ loggedAt: -1 });
    }
    catch (error) {
        console.error("Error fetching waste logs by date range:", error);
        throw error;
    }
});
exports.fetchWasteLogsByDateRange = fetchWasteLogsByDateRange;
const createWasteLog = (wasteLogData) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        const wasteLog = new wasteLog_model_1.default(Object.assign(Object.assign({}, wasteLogData), { loggedAt: new Date() }));
        yield wasteLog.save();
        return wasteLog;
    }
    catch (error) {
        console.error("Error creating waste log:", error);
        throw error;
    }
});
exports.createWasteLog = createWasteLog;
