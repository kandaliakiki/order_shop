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
const mongoose_1 = __importDefault(require("mongoose"));
const counter_model_1 = __importDefault(require("./counter.model"));
// Custom function to generate sequential logId with 'LOG-' prefix
function generateLogId() {
    return __awaiter(this, void 0, void 0, function* () {
        const counter = yield counter_model_1.default.findByIdAndUpdate({ _id: "logId" }, { $inc: { seq: 1 } }, { new: true, upsert: true });
        const seq = counter.seq.toString().padStart(4, "0"); // Ensure 4 digits
        return `LOG-${seq}`; // Prefix with 'LOG-'
    });
}
const commandLogSchema = new mongoose_1.default.Schema({
    logId: {
        type: String,
        unique: true,
    },
    messageId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "WhatsAppMessage",
        required: true,
    },
    command: {
        type: String,
        required: true,
    },
    input: {
        type: String,
        required: true,
    },
    output: {
        type: String,
        required: true,
    },
    whatsappNumber: {
        type: String,
        required: true,
    },
    executedAt: {
        type: Date,
        default: Date.now,
    },
    aiUsed: {
        type: Boolean,
        default: false,
    },
    tokensUsed: {
        type: Number,
        min: 0,
    },
}, {
    timestamps: true,
});
// Middleware to generate logId before saving
commandLogSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.logId) {
            this.logId = yield generateLogId();
        }
        next();
    });
});
const CommandLog = mongoose_1.default.models.CommandLog ||
    mongoose_1.default.model("CommandLog", commandLogSchema);
exports.default = CommandLog;
