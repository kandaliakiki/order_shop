import mongoose from "mongoose";
import Counter from "./counter.model"; // Import the counter model

// Define the interface for an item in the order
interface Item {
  name: string;
  quantity: number;
  price: number;
}

// Define the interface for an order
export interface OrderData {
  orderId?: string; // Make it optional since it's generated
  customerName: string;
  phoneNumber: string;
  items: Item[];
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  createdAt: Date;
  source?: string; // "manual" or "whatsapp"
  whatsappNumber?: string;
  whatsappMessageId?: mongoose.Types.ObjectId;
  aiAnalysisMetadata?: {
    confidence?: number;
    extractionMethod?: string;
    rawAnalysis?: any;
  };
  stockCalculationMetadata?: {
    calculatedAt: Date;
    allIngredientsSufficient: boolean;
    requirements: Array<{
      ingredientId: string;
      ingredientName: string;
      unit: string;
      requiredQuantity: number;
      stockAtTimeOfOrder: number;
      wasSufficient: boolean;
    }>;
    warnings: string[];
  };
}

// Custom function to generate sequential orderId with 'O-' prefix
async function generateOrderId() {
  const counter = await Counter.findByIdAndUpdate(
    { _id: "orderId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const seq = counter.seq.toString().padStart(4, "0"); // Ensure 4 digits
  return `O-${seq}`; // Prefix with 'O-'
}

// Define the schema for an item in the order
const itemSchema = new mongoose.Schema<Item>({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

// Define the schema for an order
const orderSchema = new mongoose.Schema<OrderData>({
  orderId: {
    type: String,
    unique: true,
  },
  customerName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  items: { type: [itemSchema], required: true },
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  status: {
    type: String,
    default: "New Order",
    enum: ["New Order", "Pending", "On Process", "Completed", "Cancelled"],
  },
  createdAt: { type: Date, default: Date.now },
  source: {
    type: String,
    default: "manual",
    enum: ["manual", "whatsapp"],
  },
  whatsappNumber: {
    type: String,
  },
  whatsappMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WhatsAppMessage",
  },
  aiAnalysisMetadata: {
    type: {
      confidence: Number,
      extractionMethod: String,
      rawAnalysis: mongoose.Schema.Types.Mixed,
    },
  },
  stockCalculationMetadata: {
    type: {
      calculatedAt: Date,
      allIngredientsSufficient: Boolean,
      requirements: [
        {
          ingredientId: String,
          ingredientName: String,
          unit: String,
          requiredQuantity: Number,
          stockAtTimeOfOrder: Number,
          wasSufficient: Boolean,
        },
      ],
      warnings: [String],
    },
  },
});

// Middleware to generate orderId before saving
orderSchema.pre("save", async function (next) {
  if (!this.orderId) {
    this.orderId = await generateOrderId();
  }
  next();
});

const Order = mongoose.model<OrderData>("Order", orderSchema);

export default Order;
