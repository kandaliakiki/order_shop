import { connectToDB } from "../mongoose";
import Product from "../models/product.model";
import { ProductData } from "../models/product.model";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library"; // Import OAuth2Client
import {
  deleteImageFromDrive,
  isBase64Image,
  uploadToGoogleDrive,
} from "../utils/googleUtils";
import mongoose from "mongoose"; // Ensure mongoose is imported

// Function to create a product
export const createProduct = async (
  productData: ProductData,
  base64Image: string,
  oAuth2Client: OAuth2Client // Specify the type here
) => {
  // Upload image to Google Drive
  const imageId = await uploadToGoogleDrive(
    base64Image,
    oAuth2Client,
    "product"
  );

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
    const products = await Product.find({}).populate("category", "name"); // Populate category with name
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// Function to delete a product by ID
export const deleteProduct = async (
  id: string,
  oAuth2Client: OAuth2Client // Specify the type here
) => {
  await connectToDB();

  try {
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      throw new Error("Product not found");
    }

    // Delete the image from Google Drive
    if (existingProduct.imageUrl) {
      await deleteImageFromDrive(existingProduct.imageUrl, oAuth2Client); // Ensure oAuth2Client is available
    }

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
    const product = await Product.findById(id).populate("category", "name"); // Populate category with name
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
    const imageId = await uploadToGoogleDrive(
      imageUrl,
      oAuth2Client,
      "product"
    );
    existingProduct.imageUrl = `https://drive.google.com/uc?export=view&id=${imageId}`;
  }

  await existingProduct.save();
  return existingProduct;
};

// Function to fetch products by category ID
export const fetchProductsByCategoryId = async (categoryId: string) => {
  await connectToDB();

  try {
    const products = await Product.find({ category: categoryId }).populate(
      "category",
      "name"
    ); // Populate category with name
    return products;
  } catch (error) {
    console.error("Error fetching products by category ID:", error);
    throw error;
  }
};

// Function to count products by category ID
export const countProductsByCategoryId = async (categoryId: string) => {
  await connectToDB();

  try {
    if (!categoryId) {
      throw new Error("Category ID must not be empty");
    }
    const query = { category: categoryId };
    const productCount = await Product.countDocuments(query); // Count documents based on the query
    return productCount;
  } catch (error) {
    console.error("Error counting products by category ID:", error);
    throw error;
  }
};

// Function to count all products
export const countAllProducts = async () => {
  await connectToDB();

  try {
    const productCount = await Product.countDocuments({}); // Count all documents
    return productCount;
  } catch (error) {
    console.error("Error counting all products:", error);
    throw error;
  }
};

// Function to delete multiple products by IDs
export const deleteMultipleProducts = async (
  ids: string[],
  oAuth2Client: OAuth2Client // Specify the type here
) => {
  await connectToDB();

  try {
    const deletePromises = ids.map(async (id) => {
      const existingProduct = await Product.findById(id);
      if (!existingProduct) {
        throw new Error(`Product with ID ${id} not found`);
      }

      // Delete the image from Google Drive
      if (existingProduct.imageUrl) {
        await deleteImageFromDrive(existingProduct.imageUrl, oAuth2Client);
      }

      await Product.findByIdAndDelete(id);
    });

    await Promise.all(deletePromises);
    return { message: "Products deleted successfully" };
  } catch (error) {
    console.error("Error deleting multiple products:", error);
    throw error;
  }
};

export const filterProductsByParams = async (
  textToSearch: string,
  categoryId?: string,
  maxPrice?: number
) => {
  await connectToDB();

  try {
    const regex = new RegExp(`.*${textToSearch}.*`, "i");
    const matchConditions: any = {};

    // Add text search condition
    if (textToSearch) {
      matchConditions.$or = [
        { name: { $regex: regex } },
        { "categoryDetails.name": { $regex: regex } },
      ];
    }

    // Add categoryId condition if provided
    if (categoryId) {
      matchConditions["categoryDetails._id"] = new mongoose.Types.ObjectId(
        categoryId
      );
    }

    // Add maxPrice condition if provided and greater than 0
    if (maxPrice && maxPrice > 0) {
      matchConditions.price = { $lte: maxPrice };
    }

    const products = await Product.aggregate([
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
  } catch (error) {
    console.error("Error filtering products:", error);
    throw error;
  }
};
