import { connectToDB } from "../mongoose";
import Product from "../models/product.model";
import { ProductData } from "../models/product.model";

// Function to create a product
export const createProduct = async (productData: ProductData) => {
  await connectToDB();

  try {
    const newProduct = new Product(productData);
    await newProduct.save();
    console.log("Product created successfully");
    return newProduct;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

// Function to fetch all products
export const fetchProducts = async () => {
  await connectToDB();

  try {
    const products = await Product.find({});
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};
