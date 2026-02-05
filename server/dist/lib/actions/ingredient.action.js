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
exports.countAllIngredients = exports.deleteIngredient = exports.updateIngredient = exports.fetchIngredientById = exports.fetchIngredients = exports.createIngredient = void 0;
const mongoose_1 = require("../mongoose");
const ingredient_model_1 = __importDefault(require("../models/ingredient.model"));
const googleUtils_1 = require("../utils/googleUtils");
// Function to create an ingredient
const createIngredient = (ingredientData, base64Image, oAuth2Client) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    let imageUrl = "";
    // Upload image to Google Drive if provided
    if (base64Image && (0, googleUtils_1.isBase64Image)(base64Image)) {
        const imageId = yield (0, googleUtils_1.uploadToGoogleDrive)(base64Image, oAuth2Client, "ingredient");
        imageUrl = `https://drive.google.com/uc?export=view&id=${imageId}`;
    }
    const newIngredient = new ingredient_model_1.default(Object.assign(Object.assign({}, ingredientData), { imageUrl }));
    yield newIngredient.save();
    return newIngredient;
});
exports.createIngredient = createIngredient;
// Function to fetch all ingredients
const fetchIngredients = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        const ingredients = yield ingredient_model_1.default.find({}).sort({ name: 1 }); // Sort by name
        return ingredients;
    }
    catch (error) {
        console.error("Error fetching ingredients:", error);
        throw error;
    }
});
exports.fetchIngredients = fetchIngredients;
// Function to fetch an ingredient by ID
const fetchIngredientById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        const ingredient = yield ingredient_model_1.default.findById(id);
        if (!ingredient) {
            throw new Error("Ingredient not found");
        }
        return ingredient;
    }
    catch (error) {
        console.error("Error fetching ingredient by ID:", error);
        throw error;
    }
});
exports.fetchIngredientById = fetchIngredientById;
// Function to update an ingredient
const updateIngredient = (id, ingredientData, imageUrl, oAuth2Client) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        const existingIngredient = yield ingredient_model_1.default.findById(id);
        if (!existingIngredient) {
            throw new Error("Ingredient not found");
        }
        // Save the old imageUrl
        const oldImageUrl = existingIngredient.imageUrl || "";
        // Update ingredient fields
        existingIngredient.set(Object.assign({}, ingredientData));
        // Check if user uploaded new image
        const isUserUploadNewImage = (0, googleUtils_1.isBase64Image)(imageUrl);
        // Delete old image and upload new image only if user upload new image
        if (oldImageUrl && isUserUploadNewImage) {
            yield (0, googleUtils_1.deleteImageFromDrive)(oldImageUrl, oAuth2Client);
            // Upload the new image and update the imageUrl
            const imageId = yield (0, googleUtils_1.uploadToGoogleDrive)(imageUrl, oAuth2Client, "ingredient");
            existingIngredient.imageUrl = `https://drive.google.com/uc?export=view&id=${imageId}`;
        }
        else if (isUserUploadNewImage) {
            // New image upload (no old image)
            const imageId = yield (0, googleUtils_1.uploadToGoogleDrive)(imageUrl, oAuth2Client, "ingredient");
            existingIngredient.imageUrl = `https://drive.google.com/uc?export=view&id=${imageId}`;
        }
        yield existingIngredient.save();
        return existingIngredient;
    }
    catch (error) {
        console.error("Error updating ingredient:", error);
        throw error;
    }
});
exports.updateIngredient = updateIngredient;
// Function to delete an ingredient by ID
const deleteIngredient = (id, oAuth2Client) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        const existingIngredient = yield ingredient_model_1.default.findById(id);
        if (!existingIngredient) {
            throw new Error("Ingredient not found");
        }
        // Delete the image from Google Drive if exists
        if (existingIngredient.imageUrl) {
            yield (0, googleUtils_1.deleteImageFromDrive)(existingIngredient.imageUrl, oAuth2Client);
        }
        const result = yield ingredient_model_1.default.findByIdAndDelete(id);
        if (!result) {
            throw new Error("Ingredient not found");
        }
    }
    catch (error) {
        console.error("Error deleting ingredient:", error);
        throw error;
    }
});
exports.deleteIngredient = deleteIngredient;
// Function to count all ingredients
const countAllIngredients = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        const ingredientCount = yield ingredient_model_1.default.countDocuments({});
        return ingredientCount;
    }
    catch (error) {
        console.error("Error counting ingredients:", error);
        throw error;
    }
});
exports.countAllIngredients = countAllIngredients;
