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
  fetchOverallRevenue,
  searchOrdersByCustomerName,
  updateOrderStatus,
} from "./lib/actions/order.action"; // Import the function
import { OrderData } from "./lib/models/order.model";
import { seedOrders } from "./lib/utils/seedOrdersUtils";

// Specify the path to your .env.local file
dotenv.config({ path: ".env.local" });

const app = express();
const port = process.env.PORT || 8080;

// Increase the limit for JSON body size
app.use(express.json({ limit: "10mb" }));

// Middleware
app.use(express.json());
app.use(cors());

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
  const { name, price, category, imageUrl } = req.body;

  if (!name || !price || !category || !imageUrl) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const productData: ProductData = { name, price, category };
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
  const { name, price, category, imageUrl } = req.body; // Get product data from the request body

  if (!name || !price || !category || !imageUrl) {
    // Validate required fields including imageUrl
    return res
      .status(400)
      .json({ error: "Name, price, category, and imageUrl are required" });
  }

  try {
    const productData: ProductData = { name, price, category };
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

// Start server
app.listen(port, () => {
  const ip = require("ip").address(); // Import the 'ip' module to get the local IP address
  console.log(`Server is running on http://${ip}:${port}`); // Use the local IP address instead of localhost
});
