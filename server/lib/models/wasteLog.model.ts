import mongoose from "mongoose";
import Counter from "./counter.model";

// Custom function to generate sequential wasteId with 'WASTE-' prefix
async function generateWasteId() {
  const counter = await Counter.findByIdAndUpdate(
    { _id: "wasteId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const seq = counter.seq.toString().padStart(4, "0"); // Ensure 4 digits
  return `WASTE-${seq}`; // Prefix with 'WASTE-'
}

export interface WasteLogData {
  wasteId: string; // "WASTE-0001"
  itemName: string; // Product or ingredient name
  quantity: number;
  unit: string;
  reason: string; // "burnt", "expired", "damaged", etc.
  loggedBy: string; // WhatsApp number or user ID
  loggedAt: Date;
  cost?: number; // Estimated cost of waste
}

const wasteLogSchema = new mongoose.Schema(
  {
    wasteId: {
      type: String,
      unique: true,
    },
    itemName: {
      type: String,
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
    reason: {
      type: String,
      required: true,
    },
    loggedBy: {
      type: String,
      required: true,
    },
    loggedAt: {
      type: Date,
      default: Date.now,
    },
    cost: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to generate wasteId before saving
wasteLogSchema.pre("save", async function (next) {
  if (!this.wasteId) {
    this.wasteId = await generateWasteId();
  }
  next();
});

const WasteLog =
  mongoose.models.WasteLog ||
  mongoose.model<WasteLogData>("WasteLog", wasteLogSchema);

export default WasteLog;
