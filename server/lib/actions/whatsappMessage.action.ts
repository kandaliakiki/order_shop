import { connectToDB } from "../mongoose";
import WhatsAppMessage, {
  WhatsAppMessageData,
} from "../models/whatsappMessage.model";

// Create a new WhatsApp message
export const createWhatsAppMessage = async (
  messageData: Omit<WhatsAppMessageData, "createdAt">
) => {
  await connectToDB();

  try {
    const message = new WhatsAppMessage(messageData);
    await message.save();
    return message;
  } catch (error) {
    console.error("Error creating WhatsApp message:", error);
    throw error;
  }
};

// Fetch all WhatsApp messages
export const fetchWhatsAppMessages = async () => {
  await connectToDB();

  try {
    const messages = await WhatsAppMessage.find({})
      .populate("orderId")
      .sort({ createdAt: -1 });
    return messages;
  } catch (error) {
    console.error("Error fetching WhatsApp messages:", error);
    throw error;
  }
};

// Fetch message by ID
export const fetchWhatsAppMessageById = async (id: string) => {
  await connectToDB();

  try {
    const message = await WhatsAppMessage.findById(id).populate("orderId");
    if (!message) {
      throw new Error("Message not found");
    }
    return message;
  } catch (error) {
    console.error("Error fetching WhatsApp message by ID:", error);
    throw error;
  }
};

// Fetch messages by order ID
export const fetchWhatsAppMessagesByOrderId = async (orderId: string) => {
  await connectToDB();

  try {
    const messages = await WhatsAppMessage.find({ orderId }).sort({
      createdAt: -1,
    });
    return messages;
  } catch (error) {
    console.error("Error fetching messages by order ID:", error);
    throw error;
  }
};

// Update message analysis result
export const updateMessageAnalysis = async (
  messageId: string,
  analysisResult: {
    extractedData?: any;
    confidence?: number;
    error?: string;
  }
) => {
  await connectToDB();

  try {
    const message = await WhatsAppMessage.findOneAndUpdate(
      { messageId },
      {
        analyzed: true,
        analysisResult,
      },
      { new: true }
    );
    return message;
  } catch (error) {
    console.error("Error updating message analysis:", error);
    throw error;
  }
};

// Link message to order
export const linkMessageToOrder = async (
  messageId: string,
  orderId: string
) => {
  await connectToDB();

  try {
    const message = await WhatsAppMessage.findOneAndUpdate(
      { messageId },
      { orderId },
      { new: true }
    );
    return message;
  } catch (error) {
    console.error("Error linking message to order:", error);
    throw error;
  }
};

