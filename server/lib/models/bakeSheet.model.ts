import mongoose from "mongoose";

export interface BakeSheetData {
  sheetId: string; // "BAKE-2024-01-15" or "BAKE-2024-01-15_to_2024-01-17"
  date: string; // YYYY-MM-DD (single) or "YYYY-MM-DD_to_YYYY-MM-DD" (range)
  dateRange?: {
    start: string; // YYYY-MM-DD
    end: string; // YYYY-MM-DD
  };
  items: Array<{
    productId: mongoose.Types.ObjectId;
    productName: string;
    quantity: number;
  }>;
  ingredientRequirements?: Array<{
    ingredientId: string;
    quantity: number;
    unit: string;
  }>;
  stockChecks?: Array<{
    name: string;
    needed: number;
    available: number;
    unit: string;
    sufficient: boolean;
  }>;
  source: 'whatsapp' | 'manual';
  whatsappNumber?: string;
  status: 'draft' | 'confirmed' | 'completed';
  createdAt: Date;
}

const bakeSheetSchema = new mongoose.Schema(
  {
    sheetId: {
      type: String,
      unique: true,
    },
    date: {
      type: String,
      required: true,
    },
    dateRange: {
      start: String,
      end: String,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productName: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    ingredientRequirements: [
      {
        ingredientId: String,
        quantity: Number,
        unit: String,
      },
    ],
    stockChecks: [
      {
        name: String,
        needed: Number,
        available: Number,
        unit: String,
        sufficient: Boolean,
      },
    ],
    source: {
      type: String,
      enum: ['whatsapp', 'manual'],
      default: 'whatsapp',
    },
    whatsappNumber: {
      type: String,
    },
    status: {
      type: String,
      enum: ['draft', 'confirmed', 'completed'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

// Generate sheetId before saving
bakeSheetSchema.pre("save", async function (next) {
  if (!this.sheetId) {
    this.sheetId = `BAKE-${this.date}`;
  }
  next();
});

const BakeSheet =
  mongoose.models.BakeSheet ||
  mongoose.model<BakeSheetData>("BakeSheet", bakeSheetSchema);

export default BakeSheet;
