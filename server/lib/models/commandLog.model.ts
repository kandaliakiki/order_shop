import mongoose from "mongoose";
import Counter from "./counter.model";

// Custom function to generate sequential logId with 'LOG-' prefix
async function generateLogId() {
  const counter = await Counter.findByIdAndUpdate(
    { _id: "logId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const seq = counter.seq.toString().padStart(4, "0"); // Ensure 4 digits
  return `LOG-${seq}`; // Prefix with 'LOG-'
}

export interface CommandLogData {
  logId: string; // "LOG-0001"
  messageId: mongoose.Types.ObjectId; // Reference to WhatsAppMessage
  command: string; // "bakesheet", "waste", "expiry", or button_id
  input: string; // Original message/input
  output: string; // AI response or system response
  whatsappNumber: string;
  executedAt: Date;
  aiUsed: boolean;
  tokensUsed?: number; // For cost tracking
}

const commandLogSchema = new mongoose.Schema(
  {
    logId: {
      type: String,
      unique: true,
    },
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WhatsAppMessage",
      required: true,
    },
    command: {
      type: String,
      required: true,
    },
    input: {
      type: String,
      required: true,
    },
    output: {
      type: String,
      required: true,
    },
    whatsappNumber: {
      type: String,
      required: true,
    },
    executedAt: {
      type: Date,
      default: Date.now,
    },
    aiUsed: {
      type: Boolean,
      default: false,
    },
    tokensUsed: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to generate logId before saving
commandLogSchema.pre("save", async function (next) {
  if (!this.logId) {
    this.logId = await generateLogId();
  }
  next();
});

const CommandLog =
  mongoose.models.CommandLog ||
  mongoose.model<CommandLogData>("CommandLog", commandLogSchema);

export default CommandLog;
