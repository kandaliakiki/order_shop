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
exports.filterProductsByParams = exports.deleteMultipleProducts = exports.countAllProducts = exports.countProductsByCategoryId = exports.fetchProductsByCategoryId = exports.updateProduct = exports.fetchProductById = exports.deleteProduct = exports.fetchProducts = exports.createProduct = void 0;
const mongoose_1 = require("../mongoose");
const product_model_1 = __importDefault(require("../models/product.model"));
const googleUtils_1 = require("../googleUtils");
const mongoose_2 = __importDefault(require("mongoose")); // Ensure mongoose is imported
// Function to create a product
const createProduct = (productData, base64Image, oAuth2Client // Specify the type here
) => __awaiter(void 0, void 0, void 0, function* () {
    // Upload image to Google Drive
    const imageId = yield (0, googleUtils_1.uploadToGoogleDrive)(base64Image, oAuth2Client, "product");
    // Construct the image URL
    const imageUrl = `https://drive.google.com/uc?export=view&id=${imageId}`;
    const newProduct = new product_model_1.default(Object.assign(Object.assign({}, productData), { imageUrl })); // Save the constructed URL
    yield newProduct.save();
    return newProduct;
});
exports.createProduct = createProduct;
// Function to fetch all products
const fetchProducts = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        const products = yield product_model_1.default.find({}).populate("category", "name"); // Populate category with name
        return products;
    }
    catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
});
exports.fetchProducts = fetchProducts;
// Function to delete a product by ID
const deleteProduct = (id, oAuth2Client // Specify the type here
) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        const existingProduct = yield product_model_1.default.findById(id);
        if (!existingProduct) {
            throw new Error("Product not found");
        }
        // Delete the image from Google Drive
        if (existingProduct.imageUrl) {
            yield (0, googleUtils_1.deleteImageFromDrive)(existingProduct.imageUrl, oAuth2Client); // Ensure oAuth2Client is available
        }
        const result = yield product_model_1.default.findByIdAndDelete(id);
        if (!result) {
            throw new Error("Product not found");
        }
    }
    catch (error) {
        console.error("Error deleting product:", error);
        throw error;
    }
});
exports.deleteProduct = deleteProduct;
// Function to fetch a product by ID
const fetchProductById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        const product = yield product_model_1.default.findById(id).populate("category", "name"); // Populate category with name
        if (!product) {
            throw new Error("Product not found");
        }
        return product;
    }
    catch (error) {
        console.error("Error fetching product by ID:", error);
        throw error;
    }
});
exports.fetchProductById = fetchProductById;
// Function to update a product
const updateProduct = (id, productData, imageUrl, oAuth2Client // Specify the type here
) => __awaiter(void 0, void 0, void 0, function* () {
    const existingProduct = yield product_model_1.default.findById(id);
    if (!existingProduct) {
        throw new Error("Product not found");
    }
    // Save the old imageUrl
    const oldImageUrl = existingProduct.imageUrl;
    // Update product fields
    existingProduct.set(Object.assign({}, productData));
    // is base 65 then user upload new image
    const isUserUploadNewImage = (0, googleUtils_1.isBase64Image)(imageUrl);
    // delete old image and upload new image only if user upload new image else do nothing with image
    if (oldImageUrl && isUserUploadNewImage) {
        yield (0, googleUtils_1.deleteImageFromDrive)(oldImageUrl, oAuth2Client); // Call the delete function
        // Upload the new image and update the imageUrl
        const imageId = yield (0, googleUtils_1.uploadToGoogleDrive)(imageUrl, oAuth2Client, "product");
        existingProduct.imageUrl = `https://drive.google.com/uc?export=view&id=${imageId}`;
    }
    yield existingProduct.save();
    return existingProduct;
});
exports.updateProduct = updateProduct;
// Function to fetch products by category ID
const fetchProductsByCategoryId = (categoryId) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        const products = yield product_model_1.default.find({ category: categoryId }).populate("category", "name"); // Populate category with name
        return products;
    }
    catch (error) {
        console.error("Error fetching products by category ID:", error);
        throw error;
    }
});
exports.fetchProductsByCategoryId = fetchProductsByCategoryId;
// Function to count products by category ID
const countProductsByCategoryId = (categoryId) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        if (!categoryId) {
            throw new Error("Category ID must not be empty");
        }
        const query = { category: categoryId };
        const productCount = yield product_model_1.default.countDocuments(query); // Count documents based on the query
        return productCount;
    }
    catch (error) {
        console.error("Error counting products by category ID:", error);
        throw error;
    }
});
exports.countProductsByCategoryId = countProductsByCategoryId;
// Function to count all products
const countAllProducts = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        const productCount = yield product_model_1.default.countDocuments({}); // Count all documents
        return productCount;
    }
    catch (error) {
        console.error("Error counting all products:", error);
        throw error;
    }
});
exports.countAllProducts = countAllProducts;
// Function to delete multiple products by IDs
const deleteMultipleProducts = (ids, oAuth2Client // Specify the type here
) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        const deletePromises = ids.map((id) => __awaiter(void 0, void 0, void 0, function* () {
            const existingProduct = yield product_model_1.default.findById(id);
            if (!existingProduct) {
                throw new Error(`Product with ID ${id} not found`);
            }
            // Delete the image from Google Drive
            if (existingProduct.imageUrl) {
                yield (0, googleUtils_1.deleteImageFromDrive)(existingProduct.imageUrl, oAuth2Client);
            }
            yield product_model_1.default.findByIdAndDelete(id);
        }));
        yield Promise.all(deletePromises);
        return { message: "Products deleted successfully" };
    }
    catch (error) {
        console.error("Error deleting multiple products:", error);
        throw error;
    }
});
exports.deleteMultipleProducts = deleteMultipleProducts;
const filterProductsByParams = (textToSearch, categoryId, maxPrice) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoose_1.connectToDB)();
    try {
        const regex = new RegExp(`.*${textToSearch}.*`, "i");
        const matchConditions = {};
        // Add text search condition
        if (textToSearch) {
            matchConditions.$or = [
                { name: { $regex: regex } },
                { "categoryDetails.name": { $regex: regex } },
            ];
        }
        // Add categoryId condition if provided
        if (categoryId) {
            matchConditions["categoryDetails._id"] = new mongoose_2.default.Types.ObjectId(categoryId);
        }
        // Add maxPrice condition if provided and greater than 0
        if (maxPrice && maxPrice > 0) {
            matchConditions.price = { $lte: maxPrice };
        }
        const products = yield product_model_1.default.aggregate([
            {
                $lookup: {
                    from: "categories", // The name of the category collection
                    localField: "category",
                    foreignField: "_id",
                    as: "categoryDetails",
                },
            },
            {
                $unwind: "$categoryDetails",
            },
            {
                $match: matchConditions,
            },
            {
                $addFields: {
                    category: "$categoryDetails",
                },
            },
            {
                $project: {
                    _id: 1,
                    productId: 1,
                    name: 1,
                    price: 1,
                    imageUrl: 1,
                    category: 1,
                },
            },
        ]);
        return products;
    }
    catch (error) {
        console.error("Error filtering products:", error);
        throw error;
    }
});
exports.filterProductsByParams = filterProductsByParams;
