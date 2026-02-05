"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const googleUtils_1 = require("./lib/utils/googleUtils");
const category_action_1 = require("./lib/actions/category.action"); // Import the new function
const order_action_1 = require("./lib/actions/order.action"); // Import the function
const ingredient_action_1 = require("./lib/actions/ingredient.action");
const whatsappMessage_action_1 = require("./lib/actions/whatsappMessage.action");
const twilioWebhookValidator_1 = require("./lib/utils/twilioWebhookValidator");
const twilio_service_1 = require("./lib/services/twilio.service");
const orderStockCalculation_action_1 = require("./lib/actions/orderStockCalculation.action");
const orderStockNotification_action_1 = require("./lib/actions/orderStockNotification.action");
const whatsappWebhook_action_1 = require("./lib/actions/whatsappWebhook.action");
// Specify the path to your .env.local file
dotenv_1.default.config({ path: ".env.local" });
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
// Increase the limit for JSON body size
app.use(express_1.default.json({ limit: "10mb" }));
// Middleware
app.use((0, cors_1.default)());
// Twilio webhook needs urlencoded body for signature validation
// Apply urlencoded middleware for Twilio webhook route specifically
app.use("/api/twilio/webhook", express_1.default.urlencoded({ extended: true, limit: "10mb" }));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ limit: "10mb", extended: true }));
(0, mongoose_1.connectToDB)();
// UNCOMMENT FOR SEEDING DATA
// connectToDB().then(() => {
//   seedOrders().catch((error) => {
//     console.error("Error seeding database:", error);
//   });
// });
// Initialize Google Drive API client at server start
const oAuth2Client = (0, googleUtils_1.getOAuth2Client)(); // Use the new function
// Endpoint to add a new product
app.post("/api/createProduct", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, price, category, imageUrl, ingredients } = req.body;
    if (!name || !price || !category || !imageUrl) {
        return res.status(400).json({ error: "All fields are required" });
    }
    try {
        const productData = { name, price, category, ingredients };
        const newProduct = yield (0, product_action_1.createProduct)(productData, imageUrl, oAuth2Client); // Pass imageUrl instead of file
        res.status(201).json(newProduct);
    }
    catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: "Failed to create product" });
    }
}));
// Endpoint to fetch all products
app.get("/api/products", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const { name, price, category, imageUrl, ingredients } = req.body; // Get product data from the request body
    if (!name || !price || !category || !imageUrl) {
        // Validate required fields including imageUrl
        return res
            .status(400)
            .json({ error: "Name, price, category, and imageUrl are required" });
    }
    try {
        const productData = { name, price, category, ingredients };
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
    if (id === "all") {
        return res.status(200).json({});
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
// Endpoint to fetch orders with optional date range
app.get("/api/orders", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { from, to, limit } = req.query;
        // Ensure from and to are defined
        const dateRange = {
            from: from ? new Date(from) : new Date(0),
            to: to ? new Date(to) : new Date(),
        };
        const orders = yield (0, order_action_1.fetchOrders)(Number(limit) || 0, dateRange);
        res.status(200).json(orders);
    }
    catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
}));
// Endpoint to create a new order
app.post("/api/createOrder", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { customerName, phoneNumber, items, subtotal, tax, total, status, createdAt, } = req.body;
    if (!customerName || !phoneNumber || !items || !subtotal || !tax || !total) {
        return res.status(400).json({ error: "All fields are required" });
    }
    try {
        const orderData = {
            customerName,
            phoneNumber,
            items,
            subtotal,
            tax,
            total,
            status,
            createdAt,
        };
        const newOrder = yield (0, order_action_1.createOrder)(orderData);
        res.status(201).json(newOrder);
    }
    catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: "Failed to create order" });
    }
}));
// Endpoint to update the status of an order
app.put("/api/updateOrder/:orderId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId } = req.params;
    const { newStatus } = req.body;
    if (!newStatus) {
        return res.status(400).json({ error: "New status is required" });
    }
    try {
        const updatedOrder = yield (0, order_action_1.updateOrderStatus)(orderId, newStatus);
        res.status(200).json(updatedOrder);
    }
    catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ error: "Failed to update order status" });
    }
}));
// Endpoint to search orders by customer name
app.get("/api/searchOrders", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { customerName, from, to } = req.query;
    try {
        const dateRange = {
            from: from ? new Date(from) : new Date(0), // Default to epoch start if undefined
            to: to ? new Date(to) : new Date(), // Default to current date if undefined
        };
        const orders = yield (0, order_action_1.searchOrdersByCustomerName)(customerName, dateRange);
        res.status(200).json(orders);
    }
    catch (error) {
        console.error("Error searching orders:", error);
        res.status(500).json({ error: "Failed to search orders" });
    }
}));
// Endpoint to fetch dashboard metrics
app.get("/api/dashboardMetrics", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { from, to } = req.query;
        // Ensure from and to are defined
        const dateRange = {
            from: from ? new Date(from) : new Date(0),
            to: to ? new Date(to) : new Date(),
        };
        const overallRevenue = yield (0, order_action_1.fetchOverallRevenue)(dateRange);
        const totalOrders = yield (0, order_action_1.countTotalOrders)(dateRange);
        const totalItemsSold = yield (0, order_action_1.calculateTotalItemsSold)(dateRange);
        const profit = overallRevenue * 0.3;
        res.status(200).json({
            overallRevenue: overallRevenue.toLocaleString(),
            totalOrders: totalOrders.toLocaleString(),
            totalItemsSold: totalItemsSold.toLocaleString(),
            profit: profit.toLocaleString(),
        });
    }
    catch (error) {
        console.error("Error fetching dashboard metrics:", error);
        res.status(500).json({ error: "Failed to fetch dashboard metrics" });
    }
}));
// ========== INGREDIENT ENDPOINTS ==========
// Endpoint to create a new ingredient
app.post("/api/createIngredient", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, unit, currentStock, minimumStock, defaultExpiryDays, imageUrl } = req.body;
    if (!name ||
        !unit ||
        currentStock === undefined ||
        minimumStock === undefined) {
        return res.status(400).json({
            error: "Name, unit, currentStock, and minimumStock are required",
        });
    }
    try {
        const ingredientData = {
            name,
            unit,
            currentStock,
            minimumStock,
            defaultExpiryDays: defaultExpiryDays || undefined,
            imageUrl: imageUrl || "",
        };
        const newIngredient = yield (0, ingredient_action_1.createIngredient)(ingredientData, imageUrl || "", oAuth2Client);
        res.status(201).json(newIngredient);
    }
    catch (error) {
        console.error("Error creating ingredient:", error);
        res.status(500).json({ error: "Failed to create ingredient" });
    }
}));
// Endpoint to fetch all ingredients
app.get("/api/ingredients", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ingredients = yield (0, ingredient_action_1.fetchIngredients)();
        res.status(200).json(ingredients);
    }
    catch (error) {
        console.error("Error fetching ingredients:", error);
        res.status(500).json({ error: "Failed to fetch ingredients" });
    }
}));
// Endpoint to fetch an ingredient by ID
app.get("/api/ingredient/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: "Ingredient ID is required" });
    }
    try {
        const ingredient = yield (0, ingredient_action_1.fetchIngredientById)(id);
        res.status(200).json(ingredient);
    }
    catch (error) {
        console.error("Error fetching ingredient by ID:", error);
        res.status(500).json({ error: "Failed to fetch ingredient" });
    }
}));
// Get all lots for a specific ingredient (active only by default)
app.get("/api/ingredient/:id/lots", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, mongoose_1.connectToDB)();
        const { id } = req.params;
        const { active } = req.query; // ?active=true (default) or ?active=false (all)
        const { differenceInDays } = yield Promise.resolve().then(() => __importStar(require("date-fns")));
        const IngredientLot = (yield Promise.resolve().then(() => __importStar(require("./lib/models/ingredientLot.model")))).default;
        const query = { ingredient: id };
        if (active !== "false") {
            query.currentStock = { $gt: 0 }; // Only active lots by default
        }
        const lots = yield IngredientLot.find(query)
            .populate("ingredient", "name unit")
            .sort({ expiryDate: 1 }); // Sort by expiry date
        // Calculate days until expiry for each lot
        const lotsWithDays = lots.map((lot) => {
            const daysUntilExpiry = differenceInDays(new Date(lot.expiryDate), new Date());
            return Object.assign(Object.assign({}, lot.toObject()), { daysUntilExpiry, isExpiringSoon: daysUntilExpiry <= 7 && daysUntilExpiry >= 0, isExpired: daysUntilExpiry < 0 });
        });
        res.status(200).json(lotsWithDays);
    }
    catch (error) {
        console.error("Error fetching ingredient lots:", error);
        res.status(500).json({ error: "Failed to fetch ingredient lots" });
    }
}));
// Endpoint to update an ingredient
app.put("/api/updateIngredient/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, unit, currentStock, minimumStock, defaultExpiryDays, imageUrl } = req.body;
    if (!name ||
        !unit ||
        currentStock === undefined ||
        minimumStock === undefined) {
        return res.status(400).json({
            error: "Name, unit, currentStock, and minimumStock are required",
        });
    }
    try {
        const ingredientData = {
            name,
            unit,
            currentStock,
            minimumStock,
            defaultExpiryDays: defaultExpiryDays || undefined,
            imageUrl: imageUrl || "",
        };
        const updatedIngredient = yield (0, ingredient_action_1.updateIngredient)(id, ingredientData, imageUrl || "", oAuth2Client);
        res.status(200).json(updatedIngredient);
    }
    catch (error) {
        console.error("Error updating ingredient:", error);
        res.status(500).json({ error: "Failed to update ingredient" });
    }
}));
// Endpoint to delete an ingredient
app.delete("/api/deleteIngredient/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: "Ingredient ID is required" });
    }
    try {
        yield (0, ingredient_action_1.deleteIngredient)(id, oAuth2Client);
        res.status(204).send(); // No content to send back
    }
    catch (error) {
        console.error("Error deleting ingredient:", error);
        res.status(500).json({ error: "Failed to delete ingredient" });
    }
}));
// Endpoint to count all ingredients
app.get("/api/ingredients/count", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ingredientCount = yield (0, ingredient_action_1.countAllIngredients)();
        res.status(200).json({ count: ingredientCount });
    }
    catch (error) {
        console.error("Error counting ingredients:", error);
        res.status(500).json({ error: "Failed to count ingredients" });
    }
}));
// ========== TWILIO WEBHOOK ENDPOINT ==========
// Endpoint to receive WhatsApp messages from Twilio
app.post("/api/twilio/webhook", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate webhook signature (required for security)
        const isValid = (0, twilioWebhookValidator_1.validateTwilioWebhook)(req);
        if (!isValid) {
            console.warn("❌ Invalid Twilio webhook signature - rejecting request");
            console.warn("   Check: TWILIO_WEBHOOK_URL matches Twilio Console");
            console.warn("   Check: TWILIO_AUTH_TOKEN is correct");
            return res.status(403).json({
                error: "Invalid webhook signature",
                message: "Request validation failed. Check webhook URL and auth token.",
            });
        }
        // Process webhook using dedicated action
        yield (0, whatsappWebhook_action_1.processWhatsAppWebhook)(req, res);
    }
    catch (error) {
        console.error("Error processing Twilio webhook:", error);
        // Still return 200 to Twilio to avoid retries
        res.status(200).type("text/xml").send("<Response></Response>");
    }
}));
// Endpoint to get all WhatsApp messages
app.get("/api/whatsapp/messages", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const messages = yield (0, whatsappMessage_action_1.fetchWhatsAppMessages)();
        res.status(200).json(messages);
    }
    catch (error) {
        console.error("Error fetching WhatsApp messages:", error);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
}));
// ========== TEST ENDPOINT FOR WHATSAPP ==========
// Test endpoint to send a simple WhatsApp message
app.post("/api/whatsapp/test", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { to, message } = req.body;
        if (!to || !message) {
            return res.status(400).json({
                error: "Missing required fields",
                message: "Please provide 'to' and 'message' in the request body",
            });
        }
        const twilioService = (0, twilio_service_1.getTwilioService)();
        const result = yield twilioService.sendWhatsAppMessage(to, message);
        res.status(200).json({
            success: true,
            messageSid: result.sid,
            status: result.status,
            to: result.to,
            from: result.from,
            body: result.body,
        });
    }
    catch (error) {
        console.error("Error sending test WhatsApp message:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Failed to send message",
            code: error.code,
            status: error.status,
            moreInfo: error.moreInfo,
            details: {
                message: error.message,
                code: error.code,
                status: error.status,
                moreInfo: error.moreInfo,
            },
        });
    }
}));
// Endpoint to get message by ID
app.get("/api/whatsapp/message/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const message = yield (0, whatsappMessage_action_1.fetchWhatsAppMessageById)(id);
        res.status(200).json(message);
    }
    catch (error) {
        console.error("Error fetching message:", error);
        res.status(500).json({ error: "Failed to fetch message" });
    }
}));
// Endpoint to get messages for an order
app.get("/api/whatsapp/messages/order/:orderId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId } = req.params;
    try {
        const messages = yield (0, whatsappMessage_action_1.fetchWhatsAppMessagesByOrderId)(orderId);
        res.status(200).json(messages);
    }
    catch (error) {
        console.error("Error fetching messages for order:", error);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
}));
// Get order by orderId
app.get("/api/order/:orderId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.params;
        const order = yield (0, order_action_1.fetchOrderById)(orderId);
        res.status(200).json(order);
    }
    catch (error) {
        console.error("Error fetching order:", error);
        res.status(404).json({ error: error.message || "Order not found" });
    }
}));
// Get lots used for an order
app.get("/api/order/:orderId/lots", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, mongoose_1.connectToDB)();
        const { orderId } = req.params;
        const Order = (yield Promise.resolve().then(() => __importStar(require("./lib/models/order.model")))).default;
        const order = yield Order.findOne({ orderId });
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        if (!order.lotUsageMetadata || !order.lotUsageMetadata.lotsUsed) {
            return res.status(200).json({ lotsUsed: [] });
        }
        res.status(200).json({
            lotsUsed: order.lotUsageMetadata.lotsUsed,
            deductedAt: order.lotUsageMetadata.deductedAt,
        });
    }
    catch (error) {
        console.error("Error fetching order lots:", error);
        res.status(500).json({ error: "Failed to fetch order lots" });
    }
}));
// Get orders that used a specific lot
app.get("/api/lot/:lotId/orders", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, mongoose_1.connectToDB)();
        const { lotId } = req.params;
        const Order = (yield Promise.resolve().then(() => __importStar(require("./lib/models/order.model")))).default;
        const orders = yield Order.find({
            "lotUsageMetadata.lotsUsed.lotId": lotId,
        })
            .select("orderId customerName createdAt status lotUsageMetadata")
            .sort({ createdAt: -1 })
            .limit(50);
        res.status(200).json(orders);
    }
    catch (error) {
        console.error("Error fetching orders for lot:", error);
        res.status(500).json({ error: "Failed to fetch orders for lot" });
    }
}));
// Calculate ingredient requirements for an order
app.get("/api/order/:orderId/stock-calculation", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.params;
        const order = yield (0, order_action_1.fetchOrderById)(orderId);
        // If order has stored stock calculation metadata, use that (historical data)
        if (order.stockCalculationMetadata) {
            // Return stored calculation (historical data)
            return res.status(200).json({
                orderId,
                allIngredientsSufficient: order.stockCalculationMetadata.allIngredientsSufficient,
                requirements: order.stockCalculationMetadata.requirements.map((req) => ({
                    ingredientId: req.ingredientId,
                    ingredientName: req.ingredientName,
                    unit: req.unit,
                    requiredQuantity: req.requiredQuantity,
                    currentStock: req.stockAtTimeOfOrder, // Show stock at time of order
                    minimumStock: 0, // Not stored, but not critical for display
                    isSufficient: req.wasSufficient,
                    shortage: req.wasSufficient
                        ? 0
                        : req.requiredQuantity - req.stockAtTimeOfOrder,
                })),
                warnings: order.stockCalculationMetadata.warnings,
                isHistorical: true, // Flag to indicate this is stored data
                calculatedAt: order.stockCalculationMetadata.calculatedAt,
            });
        }
        // Fallback: Recalculate for orders without stored metadata (manual orders, old orders)
        const result = yield (0, orderStockCalculation_action_1.calculateOrderStockRequirements)(orderId);
        res.status(200).json(Object.assign(Object.assign({}, result), { isHistorical: false }));
    }
    catch (error) {
        console.error("Error calculating stock requirements:", error);
        res
            .status(500)
            .json({ error: error.message || "Failed to calculate stock" });
    }
}));
// Process stock calculation, deduction, and notification for an order
// Can be called manually or via cronjob (e.g., after restocking)
app.post("/api/order/:orderId/process-stock", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.params;
        const result = yield (0, orderStockNotification_action_1.processOrderStockAndNotification)(orderId);
        if (result.success) {
            res.status(200).json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        console.error("Error processing order stock:", error);
        res.status(500).json({
            error: error.message || "Failed to process order stock",
        });
    }
}));
// ========== BAKE SHEET ENDPOINTS ==========
// Simple fetch bake sheet (real-time, no document storage)
// IMPORTANT: This must be BEFORE /api/bakesheet/:sheetId to avoid route conflict
app.get("/api/bakesheet/generate", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, mongoose_1.connectToDB)();
        const { startDate, endDate, date } = req.query; // Support both date range and single date
        const { generateBakeSheetFromOrders } = yield Promise.resolve().then(() => __importStar(require("./lib/actions/bakeSheet.action")));
        // If date is provided (legacy support), use it for both start and end
        // Otherwise use startDate and endDate
        const start = startDate || date;
        const end = endDate || date;
        const bakeSheet = yield generateBakeSheetFromOrders(start, end);
        res.status(200).json(bakeSheet);
    }
    catch (error) {
        console.error("Error generating bake sheet:", error);
        res.status(500).json({ error: "Failed to generate bake sheet" });
    }
}));
// Get all bake sheets (optionally filtered by date)
app.get("/api/bakesheet", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date } = req.query;
        const { fetchBakeSheets } = yield Promise.resolve().then(() => __importStar(require("./lib/actions/bakeSheet.action")));
        const bakeSheets = yield fetchBakeSheets(date);
        res.status(200).json(bakeSheets);
    }
    catch (error) {
        console.error("Error fetching bake sheets:", error);
        res.status(500).json({ error: "Failed to fetch bake sheets" });
    }
}));
// Get bake sheet by ID
app.get("/api/bakesheet/:sheetId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sheetId } = req.params;
        const { fetchBakeSheetById } = yield Promise.resolve().then(() => __importStar(require("./lib/actions/bakeSheet.action")));
        const bakeSheet = yield fetchBakeSheetById(sheetId);
        if (!bakeSheet) {
            return res.status(404).json({ error: "Bake sheet not found" });
        }
        res.status(200).json(bakeSheet);
    }
    catch (error) {
        console.error("Error fetching bake sheet:", error);
        res.status(500).json({ error: "Failed to fetch bake sheet" });
    }
}));
// Update bake sheet status
app.patch("/api/bakesheet/:sheetId/status", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sheetId } = req.params;
        const { status } = req.body;
        const { updateBakeSheetStatus } = yield Promise.resolve().then(() => __importStar(require("./lib/actions/bakeSheet.action")));
        const bakeSheet = yield updateBakeSheetStatus(sheetId, status);
        if (!bakeSheet) {
            return res.status(404).json({ error: "Bake sheet not found" });
        }
        res.status(200).json(bakeSheet);
    }
    catch (error) {
        console.error("Error updating bake sheet status:", error);
        res.status(500).json({ error: "Failed to update bake sheet status" });
    }
}));
// ========== WASTE LOG ENDPOINTS ==========
// Get all waste logs
app.get("/api/waste", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit } = req.query;
        const { fetchWasteLogs } = yield Promise.resolve().then(() => __importStar(require("./lib/actions/wasteLog.action")));
        const wasteLogs = yield fetchWasteLogs(limit ? parseInt(limit) : 0);
        res.status(200).json(wasteLogs);
    }
    catch (error) {
        console.error("Error fetching waste logs:", error);
        res.status(500).json({ error: "Failed to fetch waste logs" });
    }
}));
// ========== EXPIRY CHECK ENDPOINTS ==========
// Get expiring ingredients
app.get("/api/expiry", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { days, limit } = req.query;
        const { fetchExpiringIngredients } = yield Promise.resolve().then(() => __importStar(require("./lib/actions/expiryCheck.action")));
        const expiring = yield fetchExpiringIngredients(days ? parseInt(days) : 7, limit ? parseInt(limit) : 5);
        res.status(200).json(expiring);
    }
    catch (error) {
        console.error("Error fetching expiring ingredients:", error);
        res.status(500).json({ error: "Failed to fetch expiring ingredients" });
    }
}));
// Get ingredient lots by ingredient ID
app.get("/api/expiry/ingredient/:ingredientId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ingredientId } = req.params;
        const { fetchIngredientLotsByIngredient } = yield Promise.resolve().then(() => __importStar(require("./lib/actions/expiryCheck.action")));
        const lots = yield fetchIngredientLotsByIngredient(ingredientId);
        res.status(200).json(lots);
    }
    catch (error) {
        console.error("Error fetching ingredient lots:", error);
        res.status(500).json({ error: "Failed to fetch ingredient lots" });
    }
}));
// ========== COMMAND LOG ENDPOINTS ==========
// Get all command logs
app.get("/api/logs", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit, command } = req.query;
        const { fetchCommandLogs, fetchCommandLogsByCommand } = yield Promise.resolve().then(() => __importStar(require("./lib/actions/commandLog.action")));
        let logs;
        if (command) {
            logs = yield fetchCommandLogsByCommand(command);
        }
        else {
            logs = yield fetchCommandLogs(limit ? parseInt(limit) : 0);
        }
        res.status(200).json(logs);
    }
    catch (error) {
        console.error("Error fetching command logs:", error);
        res.status(500).json({ error: "Failed to fetch command logs" });
    }
}));
// ========== INGREDIENT LOTS ENDPOINTS ==========
// Create new ingredient lot (manual)
app.post("/api/lots", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, mongoose_1.connectToDB)();
        const { ingredient, quantity, unit, expiryDate, purchaseDate, supplier, cost, currentStock } = req.body;
        const Ingredient = (yield Promise.resolve().then(() => __importStar(require("./lib/models/ingredient.model")))).default;
        const IngredientLot = (yield Promise.resolve().then(() => __importStar(require("./lib/models/ingredientLot.model")))).default;
        const { AIService } = yield Promise.resolve().then(() => __importStar(require("./lib/services/ai.service")));
        const { addDays } = yield Promise.resolve().then(() => __importStar(require("date-fns")));
        const ingredientDoc = yield Ingredient.findById(ingredient);
        if (!ingredientDoc) {
            return res.status(404).json({ error: "Ingredient not found" });
        }
        // Calculate expiry date if not provided
        let finalExpiryDate;
        let expirySource = "user";
        if (expiryDate) {
            finalExpiryDate = new Date(expiryDate);
            expirySource = "user";
        }
        else {
            // Use ingredient's defaultExpiryDays if available
            if (ingredientDoc.defaultExpiryDays && ingredientDoc.defaultExpiryDays > 0) {
                finalExpiryDate = addDays(new Date(), ingredientDoc.defaultExpiryDays);
                expirySource = "database";
            }
            else {
                // Use AI to predict expiry days (only for this lot, don't update ingredient)
                const aiService = new AIService();
                try {
                    const predictedDays = yield aiService.predictExpiryDays(ingredientDoc.name);
                    finalExpiryDate = addDays(new Date(), predictedDays);
                    expirySource = "ai";
                }
                catch (error) {
                    console.error("AI prediction failed, using safe default:", error);
                    // Fallback to safe default (30 days) if AI fails
                    finalExpiryDate = addDays(new Date(), 30);
                    expirySource = "default";
                }
            }
        }
        // Create lot
        const lot = yield IngredientLot.create({
            ingredient,
            quantity,
            unit: unit || ingredientDoc.unit,
            expiryDate: finalExpiryDate,
            purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
            supplier,
            cost,
            currentStock: currentStock || quantity,
            expirySource,
        });
        // Update ingredient total stock
        ingredientDoc.currentStock += (currentStock || quantity);
        yield ingredientDoc.save();
        res.status(201).json(lot);
    }
    catch (error) {
        console.error("Error creating ingredient lot:", error);
        res.status(500).json({ error: "Failed to create ingredient lot" });
    }
}));
// Delete ingredient lot
app.delete("/api/lots/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, mongoose_1.connectToDB)();
        const { id } = req.params;
        const Ingredient = (yield Promise.resolve().then(() => __importStar(require("./lib/models/ingredient.model")))).default;
        const IngredientLot = (yield Promise.resolve().then(() => __importStar(require("./lib/models/ingredientLot.model")))).default;
        const lot = yield IngredientLot.findById(id);
        if (!lot) {
            return res.status(404).json({ error: "Lot not found" });
        }
        // Update ingredient total stock (subtract lot's currentStock)
        const ingredient = yield Ingredient.findById(lot.ingredient);
        if (ingredient) {
            ingredient.currentStock = Math.max(0, ingredient.currentStock - lot.currentStock);
            yield ingredient.save();
        }
        // Delete lot
        yield IngredientLot.findByIdAndDelete(id);
        res.status(200).json({ message: "Lot deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting ingredient lot:", error);
        res.status(500).json({ error: "Failed to delete ingredient lot" });
    }
}));
// Start server
app.listen(port, () => {
    const ip = require("ip").address(); // Import the 'ip' module to get the local IP address
    console.log(`Server is running on http://${ip}:${port}`); // Use the local IP address instead of localhost
});
