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
const bakeSheetSchema = new mongoose_1.default.Schema({
    sheetId: {
        type: String,
        unique: true,
    },
    date: {
        type: String,
        required: true,
    },
    dateRange: {
        start: String,
        end: String,
    },
    items: [
        {
            productId: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            productName: {
                type: String,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 0,
            },
        },
    ],
    ingredientRequirements: [
        {
            ingredientId: String,
            quantity: Number,
            unit: String,
        },
    ],
    stockChecks: [
        {
            name: String,
            needed: Number,
            available: Number,
            unit: String,
            sufficient: Boolean,
        },
    ],
    source: {
        type: String,
        enum: ['whatsapp', 'manual'],
        default: 'whatsapp',
    },
    whatsappNumber: {
        type: String,
    },
    status: {
        type: String,
        enum: ['draft', 'confirmed', 'completed'],
        default: 'draft',
    },
}, {
    timestamps: true,
});
// Generate sheetId before saving
bakeSheetSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.sheetId) {
            this.sheetId = `BAKE-${this.date}`;
        }
        next();
    });
});
const BakeSheet = mongoose_1.default.models.BakeSheet ||
    mongoose_1.default.model("BakeSheet", bakeSheetSchema);
exports.default = BakeSheet;
