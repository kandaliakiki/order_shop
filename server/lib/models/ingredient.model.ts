import mongoose from "mongoose";
import Counter from "./counter.model"; // Import the counter model

// Custom function to generate sequential ingredientId with 'I-' prefix
async function generateIngredientId() {
  const counter = await Counter.findByIdAndUpdate(
    { _id: "ingredientId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const seq = counter.seq.toString().padStart(4, "0"); // Ensure 4 digits
  return `I-${seq}`; // Prefix with 'I-'
}

export interface IngredientData {
  name: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  reservedStock?: number; // Stock reserved for future orders (not yet deducted)
  defaultExpiryDays?: number;
  imageUrl?: string;
}

const ingredientSchema = new mongoose.Schema(
  {
    ingredientId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 50,
    },
    unit: {
      type: String,
      required: true,
    },
    currentStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    minimumStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    reservedStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    defaultExpiryDays: {
      type: Number,
      min: 1,
    },
    imageUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

// Middleware to generate ingredientId before saving
ingredientSchema.pre("save", async function (next) {
  if (!this.ingredientId) {
    this.ingredientId = await generateIngredientId();
  }
  next();
});

const Ingredient =
  mongoose.models.Ingredient ||
  mongoose.model("Ingredient", ingredientSchema);

export default Ingredient;

