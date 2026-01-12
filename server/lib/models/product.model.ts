import mongoose from "mongoose";
import Counter from "./counter.model"; // Import the counter model

// Custom function to generate sequential productId with 'P-' prefix
async function generateProductId() {
  const counter = await Counter.findByIdAndUpdate(
    { _id: "productId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const seq = counter.seq.toString().padStart(4, "0"); // Ensure 4 digits
  return `P-${seq}`; // Prefix with 'P-'
}

export interface ProductData {
  name: string;
  price: number;
  category: mongoose.Types.ObjectId; // Change category to reference Category schema
  ingredients?: Array<{
    ingredient: mongoose.Types.ObjectId;
    quantity: number;
    unit: string;
  }>;
  // Add any other fields defined in your product schema
}

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    unique: true,
  },
  name: { type: String, required: true, minlength: 3, maxlength: 30 },
  price: { type: Number, required: true, min: 0 },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  }, // Link to Category schema
  imageUrl: { type: String, default: "" },
  ingredients: [
    {
      ingredient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ingredient",
        required: true,
      },
      quantity: { type: Number, required: true, min: 0 },
      unit: { type: String, required: true },
    },
  ],
});

// Middleware to generate productId before saving
productSchema.pre("save", async function (next) {
  if (!this.productId) {
    this.productId = await generateProductId();
  }
  next();
});

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
