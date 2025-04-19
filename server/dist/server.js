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
const express_1 = __importDefault(require("express")); // Ensure Response is imported
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = require("./lib/mongoose");
const product_action_1 = require("./lib/actions/product.action");
const googleUtils_1 = require("./lib/googleUtils");
const category_action_1 = require("./lib/actions/category.action"); // Import the new function
const order_action_1 = require("./lib/actions/order.action"); // Import the function
// Specify the path to your .env.local file
dotenv_1.default.config({ path: ".env.local" });
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
// Increase the limit for JSON body size
app.use(express_1.default.json({ limit: "10mb" }));
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)());
(0, mongoose_1.connectToDB)();
// Initialize Google Drive API client at server start
const oAuth2Client = (0, googleUtils_1.getOAuth2Client)(); // Use the new function
// Endpoint to add a new product
app.post("/api/createProduct", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, price, category, imageUrl } = req.body;
    if (!name || !price || !category || !imageUrl) {
        return res.status(400).json({ error: "All fields are required" });
    }
    try {
        const productData = { name, price, category };
        const newProduct = yield (0, product_action_1.createProduct)(productData, imageUrl, oAuth2Client); // Pass imageUrl instead of file
        res.status(201).json(newProduct);
    }
    catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: "Failed to create product" });
    }
}));
// Endpoint to fetch all products
app.get("/products", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield (0, product_action_1.fetchProducts)();
        res.status(200).json(products);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch products" });
    }
}));
// Endpoint to delete a product
app.delete("/api/deleteProduct/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: "Product ID is required" });
    }
    try {
        // Assuming you have a deleteProduct function in your actions
        yield (0, product_action_1.deleteProduct)(id, oAuth2Client); // Implement this function in your product actions
        res.status(204).send(); // No content to send back
    }
    catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Failed to delete product" });
    }
}));
// Endpoint to fetch a product by ID
app.get("/api/product/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: "Product ID is required" });
    }
    try {
        const product = yield (0, product_action_1.fetchProductById)(id); // Call the new function
        res.status(200).json(product);
    }
    catch (error) {
        console.error("Error fetching product by ID:", error);
        res.status(500).json({ error: "Failed to fetch product" });
    }
}));
// Endpoint to update a product
app.put("/api/updateProduct/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // Get the product ID from the URL
    const { name, price, category, imageUrl } = req.body; // Get product data from the request body
    if (!name || !price || !category || !imageUrl) {
        // Validate required fields including imageUrl
        return res
            .status(400)
            .json({ error: "Name, price, category, and imageUrl are required" });
    }
    try {
        const productData = { name, price, category };
        const updatedProduct = yield (0, product_action_1.updateProduct)(id, productData, imageUrl, oAuth2Client); // Call the update function
        res.status(200).json(updatedProduct);
    }
    catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Failed to update product" });
    }
}));
// Endpoint to create a new category
app.post("/api/createCategory", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, imageUrl } = req.body;
    if (!name || !imageUrl) {
        return res.status(400).json({ error: "All fields are required" });
    }
    try {
        const categoryData = { name };
        const newCategory = yield (0, category_action_1.createCategory)(categoryData, imageUrl, oAuth2Client); // Pass imageUrl instead of file
        res.status(201).json(newCategory);
    }
    catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: "Failed to create product" });
    }
}));
// Endpoint to fetch all categories
app.get("/api/categories", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield (0, category_action_1.fetchCategories)();
        res.status(200).json(categories);
    }
    catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
}));
// Endpoint to fetch products by category ID
app.get("/api/products/category/:categoryId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { categoryId } = req.params;
    if (!categoryId) {
        return res.status(400).json({ error: "Category ID is required" });
    }
    try {
        const products = yield (0, product_action_1.fetchProductsByCategoryId)(categoryId);
        res.status(200).json(products);
    }
    catch (error) {
        console.error("Error fetching products by category ID:", error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
}));
// Endpoint to count products by category ID
app.get("/api/products/count/:categoryId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { categoryId } = req.params;
    if (!categoryId) {
        return res.status(400).json({ error: "Category ID is required" });
    }
    try {
        const productCount = yield (0, product_action_1.countProductsByCategoryId)(categoryId);
        res.status(200).json({ count: productCount });
    }
    catch (error) {
        console.error("Error counting products by category ID:", error);
        res.status(500).json({ error: "Failed to count products" });
    }
}));
// Endpoint to count all products
app.get("/api/products/count", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productCount = yield (0, product_action_1.countAllProducts)();
        res.status(200).json({ count: productCount });
    }
    catch (error) {
        console.error("Error counting all products:", error);
        res.status(500).json({ error: "Failed to count products" });
    }
}));
// Endpoint to delete multiple products
app.delete("/api/deleteMultipleProducts", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ids } = req.body; // Expect an array of IDs in the request body
    if (!Array.isArray(ids) || ids.length === 0) {
        return res
            .status(400)
            .json({ error: "An array of product IDs is required" });
    }
    try {
        const result = yield (0, product_action_1.deleteMultipleProducts)(ids, oAuth2Client);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error deleting multiple products:", error);
        res.status(500).json({ error: "Failed to delete multiple products" });
    }
}));
// Endpoint to fetch a category by ID
app.get("/api/category/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: "Category ID is required" });
    }
    try {
        const category = yield (0, category_action_1.fetchCategoryById)(id);
        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }
        res.status(200).json(category);
    }
    catch (error) {
        console.error("Error fetching category by ID:", error);
        res.status(500).json({ error: "Failed to fetch category" });
    }
}));
// Endpoint to filter products by name or category name and optionally by category ID
app.get("/api/filterProducts", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { textToSearch, categoryId, maxPrice } = req.query;
    try {
        const products = yield (0, product_action_1.filterProductsByParams)(textToSearch, categoryId, maxPrice ? Number(maxPrice) : 0 // Convert maxPrice to number if provided
        );
        res.status(200).json(products);
    }
    catch (error) {
        console.error("Error filtering products:", error);
        res.status(500).json({ error: "Failed to filter products" });
    }
}));
// Endpoint to fetch all orders
app.get("/api/orders", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield (0, order_action_1.fetchOrders)();
        res.status(200).json(orders);
    }
    catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
}));
// Start server
app.listen(port, () => {
    const ip = require("ip").address(); // Import the 'ip' module to get the local IP address
    console.log(`Server is running on http://${ip}:${port}`); // Use the local IP address instead of localhost
});
