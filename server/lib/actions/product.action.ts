import { connectToDB } from "../mongoose";
import Product from "../models/product.model";
import { ProductData } from "../models/product.model";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library"; // Import OAuth2Client
import { uploadToGoogleDrive } from "../googleUtils";

// Function to create a product
export const createProduct = async (
  productData: ProductData,
  base64Image: string,
  oAuth2Client: OAuth2Client // Specify the type here
) => {
  // Upload image to Google Drive
  const imageId = await uploadToGoogleDrive(base64Image, oAuth2Client);

  // Construct the image URL
  const imageUrl = `https://drive.google.com/uc?export=view&id=${imageId}`;

  const newProduct = new Product({ ...productData, imageUrl }); // Save the constructed URL
  await newProduct.save();
  return newProduct;
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
