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
    /** When editing: product names to remove (from AI). */
    productsToRemove?: string[];
  };
  missingFields: Array<
    | "products"
    | "quantities"
    | "deliveryDate"
    | "deliveryAddress"
    | "fulfillmentType"
    | "pickupTime"
  >;
  /** When user has existing orders: do they want a new order or to edit one? */
  orderIntent?: "new_order" | "edit_order";
  /** When editing: which order (orderId e.g. "O-0501"). */
  selectedOrderId?: string;
  /** When editing: add items to order or change/remove items. */
  editMode?: "add_items" | "change_items";

  pendingQuestion?: {
    type: "missing_field" | "product_clarification" | "new_or_edit" | "order_selection" | "add_or_change" | "edit_follow_up" | "edit_change_delivery" | "edit_confirm_items" | "edit_confirm_delivery";
    field?: string;
    similarProducts?: Array<{ name: string; price: number }>;
    questionText?: string;
    /** For order_selection: list of { orderId, summary } so we can parse "O-0501" or "first one". */
    orderList?: Array<{ orderId: string; summary: string }>;
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
        productsToRemove: [String],
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
        enum: ["missing_field", "product_clarification", "new_or_edit", "order_selection", "add_or_change", "edit_follow_up", "edit_change_delivery", "edit_confirm_items", "edit_confirm_delivery"],
        field: String,
        similarProducts: [{ name: String, price: Number }],
        questionText: String,
        orderList: [{ orderId: String, summary: String }],
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
    orderId: { type: String },
    orderIntent: { type: String, enum: ["new_order", "edit_order"] },
    selectedOrderId: { type: String },
    editMode: { type: String, enum: ["add_items", "change_items"] },
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
