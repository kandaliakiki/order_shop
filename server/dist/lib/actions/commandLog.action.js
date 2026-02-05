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
exports.fetchCommandLogsByCommand = exports.fetchCommandLogs = exports.createCommandLog = void 0;
const mongoose_1 = require("../mongoose");
const commandLog_model_1 = __importDefault(require("../models/commandLog.model"));
const createCommandLog = (logData) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        const log = new commandLog_model_1.default(Object.assign(Object.assign({}, logData), { executedAt: new Date() }));
        yield log.save();
        return log;
    }
    catch (error) {
        console.error("Error creating command log:", error);
        throw error;
    }
});
exports.createCommandLog = createCommandLog;
const fetchCommandLogs = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (limit = 0) {
    yield (0, mongoose_1.connectToDB)();
    try {
        const query = commandLog_model_1.default.find()
            .populate("messageId")
            .sort({ executedAt: -1 });
        if (limit > 0) {
            query.limit(limit);
        }
        return yield query;
    }
    catch (error) {
        console.error("Error fetching command logs:", error);
        throw error;
    }
});
exports.fetchCommandLogs = fetchCommandLogs;
const fetchCommandLogsByCommand = (command) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        return yield commandLog_model_1.default.find({ command })
            .populate("messageId")
            .sort({ executedAt: -1 });
    }
    catch (error) {
        console.error("Error fetching command logs by command:", error);
        throw error;
    }
});
exports.fetchCommandLogsByCommand = fetchCommandLogsByCommand;
