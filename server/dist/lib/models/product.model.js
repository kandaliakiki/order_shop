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
// Custom function to generate sequential productId with 'P-' prefix
function generateProductId() {
    return __awaiter(this, void 0, void 0, function* () {
        const counter = yield counter_model_1.default.findByIdAndUpdate({ _id: "productId" }, { $inc: { seq: 1 } }, { new: true, upsert: true });
        const seq = counter.seq.toString().padStart(4, "0"); // Ensure 4 digits
        return `P-${seq}`; // Prefix with 'P-'
    });
}
const productSchema = new mongoose_1.default.Schema({
    productId: {
        type: String,
        unique: true,
    },
    name: { type: String, required: true, minlength: 3 },
    price: { type: Number, required: true, min: 0 },
    category: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    }, // Link to Category schema
    imageUrl: { type: String, default: "" },
    ingredients: [
        {
            ingredient: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "Ingredient",
                required: true,
            },
            quantity: { type: Number, required: true, min: 0 },
            unit: { type: String, required: true },
        },
    ],
});
// Middleware to generate productId before saving
productSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.productId) {
            this.productId = yield generateProductId();
        }
        next();
    });
});
const Product = mongoose_1.default.models.Product || mongoose_1.default.model("Product", productSchema);
exports.default = Product;
