import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { connectToDB } from "./lib/mongoose";
import { createProduct, fetchProducts } from "./lib/actions/product.action";
import { ProductData } from "./lib/models/product.model";

// Specify the path to your .env.local file
dotenv.config({ path: ".env.local" });

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(cors());

connectToDB();

// Endpoint to add a new product
app.post("/products/add", async (req, res) => {
  try {
    const productData: ProductData = req.body;
    const newProduct = await createProduct(productData);
    res.status(201).json(newProduct);
  } catch (error) {
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
