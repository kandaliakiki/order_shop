import { connectToDB } from "../mongoose";
import Product from "../models/product.model";
import { ProductData } from "../models/product.model";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library"; // Import OAuth2Client
import {
  deleteImageFromDrive,
  isBase64Image,
  uploadToGoogleDrive,
} from "../googleUtils";

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

// Function to delete a product by ID
export const deleteProduct = async (id: string) => {
  await connectToDB();

  try {
    const result = await Product.findByIdAndDelete(id);
    if (!result) {
      throw new Error("Product not found");
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// Function to fetch a product by ID
export const fetchProductById = async (id: string) => {
  await connectToDB();

  try {
    const product = await Product.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw error;
  }
};

// Function to update a product
export const updateProduct = async (
  id: string,
  productData: ProductData,
  imageUrl: string,
  oAuth2Client: OAuth2Client // Specify the type here
) => {
  const existingProduct = await Product.findById(id);
  if (!existingProduct) {
    throw new Error("Product not found");
  }

  // Save the old imageUrl
  const oldImageUrl = existingProduct.imageUrl;

  // Update product fields
  existingProduct.set({ ...productData });

  // is base 65 then user upload new image
  const isUserUploadNewImage = isBase64Image(imageUrl);

  // delete old image and upload new image only if user upload new image else do nothing with image
  if (oldImageUrl && isUserUploadNewImage) {
    await deleteImageFromDrive(oldImageUrl, oAuth2Client); // Call the delete function
    // Upload the new image and update the imageUrl
    const imageId = await uploadToGoogleDrive(imageUrl, oAuth2Client);
    existingProduct.imageUrl = `https://drive.google.com/uc?export=view&id=${imageId}`;
  }

  await existingProduct.save();
  return existingProduct;
};
