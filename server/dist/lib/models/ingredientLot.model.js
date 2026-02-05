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
// Custom function to generate sequential lotId with 'LOT-' prefix
function generateLotId() {
    return __awaiter(this, void 0, void 0, function* () {
        const counter = yield counter_model_1.default.findByIdAndUpdate({ _id: "lotId" }, { $inc: { seq: 1 } }, { new: true, upsert: true });
        const seq = counter.seq.toString().padStart(4, "0"); // Ensure 4 digits
        return `LOT-${seq}`; // Prefix with 'LOT-'
    });
}
const ingredientLotSchema = new mongoose_1.default.Schema({
    lotId: {
        type: String,
        unique: true,
    },
    ingredient: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Ingredient",
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
    expiryDate: {
        type: Date,
        required: true,
    },
    purchaseDate: {
        type: Date,
    },
    supplier: {
        type: String,
    },
    cost: {
        type: Number,
        min: 0,
    },
    currentStock: {
        type: Number,
        required: true,
        min: 0,
    },
    expirySource: {
        type: String,
        enum: ["user", "database", "ai", "default"],
    },
}, {
    timestamps: true,
});
// Middleware to generate lotId before saving
ingredientLotSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.lotId) {
            this.lotId = yield generateLotId();
        }
        next();
    });
});
const IngredientLot = mongoose_1.default.models.IngredientLot ||
    mongoose_1.default.model("IngredientLot", ingredientLotSchema);
exports.default = IngredientLot;
