import express, { Request, Response } from "express"; // Ensure Response is imported
import dotenv from "dotenv";
import cors from "cors";
import { connectToDB } from "./lib/mongoose";
import {
  createProduct,
  deleteProduct,
  fetchProductById,
  fetchProducts,
  updateProduct, // Import the new function
  fetchProductsByCategoryId, // Import the new function
  countProductsByCategoryId,
  countAllProducts, // Import the new function
  deleteMultipleProducts, // Import the new function
  filterProductsByParams, // Import the new function
} from "./lib/actions/product.action";
import { ProductData } from "./lib/models/product.model";
import { getOAuth2Client } from "./lib/utils/googleUtils";
import { OAuth2Client } from "google-auth-library"; // Import OAuth2Client
import {
  createCategory,
  fetchCategories,
  fetchCategoryById,
} from "./lib/actions/category.action"; // Import the new function
import { CategoryData } from "./lib/models/category.model";
import {
  calculateTotalItemsSold,
  countTotalOrders,
  createOrder,
  fetchOrders,
  fetchOrderById,
  fetchOverallRevenue,
  searchOrdersByCustomerName,
  updateOrderStatus,
} from "./lib/actions/order.action"; // Import the function
import { OrderData } from "./lib/models/order.model";
import { seedOrders } from "./lib/utils/seedOrdersUtils";
import {
  createIngredient,
  deleteIngredient,
  fetchIngredientById,
  fetchIngredients,
  updateIngredient,
  countAllIngredients,
} from "./lib/actions/ingredient.action";
import { IngredientData } from "./lib/models/ingredient.model";
import {
  createWhatsAppMessage,
  fetchWhatsAppMessages,
  fetchWhatsAppMessageById,
  fetchWhatsAppMessagesByOrderId,
} from "./lib/actions/whatsappMessage.action";
import { processWhatsAppMessageForOrder } from "./lib/actions/whatsappOrderProcessing.action";
import { validateTwilioWebhook } from "./lib/utils/twilioWebhookValidator";
import { getTwilioService } from "./lib/services/twilio.service";
import { calculateOrderStockRequirements } from "./lib/actions/orderStockCalculation.action";
import { processOrderStockAndNotification } from "./lib/actions/orderStockNotification.action";
import { processWhatsAppWebhook } from "./lib/actions/whatsappWebhook.action";

// Specify the path to your .env.local file
dotenv.config({ path: ".env.local" });

const app = express();
const port = process.env.PORT || 8080;

// Increase the limit for JSON body size
app.use(express.json({ limit: "10mb" }));

// Middleware
app.use(cors());

// Twilio webhook needs urlencoded body for signature validation
// Apply urlencoded middleware for Twilio webhook route specifically
app.use(
  "/api/twilio/webhook",
  express.urlencoded({ extended: true, limit: "10mb" })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

connectToDB();

// UNCOMMENT FOR SEEDING DATA
// connectToDB().then(() => {
//   seedOrders().catch((error) => {
//     console.error("Error seeding database:", error);
//   });
// });

// Initialize Google Drive API client at server start
const oAuth2Client: OAuth2Client = getOAuth2Client(); // Use the new function

// Endpoint to add a new product
app.post("/api/createProduct", async (req: Request, res: Response) => {
  const { name, price, category, imageUrl, ingredients } = req.body;

  if (!name || !price || !category || !imageUrl) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const productData: ProductData = { name, price, category, ingredients };
    const newProduct = await createProduct(productData, imageUrl, oAuth2Client); // Pass imageUrl instead of file
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// Endpoint to fetch all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await fetchProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Endpoint to delete a product
app.delete("/api/deleteProduct/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Product ID is required" });
  }

  try {
    // Assuming you have a deleteProduct function in your actions
    await deleteProduct(id, oAuth2Client); // Implement this function in your product actions
    res.status(204).send(); // No content to send back
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// Endpoint to fetch a product by ID
app.get("/api/product/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Product ID is required" });
  }

  try {
    const product = await fetchProductById(id); // Call the new function
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// Endpoint to update a product
app.put("/api/updateProduct/:id", async (req: Request, res: Response) => {
  const { id } = req.params; // Get the product ID from the URL
  const { name, price, category, imageUrl, ingredients } = req.body; // Get product data from the request body

  if (!name || !price || !category || !imageUrl) {
    // Validate required fields including imageUrl
    return res
      .status(400)
      .json({ error: "Name, price, category, and imageUrl are required" });
  }

  try {
    const productData: ProductData = { name, price, category, ingredients };
    const updatedProduct = await updateProduct(
      id,
      productData,
      imageUrl,
      oAuth2Client
    ); // Call the update function
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Endpoint to create a new category
app.post("/api/createCategory", async (req: Request, res: Response) => {
  const { name, imageUrl } = req.body;

  if (!name || !imageUrl) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const categoryData: CategoryData = { name };
    const newCategory = await createCategory(
      categoryData,
      imageUrl,
      oAuth2Client
    ); // Pass imageUrl instead of file
    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// Endpoint to fetch all categories
app.get("/api/categories", async (req: Request, res: Response) => {
  try {
    const categories = await fetchCategories();
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Endpoint to fetch products by category ID
app.get(
  "/api/products/category/:categoryId",
  async (req: Request, res: Response) => {
    const { categoryId } = req.params;

    if (!categoryId) {
      return res.status(400).json({ error: "Category ID is required" });
    }

    try {
      const products = await fetchProductsByCategoryId(categoryId);
      res.status(200).json(products);
    } catch (error) {
      console.error("Error fetching products by category ID:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  }
);

// Endpoint to count products by category ID
app.get(
  "/api/products/count/:categoryId",
  async (req: Request, res: Response) => {
    const { categoryId } = req.params;

    if (!categoryId) {
      return res.status(400).json({ error: "Category ID is required" });
    }

    try {
      const productCount = await countProductsByCategoryId(categoryId);
      res.status(200).json({ count: productCount });
    } catch (error) {
      console.error("Error counting products by category ID:", error);
      res.status(500).json({ error: "Failed to count products" });
    }
  }
);

// Endpoint to count all products
app.get("/api/products/count", async (req: Request, res: Response) => {
  try {
    const productCount = await countAllProducts();
    res.status(200).json({ count: productCount });
  } catch (error) {
    console.error("Error counting all products:", error);
    res.status(500).json({ error: "Failed to count products" });
  }
});

// Endpoint to delete multiple products
app.delete(
  "/api/deleteMultipleProducts",
  async (req: Request, res: Response) => {
    const { ids } = req.body; // Expect an array of IDs in the request body

    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ error: "An array of product IDs is required" });
    }

    try {
      const result = await deleteMultipleProducts(ids, oAuth2Client);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error deleting multiple products:", error);
      res.status(500).json({ error: "Failed to delete multiple products" });
    }
  }
);

// Endpoint to fetch a category by ID
app.get("/api/category/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Category ID is required" });
  }

  if (id === "all") {
    return res.status(200).json({});
  }

  try {
    const category = await fetchCategoryById(id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    res.status(500).json({ error: "Failed to fetch category" });
  }
});

// Endpoint to filter products by name or category name and optionally by category ID
app.get("/api/filterProducts", async (req: Request, res: Response) => {
  const { textToSearch, categoryId, maxPrice } = req.query;

  try {
    const products = await filterProductsByParams(
      textToSearch as string,
      categoryId as string,
      maxPrice ? Number(maxPrice) : 0 // Convert maxPrice to number if provided
    );
    res.status(200).json(products);
  } catch (error) {
    console.error("Error filtering products:", error);
    res.status(500).json({ error: "Failed to filter products" });
  }
});

// Endpoint to fetch orders with optional date range
app.get("/api/orders", async (req: Request, res: Response) => {
  try {
    const { from, to, limit } = req.query;

    // Ensure from and to are defined
    const dateRange = {
      from: from ? new Date(from as string) : new Date(0),
      to: to ? new Date(to as string) : new Date(),
    };

    const orders = await fetchOrders(Number(limit) || 0, dateRange);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Endpoint to create a new order
app.post("/api/createOrder", async (req: Request, res: Response) => {
  const {
    customerName,
    phoneNumber,
    items,
    subtotal,
    tax,
    total,
    status,
    createdAt,
  } = req.body;

  if (!customerName || !phoneNumber || !items || !subtotal || !tax || !total) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const orderData: OrderData = {
      customerName,
      phoneNumber,
      items,
      subtotal,
      tax,
      total,
      status,
      createdAt,
    };
    const newOrder = await createOrder(orderData);
    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Endpoint to update the status of an order
app.put("/api/updateOrder/:orderId", async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { newStatus } = req.body;

  if (!newStatus) {
    return res.status(400).json({ error: "New status is required" });
  }

  try {
    const updatedOrder = await updateOrderStatus(orderId, newStatus);
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// Endpoint to search orders by customer name
app.get("/api/searchOrders", async (req: Request, res: Response) => {
  const { customerName, from, to } = req.query;

  try {
    const dateRange = {
      from: from ? new Date(from as string) : new Date(0), // Default to epoch start if undefined
      to: to ? new Date(to as string) : new Date(), // Default to current date if undefined
    };

    const orders = await searchOrdersByCustomerName(
      customerName as string,
      dateRange
    );
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error searching orders:", error);
    res.status(500).json({ error: "Failed to search orders" });
  }
});

// Endpoint to fetch dashboard metrics
app.get("/api/dashboardMetrics", async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;

    // Ensure from and to are defined
    const dateRange = {
      from: from ? new Date(from as string) : new Date(0),
      to: to ? new Date(to as string) : new Date(),
    };

    const overallRevenue = await fetchOverallRevenue(dateRange);
    const totalOrders = await countTotalOrders(dateRange);
    const totalItemsSold = await calculateTotalItemsSold(dateRange);

    const profit = overallRevenue * 0.3;

    res.status(200).json({
      overallRevenue: overallRevenue.toLocaleString(),
      totalOrders: totalOrders.toLocaleString(),
      totalItemsSold: totalItemsSold.toLocaleString(),
      profit: profit.toLocaleString(),
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    res.status(500).json({ error: "Failed to fetch dashboard metrics" });
  }
});

// ========== INGREDIENT ENDPOINTS ==========

// Endpoint to create a new ingredient
app.post("/api/createIngredient", async (req: Request, res: Response) => {
  const { name, unit, currentStock, minimumStock, defaultExpiryDays, imageUrl } = req.body;

  if (
    !name ||
    !unit ||
    currentStock === undefined ||
    minimumStock === undefined
  ) {
    return res.status(400).json({
      error: "Name, unit, currentStock, and minimumStock are required",
    });
  }

  try {
    const ingredientData: IngredientData = {
      name,
      unit,
      currentStock,
      minimumStock,
      defaultExpiryDays: defaultExpiryDays || undefined,
      imageUrl: imageUrl || "",
    };
    const newIngredient = await createIngredient(
      ingredientData,
      imageUrl || "",
      oAuth2Client
    );
    res.status(201).json(newIngredient);
  } catch (error) {
    console.error("Error creating ingredient:", error);
    res.status(500).json({ error: "Failed to create ingredient" });
  }
});

// Endpoint to fetch all ingredients
app.get("/api/ingredients", async (req: Request, res: Response) => {
  try {
    const ingredients = await fetchIngredients();
    res.status(200).json(ingredients);
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    res.status(500).json({ error: "Failed to fetch ingredients" });
  }
});

// Endpoint to fetch an ingredient by ID
app.get("/api/ingredient/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Ingredient ID is required" });
  }

  try {
    const ingredient = await fetchIngredientById(id);
    res.status(200).json(ingredient);
  } catch (error) {
    console.error("Error fetching ingredient by ID:", error);
    res.status(500).json({ error: "Failed to fetch ingredient" });
  }
});

// Get all lots for a specific ingredient (active only by default)
app.get("/api/ingredient/:id/lots", async (req: Request, res: Response) => {
  try {
    await connectToDB();
    const { id } = req.params;
    const { active } = req.query; // ?active=true (default) or ?active=false (all)
    const { differenceInDays } = await import("date-fns");
    const IngredientLot = (await import("./lib/models/ingredientLot.model")).default;

    const query: any = { ingredient: id };
    if (active !== "false") {
      query.currentStock = { $gt: 0 }; // Only active lots by default
    }

    const lots = await IngredientLot.find(query)
      .populate("ingredient", "name unit")
      .sort({ expiryDate: 1 }); // Sort by expiry date

    // Calculate days until expiry for each lot
    const lotsWithDays = lots.map((lot: any) => {
      const daysUntilExpiry = differenceInDays(
        new Date(lot.expiryDate),
        new Date()
      );
      return {
        ...lot.toObject(),
        daysUntilExpiry,
        isExpiringSoon: daysUntilExpiry <= 7 && daysUntilExpiry >= 0,
        isExpired: daysUntilExpiry < 0,
      };
    });

    res.status(200).json(lotsWithDays);
  } catch (error) {
    console.error("Error fetching ingredient lots:", error);
    res.status(500).json({ error: "Failed to fetch ingredient lots" });
  }
});

// Endpoint to update an ingredient
app.put("/api/updateIngredient/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, unit, currentStock, minimumStock, defaultExpiryDays, imageUrl } = req.body;

  if (
    !name ||
    !unit ||
    currentStock === undefined ||
    minimumStock === undefined
  ) {
    return res.status(400).json({
      error: "Name, unit, currentStock, and minimumStock are required",
    });
  }

  try {
    const ingredientData: IngredientData = {
      name,
      unit,
      currentStock,
      minimumStock,
      defaultExpiryDays: defaultExpiryDays || undefined,
      imageUrl: imageUrl || "",
    };
    const updatedIngredient = await updateIngredient(
      id,
      ingredientData,
      imageUrl || "",
      oAuth2Client
    );
    res.status(200).json(updatedIngredient);
  } catch (error) {
    console.error("Error updating ingredient:", error);
    res.status(500).json({ error: "Failed to update ingredient" });
  }
});

// Endpoint to delete an ingredient
app.delete("/api/deleteIngredient/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Ingredient ID is required" });
  }

  try {
    await deleteIngredient(id, oAuth2Client);
    res.status(204).send(); // No content to send back
  } catch (error) {
    console.error("Error deleting ingredient:", error);
    res.status(500).json({ error: "Failed to delete ingredient" });
  }
});

// Endpoint to count all ingredients
app.get("/api/ingredients/count", async (req: Request, res: Response) => {
  try {
    const ingredientCount = await countAllIngredients();
    res.status(200).json({ count: ingredientCount });
  } catch (error) {
    console.error("Error counting ingredients:", error);
    res.status(500).json({ error: "Failed to count ingredients" });
  }
});

// ========== TWILIO WEBHOOK ENDPOINT ==========

// Endpoint to receive WhatsApp messages from Twilio
app.post("/api/twilio/webhook", async (req: Request, res: Response) => {
  try {
    // Validate webhook signature (required for security)
    const isValid = validateTwilioWebhook(req);
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
    await processWhatsAppWebhook(req, res);
  } catch (error) {
    console.error("Error processing Twilio webhook:", error);
    // Still return 200 to Twilio to avoid retries
    res.status(200).type("text/xml").send("<Response></Response>");
  }
});

// Endpoint to get all WhatsApp messages
app.get("/api/whatsapp/messages", async (req: Request, res: Response) => {
  try {
    const messages = await fetchWhatsAppMessages();
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching WhatsApp messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// ========== TEST ENDPOINT FOR WHATSAPP ==========
// Test endpoint to send a simple WhatsApp message
app.post("/api/whatsapp/test", async (req: Request, res: Response) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Please provide 'to' and 'message' in the request body",
      });
    }

    const twilioService = getTwilioService();
    const result = await twilioService.sendWhatsAppMessage(to, message);

    res.status(200).json({
      success: true,
      messageSid: result.sid,
      status: result.status,
      to: result.to,
      from: result.from,
      body: result.body,
    });
  } catch (error: any) {
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
});

// Endpoint to get message by ID
app.get("/api/whatsapp/message/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const message = await fetchWhatsAppMessageById(id);
    res.status(200).json(message);
  } catch (error) {
    console.error("Error fetching message:", error);
    res.status(500).json({ error: "Failed to fetch message" });
  }
});

// Endpoint to get messages for an order
app.get(
  "/api/whatsapp/messages/order/:orderId",
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    try {
      const messages = await fetchWhatsAppMessagesByOrderId(orderId);
      res.status(200).json(messages);
    } catch (error) {
      console.error("Error fetching messages for order:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  }
);

// Get order by orderId
app.get("/api/order/:orderId", async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = await fetchOrderById(orderId);
    res.status(200).json(order);
  } catch (error: any) {
    console.error("Error fetching order:", error);
    res.status(404).json({ error: error.message || "Order not found" });
  }
});

// Get lots used for an order
app.get("/api/order/:orderId/lots", async (req: Request, res: Response) => {
  try {
    await connectToDB();
    const { orderId } = req.params;
    const Order = (await import("./lib/models/order.model")).default;
    const order = await Order.findOne({ orderId });

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
  } catch (error: any) {
    console.error("Error fetching order lots:", error);
    res.status(500).json({ error: "Failed to fetch order lots" });
  }
});

// Get orders that used a specific lot
app.get("/api/lot/:lotId/orders", async (req: Request, res: Response) => {
  try {
    await connectToDB();
    const { lotId } = req.params;
    const Order = (await import("./lib/models/order.model")).default;

    const orders = await Order.find({
      "lotUsageMetadata.lotsUsed.lotId": lotId,
    })
      .select("orderId customerName createdAt status lotUsageMetadata")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(orders);
  } catch (error: any) {
    console.error("Error fetching orders for lot:", error);
    res.status(500).json({ error: "Failed to fetch orders for lot" });
  }
});

// Calculate ingredient requirements for an order
app.get(
  "/api/order/:orderId/stock-calculation",
  async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const order = await fetchOrderById(orderId);

      // If order has stored stock calculation metadata, use that (historical data)
      if (order.stockCalculationMetadata) {
        // Return stored calculation (historical data)
        return res.status(200).json({
          orderId,
          allIngredientsSufficient:
            order.stockCalculationMetadata.allIngredientsSufficient,
          requirements: order.stockCalculationMetadata.requirements.map(
            (req: any) => ({
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
            })
          ),
          warnings: order.stockCalculationMetadata.warnings,
          isHistorical: true, // Flag to indicate this is stored data
          calculatedAt: order.stockCalculationMetadata.calculatedAt,
        });
      }

      // Fallback: Recalculate for orders without stored metadata (manual orders, old orders)
      const result = await calculateOrderStockRequirements(orderId);
      res.status(200).json({
        ...result,
        isHistorical: false, // Flag to indicate this is current calculation
      });
    } catch (error: any) {
      console.error("Error calculating stock requirements:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to calculate stock" });
    }
  }
);

// Process stock calculation, deduction, and notification for an order
// Can be called manually or via cronjob (e.g., after restocking)
app.post(
  "/api/order/:orderId/process-stock",
  async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const result = await processOrderStockAndNotification(orderId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      console.error("Error processing order stock:", error);
      res.status(500).json({
        error: error.message || "Failed to process order stock",
      });
    }
  }
);

// ========== BAKE SHEET ENDPOINTS ==========

// Simple fetch bake sheet (real-time, no document storage)
// IMPORTANT: This must be BEFORE /api/bakesheet/:sheetId to avoid route conflict
app.get("/api/bakesheet/generate", async (req: Request, res: Response) => {
  try {
    await connectToDB();
    const { startDate, endDate, date } = req.query; // Support both date range and single date
    const { generateBakeSheetFromOrders } = await import("./lib/actions/bakeSheet.action");
    
    // If date is provided (legacy support), use it for both start and end
    // Otherwise use startDate and endDate
    const start = (startDate as string) || (date as string);
    const end = (endDate as string) || (date as string);
    
    const bakeSheet = await generateBakeSheetFromOrders(start, end);
    res.status(200).json(bakeSheet);
  } catch (error) {
    console.error("Error generating bake sheet:", error);
    res.status(500).json({ error: "Failed to generate bake sheet" });
  }
});

// Get all bake sheets (optionally filtered by date)
app.get("/api/bakesheet", async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const { fetchBakeSheets } = await import("./lib/actions/bakeSheet.action");
    const bakeSheets = await fetchBakeSheets(date as string | undefined);
    res.status(200).json(bakeSheets);
  } catch (error) {
    console.error("Error fetching bake sheets:", error);
    res.status(500).json({ error: "Failed to fetch bake sheets" });
  }
});

// Get bake sheet by ID
app.get("/api/bakesheet/:sheetId", async (req: Request, res: Response) => {
  try {
    const { sheetId } = req.params;
    const { fetchBakeSheetById } = await import("./lib/actions/bakeSheet.action");
    const bakeSheet = await fetchBakeSheetById(sheetId);
    if (!bakeSheet) {
      return res.status(404).json({ error: "Bake sheet not found" });
    }
    res.status(200).json(bakeSheet);
  } catch (error) {
    console.error("Error fetching bake sheet:", error);
    res.status(500).json({ error: "Failed to fetch bake sheet" });
  }
});

// Update bake sheet status
app.patch("/api/bakesheet/:sheetId/status", async (req: Request, res: Response) => {
  try {
    const { sheetId } = req.params;
    const { status } = req.body;
    const { updateBakeSheetStatus } = await import("./lib/actions/bakeSheet.action");
    const bakeSheet = await updateBakeSheetStatus(sheetId, status);
    if (!bakeSheet) {
      return res.status(404).json({ error: "Bake sheet not found" });
    }
    res.status(200).json(bakeSheet);
  } catch (error) {
    console.error("Error updating bake sheet status:", error);
    res.status(500).json({ error: "Failed to update bake sheet status" });
  }
});

// ========== WASTE LOG ENDPOINTS ==========

// Get all waste logs
app.get("/api/waste", async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const { fetchWasteLogs } = await import("./lib/actions/wasteLog.action");
    const wasteLogs = await fetchWasteLogs(limit ? parseInt(limit as string) : 0);
    res.status(200).json(wasteLogs);
  } catch (error) {
    console.error("Error fetching waste logs:", error);
    res.status(500).json({ error: "Failed to fetch waste logs" });
  }
});

// ========== EXPIRY CHECK ENDPOINTS ==========

// Get expiring ingredients
app.get("/api/expiry", async (req: Request, res: Response) => {
  try {
    const { days, limit } = req.query;
    const { fetchExpiringIngredients } = await import("./lib/actions/expiryCheck.action");
    const expiring = await fetchExpiringIngredients(
      days ? parseInt(days as string) : 7,
      limit ? parseInt(limit as string) : 5
    );
    res.status(200).json(expiring);
  } catch (error) {
    console.error("Error fetching expiring ingredients:", error);
    res.status(500).json({ error: "Failed to fetch expiring ingredients" });
  }
});

// Get ingredient lots by ingredient ID
app.get("/api/expiry/ingredient/:ingredientId", async (req: Request, res: Response) => {
  try {
    const { ingredientId } = req.params;
    const { fetchIngredientLotsByIngredient } = await import("./lib/actions/expiryCheck.action");
    const lots = await fetchIngredientLotsByIngredient(ingredientId);
    res.status(200).json(lots);
  } catch (error) {
    console.error("Error fetching ingredient lots:", error);
    res.status(500).json({ error: "Failed to fetch ingredient lots" });
  }
});

// ========== COMMAND LOG ENDPOINTS ==========

// Get all command logs
app.get("/api/logs", async (req: Request, res: Response) => {
  try {
    const { limit, command } = req.query;
    const { fetchCommandLogs, fetchCommandLogsByCommand } = await import("./lib/actions/commandLog.action");
    
    let logs;
    if (command) {
      logs = await fetchCommandLogsByCommand(command as string);
    } else {
      logs = await fetchCommandLogs(limit ? parseInt(limit as string) : 0);
    }
    
    res.status(200).json(logs);
  } catch (error) {
    console.error("Error fetching command logs:", error);
    res.status(500).json({ error: "Failed to fetch command logs" });
  }
});

// ========== INGREDIENT LOTS ENDPOINTS ==========

// Create new ingredient lot (manual)
app.post("/api/lots", async (req: Request, res: Response) => {
  try {
    await connectToDB();
    const { ingredient, quantity, unit, expiryDate, purchaseDate, supplier, cost, currentStock } = req.body;

    const Ingredient = (await import("./lib/models/ingredient.model")).default;
    const IngredientLot = (await import("./lib/models/ingredientLot.model")).default;
    const { AIService } = await import("./lib/services/ai.service");
    const { addDays } = await import("date-fns");

    const ingredientDoc = await Ingredient.findById(ingredient);
    if (!ingredientDoc) {
      return res.status(404).json({ error: "Ingredient not found" });
    }

    // Calculate expiry date if not provided
    let finalExpiryDate: Date;
    let expirySource: "user" | "database" | "ai" | "default" = "user";
    
    if (expiryDate) {
      finalExpiryDate = new Date(expiryDate);
      expirySource = "user";
    } else {
      // Use ingredient's defaultExpiryDays if available
      if (ingredientDoc.defaultExpiryDays && ingredientDoc.defaultExpiryDays > 0) {
        finalExpiryDate = addDays(new Date(), ingredientDoc.defaultExpiryDays);
        expirySource = "database";
      } else {
        // Use AI to predict expiry days (only for this lot, don't update ingredient)
        const aiService = new AIService();
        try {
          const predictedDays = await aiService.predictExpiryDays(ingredientDoc.name);
          finalExpiryDate = addDays(new Date(), predictedDays);
          expirySource = "ai";
        } catch (error) {
          console.error("AI prediction failed, using safe default:", error);
          // Fallback to safe default (30 days) if AI fails
          finalExpiryDate = addDays(new Date(), 30);
          expirySource = "default";
        }
      }
    }

    // Create lot
    const lot = await IngredientLot.create({
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
    await ingredientDoc.save();

    res.status(201).json(lot);
  } catch (error) {
    console.error("Error creating ingredient lot:", error);
    res.status(500).json({ error: "Failed to create ingredient lot" });
  }
});

// Delete ingredient lot
app.delete("/api/lots/:id", async (req: Request, res: Response) => {
  try {
    await connectToDB();
    const { id } = req.params;

    const Ingredient = (await import("./lib/models/ingredient.model")).default;
    const IngredientLot = (await import("./lib/models/ingredientLot.model")).default;

    const lot = await IngredientLot.findById(id);
    if (!lot) {
      return res.status(404).json({ error: "Lot not found" });
    }

    // Update ingredient total stock (subtract lot's currentStock)
    const ingredient = await Ingredient.findById(lot.ingredient);
    if (ingredient) {
      ingredient.currentStock = Math.max(0, ingredient.currentStock - lot.currentStock);
      await ingredient.save();
    }

    // Delete lot
    await IngredientLot.findByIdAndDelete(id);

    res.status(200).json({ message: "Lot deleted successfully" });
  } catch (error) {
    console.error("Error deleting ingredient lot:", error);
    res.status(500).json({ error: "Failed to delete ingredient lot" });
  }
});

// Start server
app.listen(port, () => {
  const ip = require("ip").address(); // Import the 'ip' module to get the local IP address
  console.log(`Server is running on http://${ip}:${port}`); // Use the local IP address instead of localhost
});
