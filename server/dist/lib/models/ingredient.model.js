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
const counter_model_1 = __importDefault(require("./counter.model")); // Import the counter model
// Custom function to generate sequential ingredientId with 'I-' prefix
function generateIngredientId() {
    return __awaiter(this, void 0, void 0, function* () {
        const counter = yield counter_model_1.default.findByIdAndUpdate({ _id: "ingredientId" }, { $inc: { seq: 1 } }, { new: true, upsert: true });
        const seq = counter.seq.toString().padStart(4, "0"); // Ensure 4 digits
        return `I-${seq}`; // Prefix with 'I-'
    });
}
const ingredientSchema = new mongoose_1.default.Schema({
    ingredientId: {
        type: String,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 50,
    },
    unit: {
        type: String,
        required: true,
    },
    currentStock: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    minimumStock: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    reservedStock: {
        type: Number,
        default: 0,
        min: 0,
    },
    defaultExpiryDays: {
        type: Number,
        min: 1,
    },
    imageUrl: {
        type: String,
        default: "",
    },
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
});
// Middleware to generate ingredientId before saving
ingredientSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.ingredientId) {
            this.ingredientId = yield generateIngredientId();
        }
        next();
    });
});
const Ingredient = mongoose_1.default.models.Ingredient ||
    mongoose_1.default.model("Ingredient", ingredientSchema);
exports.default = Ingredient;
