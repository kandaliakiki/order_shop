import express, { Request, Response } from "express"; // Ensure Response is imported
import dotenv from "dotenv";
import cors from "cors";
import { connectToDB } from "./lib/mongoose";
import { createProduct, fetchProducts } from "./lib/actions/product.action";
import { ProductData } from "./lib/models/product.model";
import { getOAuth2Client } from "./lib/googleUtils";
import { OAuth2Client } from "google-auth-library"; // Import OAuth2Client

// Specify the path to your .env.local file
dotenv.config({ path: ".env.local" });

const app = express();
const port = process.env.PORT || 8080;

// Increase the limit for JSON body size
app.use(express.json({ limit: "10mb" }));

// Middleware
app.use(express.json());
app.use(cors());

connectToDB();

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
app.get("/products", async (req, res) => {
  try {
    const products = await fetchProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
