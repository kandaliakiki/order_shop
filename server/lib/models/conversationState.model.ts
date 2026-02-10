import mongoose from "mongoose";

export interface ConversationStateData {
  phoneNumber: string; // WhatsApp phone number (unique identifier)
  status: "collecting" | "completed" | "cancelled";
  collectedData: {
    products?: Array<{
      name: string;
      quantity: number;
      confidence: number;
    }>;
    deliveryDate?: string; // YYYY-MM-DD
    deliveryAddress?: string;
    /**
     * pickup vs delivery choice:
     * - "pickup": customer will collect at the shop
     * - "delivery": order will be delivered to an address
     */
    fulfillmentType?: "pickup" | "delivery";
    /**
     * Time of pickup or delivery, free‑form string in Indonesian, e.g. "jam 3 sore"
     */
    pickupTime?: string;
    customerName?: string;
  };
  missingFields: Array<
    | "products"
    | "quantities"
    | "deliveryDate"
    | "deliveryAddress"
    | "fulfillmentType"
    | "pickupTime"
  >;
  pendingQuestion?: {
    type: "missing_field" | "product_clarification";
    field?: string;
    similarProducts?: Array<{ name: string; price: number }>;
    questionText?: string;
  };
  conversationHistory: Array<{
    role: "user" | "assistant";
    message: string;
    timestamp: Date;
  }>;
  lastMessageId?: string; // Link to last WhatsApp message
  orderId?: string; // Business order ID like "O-0499" (if order created)
}

const conversationStateSchema = new mongoose.Schema<ConversationStateData>(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["collecting", "completed", "cancelled"],
      default: "collecting",
    },
    collectedData: {
      type: {
        products: [
          {
            name: String,
            quantity: Number,
            confidence: Number,
          },
        ],
        deliveryDate: String,
        deliveryAddress: String,
        fulfillmentType: String,
        pickupTime: String,
        customerName: String,
      },
      default: {},
    },
    missingFields: {
      type: [String],
      default: [
        "products",
        "quantities",
        "deliveryDate",
        "fulfillmentType",
        "deliveryAddress",
        "pickupTime",
      ],
    },
    pendingQuestion: {
      type: {
        type: String,
        enum: ["missing_field", "product_clarification"],
        field: String,
        similarProducts: [
          {
            name: String,
            price: Number,
          },
        ],
        questionText: String,
      },
    },
    conversationHistory: [
      {
        role: {
          type: String,
          enum: ["user", "assistant"],
        },
        message: String,
        timestamp: Date,
      },
    ],
    lastMessageId: String,
    orderId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding active conversations
conversationStateSchema.index({ phoneNumber: 1, status: 1 });

const ConversationState =
  mongoose.models.ConversationState ||
  mongoose.model<ConversationStateData>("ConversationState", conversationStateSchema);

export default ConversationState;
