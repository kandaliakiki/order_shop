import { connectToDB } from "../mongoose";
import Ingredient from "../models/ingredient.model";
import { IngredientData } from "../models/ingredient.model";
import { OAuth2Client } from "google-auth-library";
import {
  deleteImageFromDrive,
  isBase64Image,
  uploadToGoogleDrive,
} from "../utils/googleUtils";

// Function to create an ingredient
export const createIngredient = async (
  ingredientData: IngredientData,
  base64Image: string,
  oAuth2Client: OAuth2Client
) => {
  await connectToDB();

  let imageUrl = "";

  // Upload image to Google Drive if provided
  if (base64Image && isBase64Image(base64Image)) {
    const imageId = await uploadToGoogleDrive(
      base64Image,
      oAuth2Client,
      "ingredient"
    );
    imageUrl = `https://drive.google.com/uc?export=view&id=${imageId}`;
  }

  const newIngredient = new Ingredient({ ...ingredientData, imageUrl });
  await newIngredient.save();
  return newIngredient;
};

// Function to fetch all ingredients
export const fetchIngredients = async () => {
  await connectToDB();

  try {
    const ingredients = await Ingredient.find({}).sort({ name: 1 }); // Sort by name
    return ingredients;
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    throw error;
  }
};

// Function to fetch an ingredient by ID
export const fetchIngredientById = async (id: string) => {
  await connectToDB();

  try {
    const ingredient = await Ingredient.findById(id);
    if (!ingredient) {
      throw new Error("Ingredient not found");
    }
    return ingredient;
  } catch (error) {
    console.error("Error fetching ingredient by ID:", error);
    throw error;
  }
};

// Function to update an ingredient
export const updateIngredient = async (
  id: string,
  ingredientData: IngredientData,
  imageUrl: string,
  oAuth2Client: OAuth2Client
) => {
  await connectToDB();

  try {
    const existingIngredient = await Ingredient.findById(id);
    if (!existingIngredient) {
      throw new Error("Ingredient not found");
    }

    // Save the old imageUrl
    const oldImageUrl = existingIngredient.imageUrl || "";

    // Update ingredient fields
    existingIngredient.set({ ...ingredientData });

    // Check if user uploaded new image
    const isUserUploadNewImage = isBase64Image(imageUrl);

    // Delete old image and upload new image only if user upload new image
    if (oldImageUrl && isUserUploadNewImage) {
      await deleteImageFromDrive(oldImageUrl, oAuth2Client);
      // Upload the new image and update the imageUrl
      const imageId = await uploadToGoogleDrive(
        imageUrl,
        oAuth2Client,
        "ingredient"
      );
      existingIngredient.imageUrl = `https://drive.google.com/uc?export=view&id=${imageId}`;
    } else if (isUserUploadNewImage) {
      // New image upload (no old image)
      const imageId = await uploadToGoogleDrive(
        imageUrl,
        oAuth2Client,
        "ingredient"
      );
      existingIngredient.imageUrl = `https://drive.google.com/uc?export=view&id=${imageId}`;
    }

    await existingIngredient.save();
    return existingIngredient;
  } catch (error) {
    console.error("Error updating ingredient:", error);
    throw error;
  }
};

// Function to delete an ingredient by ID
export const deleteIngredient = async (
  id: string,
  oAuth2Client: OAuth2Client
) => {
  await connectToDB();

  try {
    const existingIngredient = await Ingredient.findById(id);
    if (!existingIngredient) {
      throw new Error("Ingredient not found");
    }

    // Delete the image from Google Drive if exists
    if (existingIngredient.imageUrl) {
      await deleteImageFromDrive(
        existingIngredient.imageUrl,
        oAuth2Client
      );
    }

    const result = await Ingredient.findByIdAndDelete(id);
    if (!result) {
      throw new Error("Ingredient not found");
    }
  } catch (error) {
    console.error("Error deleting ingredient:", error);
    throw error;
  }
};

// Function to count all ingredients
export const countAllIngredients = async () => {
  await connectToDB();

  try {
    const ingredientCount = await Ingredient.countDocuments({});
    return ingredientCount;
  } catch (error) {
    console.error("Error counting ingredients:", error);
    throw error;
  }
};

