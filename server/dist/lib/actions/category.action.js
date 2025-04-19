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
exports.fetchCategoryById = exports.fetchCategories = exports.createCategory = void 0;
const googleUtils_1 = require("../googleUtils");
const category_model_1 = __importDefault(require("../models/category.model")); // Import your Category model
// Function to create a new category
const createCategory = (categoryData, base64Image, oAuth2Client) => __awaiter(void 0, void 0, void 0, function* () {
    // Upload image to Google Drive
    const imageId = yield (0, googleUtils_1.uploadToGoogleDrive)(base64Image, oAuth2Client, "category");
    // Construct the image URL
    const imageUrl = `https://drive.google.com/uc?export=view&id=${imageId}`;
    const newCategory = new category_model_1.default(Object.assign(Object.assign({}, categoryData), { imageUrl })); // Save the constructed URL
    yield newCategory.save();
    return newCategory;
});
exports.createCategory = createCategory;
// Function to fetch all categories
const fetchCategories = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield category_model_1.default.find(); // Return the list of categories
});
exports.fetchCategories = fetchCategories;
// Function to fetch a category by ID
const fetchCategoryById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield category_model_1.default.findById(id); // Return the category with the given ID
});
exports.fetchCategoryById = fetchCategoryById;
