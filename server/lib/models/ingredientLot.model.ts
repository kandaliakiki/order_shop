import mongoose from "mongoose";
import Counter from "./counter.model";

// Custom function to generate sequential lotId with 'LOT-' prefix
async function generateLotId() {
  const counter = await Counter.findByIdAndUpdate(
    { _id: "lotId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const seq = counter.seq.toString().padStart(4, "0"); // Ensure 4 digits
  return `LOT-${seq}`; // Prefix with 'LOT-'
}

export interface IngredientLotData {
  lotId: string; // Auto-generated: "LOT-0001"
  ingredient: mongoose.Types.ObjectId; // Reference to Ingredient
  quantity: number;
  unit: string;
  expiryDate: Date;
  purchaseDate?: Date;
  supplier?: string;
  cost?: number;
  currentStock: number; // Remaining quantity in this lot
  expirySource?: "user" | "database" | "ai" | "default"; // Track how expiry was determined
}

const ingredientLotSchema = new mongoose.Schema(
  {
    lotId: {
      type: String,
      unique: true,
    },
    ingredient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ingredient",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    purchaseDate: {
      type: Date,
    },
    supplier: {
      type: String,
    },
    cost: {
      type: Number,
      min: 0,
    },
    currentStock: {
      type: Number,
      required: true,
      min: 0,
    },
    expirySource: {
      type: String,
      enum: ["user", "database", "ai", "default"],
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to generate lotId before saving
ingredientLotSchema.pre("save", async function (next) {
  if (!this.lotId) {
    this.lotId = await generateLotId();
  }
  next();
});

const IngredientLot =
  mongoose.models.IngredientLot ||
  mongoose.model<IngredientLotData>("IngredientLot", ingredientLotSchema);

export default IngredientLot;
