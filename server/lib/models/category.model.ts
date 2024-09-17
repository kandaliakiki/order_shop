import mongoose, { Schema, Document } from "mongoose";

export interface CategoryData {
  name: string; // Category name
}

const CategorySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // Ensure category names are unique
    },
    imageUrl: {
      type: String,
      required: true, // Ensure image URL is provided
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

const Category =
  mongoose.models.Category || mongoose.model("Category", CategorySchema);

export default Category;
