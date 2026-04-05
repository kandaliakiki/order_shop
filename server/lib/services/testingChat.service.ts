import { connectToDB } from "../mongoose";
import { Types } from "mongoose";
import ConversationState, {
  ConversationStateData,
} from "../models/conversationState.model";
import { ConversationManager } from "./conversationManager.service";

export interface TestingChatResult {
  success: boolean;
  whatsappResponse: string;
  debugInfo?: {
    currentState: string;
    missingFields: string[];
    products: Array<{ name: string; quantity: number }>;
    collectedData: ConversationStateData["collectedData"];
    conversationHistory: ConversationStateData["conversationHistory"];
    status: ConversationStateData["status"];
    pendingQuestion?: ConversationStateData["pendingQuestion"];
  };
  error?: string;
}

export class TestingChatService {
  private conversationManager: ConversationManager;

  constructor() {
    this.conversationManager = new ConversationManager();
  }

  async processMessage(
    phoneNumber: string,
    message: string,
    includeDebug = false,
  ): Promise<TestingChatResult> {
    try {
      await connectToDB();

      const ts = Date.now();
      const result = await this.conversationManager.processMessage(
        message,
        phoneNumber,
        `test_${ts}`,
        new Types.ObjectId().toString(),
      );

      const response: TestingChatResult = {
        success: result.success,
        whatsappResponse: result.whatsappResponse,
      };

      if (includeDebug) {
        const conversation = await ConversationState.findOne({ phoneNumber });
        if (conversation) {
          response.debugInfo = {
            currentState: this.getCurrentState(conversation),
            missingFields: conversation.missingFields,
            products: conversation.collectedData?.products || [],
            collectedData: conversation.collectedData,
            conversationHistory: conversation.conversationHistory,
            status: conversation.status,
            pendingQuestion: conversation.pendingQuestion,
          };
        }
      }

      return response;
    } catch (error) {
      console.error("Testing chat service error:", error);
      return {
        success: false,
        whatsappResponse:
          "Maaf, terjadi kesalahan saat memproses pesanan.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getConversation(phoneNumber: string) {
    await connectToDB();

    const conversation = await ConversationState.findOne({ phoneNumber });

    if (!conversation) {
      return null;
    }

    return {
      phoneNumber: conversation.phoneNumber,
      status: conversation.status,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      messageCount: conversation.conversationHistory?.length || 0,
      currentState: this.getCurrentState(conversation),
      missingFields: conversation.missingFields,
      products: conversation.collectedData?.products || [],
      conversationHistory: conversation.conversationHistory || [],
      collectedData: conversation.collectedData,
      pendingQuestion: conversation.pendingQuestion,
    };
  }

  async resetConversation(phoneNumber: string) {
    await connectToDB();
    await ConversationState.deleteOne({ phoneNumber });
  }

  private getCurrentState(conversation: ConversationStateData): string {
    const pendingType = conversation.pendingQuestion?.type;

    if (!pendingType) {
      return conversation.collectedData?.products?.length
        ? "collect_field"
        : "collect_products";
    }

    const stateMap: Record<string, string> = {
      missing_field: "collect_field",
      product_clarification: "clarify_products",
      new_or_edit: "new_order_check",
      order_selection: "edit_select_order",
      add_or_change: "edit_collect_changes",
      edit_confirm_items: "edit_confirm_items",
      edit_confirm_delivery: "edit_confirm_delivery",
      edit_change_delivery: "edit_change_delivery",
      confirm_previous_address: "confirm_address",
      confirm_items_done: "confirm_items_done",
    };

    return stateMap[pendingType] || "unknown";
  }
}
