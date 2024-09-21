import { uploadToGoogleDrive } from "../googleUtils";
import Category, { CategoryData } from "../models/category.model"; // Import your Category model
import { OAuth2Client } from "google-auth-library"; // Import OAuth2Client

// Function to create a new category
export const createCategory = async (
  categoryData: CategoryData,
  base64Image: string,
  oAuth2Client: OAuth2Client
) => {
  // Upload image to Google Drive
  const imageId = await uploadToGoogleDrive(base64Image, oAuth2Client);

  // Construct the image URL
  const imageUrl = `https://drive.google.com/uc?export=view&id=${imageId}`;

  const newCategory = new Category({ ...categoryData, imageUrl }); // Save the constructed URL
  await newCategory.save();
  return newCategory;
};

// Function to fetch all categories
export const fetchCategories = async () => {
  return await Category.find(); // Return the list of categories
};

// Function to fetch a category by ID
export const fetchCategoryById = async (id: string) => {
  return await Category.findById(id); // Return the category with the given ID
};
