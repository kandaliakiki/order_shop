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
// Custom function to generate sequential wasteId with 'WASTE-' prefix
function generateWasteId() {
    return __awaiter(this, void 0, void 0, function* () {
        const counter = yield counter_model_1.default.findByIdAndUpdate({ _id: "wasteId" }, { $inc: { seq: 1 } }, { new: true, upsert: true });
        const seq = counter.seq.toString().padStart(4, "0"); // Ensure 4 digits
        return `WASTE-${seq}`; // Prefix with 'WASTE-'
    });
}
const wasteLogSchema = new mongoose_1.default.Schema({
    wasteId: {
        type: String,
        unique: true,
    },
    itemName: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
    },
    unit: {
        type: String,
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    loggedBy: {
        type: String,
        required: true,
    },
    loggedAt: {
        type: Date,
        default: Date.now,
    },
    cost: {
        type: Number,
        min: 0,
    },
}, {
    timestamps: true,
});
// Middleware to generate wasteId before saving
wasteLogSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.wasteId) {
            this.wasteId = yield generateWasteId();
        }
        next();
    });
});
const WasteLog = mongoose_1.default.models.WasteLog ||
    mongoose_1.default.model("WasteLog", wasteLogSchema);
exports.default = WasteLog;
