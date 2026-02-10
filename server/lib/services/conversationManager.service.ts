import { connectToDB } from "../mongoose";
import ConversationState, { ConversationStateData } from "../models/conversationState.model";
import { AIService, ConversationAnalysisResult } from "./ai.service";
import { ProductSimilarityService } from "./productSimilarity.service";
import { fetchProducts } from "../actions/product.action";
import { processWhatsAppMessageForOrder } from "../actions/whatsappOrderProcessing.action";
import { ExtractedOrderData } from "./ai.service";

export interface ProcessConversationResult {
  success: boolean;
  whatsappResponse: string;
  orderId?: string;
  shouldCreateOrder: boolean;
  error?: string;
}

export class ConversationManager {
  private aiService: AIService;
  private similarityService: ProductSimilarityService;

  constructor() {
    this.aiService = new AIService();
    this.similarityService = new ProductSimilarityService();
  }

  /**
   * Process incoming WhatsApp message in conversational context
   */
  async processMessage(
    messageBody: string,
    phoneNumber: string,
    twilioMessageId: string,
    whatsappMessageMongoId: string
  ): Promise<ProcessConversationResult> {
    await connectToDB();

    try {
      // 1. Get or create conversation state (one per phone number, reused)
      let state = await ConversationState.findOne({ phoneNumber });

      if (!state) {
        // First time this customer is ordering – create fresh state
        state = await ConversationState.create({
          phoneNumber,
          status: "collecting",
          collectedData: {},
          missingFields: [
            "products",
            "quantities",
            "deliveryDate",
            "fulfillmentType",
            "deliveryAddress",
            "pickupTime",
          ],
          conversationHistory: [],
        });
      } else if (state.status !== "collecting") {
        // Previous conversation was completed/cancelled – hard reset for a new order
        state.status = "collecting";
        state.collectedData = {};
        state.missingFields = [
          "products",
          "quantities",
          "deliveryDate",
          "fulfillmentType",
          "deliveryAddress",
          "pickupTime",
        ];
        state.pendingQuestion = undefined;
        state.conversationHistory = [];
        state.lastMessageId = undefined;
        state.orderId = undefined;
        await state.save();
      }

      // 2. Add user message to history
      state.conversationHistory.push({
        role: "user",
        message: messageBody,
        timestamp: new Date(),
      });

      // 3. Get available products
      const availableProducts = await fetchProducts();
      const productsForAI = availableProducts.map((p) => ({
        name: p.name,
        price: p.price,
      }));

      // 3b. If user is replying after the "list all possibilities" clarification, resolve each phrase ourselves (exact names OK, ambiguous terms get one more clarification)
      const normalize = (s: string) =>
        s
          .toLowerCase()
          .trim()
          .replace(/\s+/g, " ");
      const filterByMention = (mention: string, products: any[]) => {
        const m = normalize(mention);
        return products.filter((p) => p.name.toLowerCase().includes(m));
      };

      if (state.pendingQuestion?.type === "product_clarification") {
        const items = await this.aiService.extractProductPhrasesWithQuantities(messageBody);
        const stillAmbiguous: Array<{ phrase: string; quantity: number; options: any[] }> = [];
        if (!state.collectedData.products) state.collectedData.products = [];

        for (const item of items) {
          const phrase = item.phrase.trim();
          if (!phrase) continue;
          const exactMatch = productsForAI.find(
            (p) => normalize(p.name) === normalize(phrase)
          );
          if (exactMatch) {
            const existing = state.collectedData.products.find(
              (p: { name: string }) => p.name === exactMatch.name
            );
            if (existing) (existing as any).quantity = item.quantity;
            else state.collectedData.products.push({ name: exactMatch.name, quantity: item.quantity, confidence: 1 });
            continue;
          }
          const similar = this.similarityService.findSimilarProducts(
            phrase,
            productsForAI,
            0.3
          );
          const filtered = filterByMention(phrase, similar);
          const toShow = filtered.length >= 2 ? filtered : similar;
          if (toShow.length >= 2) {
            stillAmbiguous.push({ phrase, quantity: item.quantity, options: toShow });
          } else if (toShow.length === 1) {
            const existing = state.collectedData.products.find(
              (p: { name: string }) => p.name === toShow[0].name
            );
            if (existing) (existing as any).quantity = item.quantity;
            else state.collectedData.products.push({ name: toShow[0].name, quantity: item.quantity, confidence: 1 });
          }
        }

        if (stillAmbiguous.length > 0) {
          const lines: string[] = [];
          lines.push(
            "Saya melihat beberapa kata yang bisa berarti beberapa produk berbeda. Berikut daftar kemungkinan produknya:"
          );

          // Tampilkan juga produk yang sudah pasti supaya konteks pesanan jelas
          if (state.collectedData.products && state.collectedData.products.length > 0) {
            lines.push("\nSaat ini pesanan yang sudah kami catat:");
            for (const p of state.collectedData.products as any[]) {
              const qty =
                typeof (p as any).quantity === "number" && (p as any).quantity > 0
                  ? ` ${(p as any).quantity} pcs`
                  : "";
              lines.push(`- ${p.name}${qty}`);
            }
          }

          for (const a of stillAmbiguous) {
            lines.push(`\nUntuk "${a.phrase}":`);
            for (const p of a.options) {
              lines.push(`- ${p.name} - Rp ${p.price.toLocaleString("id-ID")}`);
            }
          }
          lines.push(
            "\nMohon sebutkan nama lengkap dari daftar di atas untuk kata-kata tersebut (dan jumlahnya).\n" +
              'Contoh: "Chocolate Chip Cookie 2 pcs, pain au chocolate 1 pcs".'
          );
          const combinedQuestion = lines.join("\n");
          state.pendingQuestion = { type: "product_clarification", questionText: combinedQuestion };
          state.conversationHistory.push({
            role: "assistant",
            message: combinedQuestion,
            timestamp: new Date(),
          });
          state.lastMessageId = twilioMessageId;
          await state.save();
          return {
            success: true,
            whatsappResponse: combinedQuestion,
            shouldCreateOrder: false,
          };
        }

        state.pendingQuestion = undefined;
        const completeness = this.checkCompleteness(state);
        const confirmedSummary =
          state.collectedData.products && state.collectedData.products.length > 0
            ? state.collectedData.products
                .map((p: { name: string; quantity: number }) => `${p.name} ${p.quantity} pcs`)
                .join(", ")
            : "";
        const prefix = confirmedSummary
          ? `Baik, jadi ${confirmedSummary} ya.\n\n`
          : "";

        if (!completeness.isComplete) {
          const question = this.generateFollowUpQuestion(
            completeness.missingFields[0],
            state,
            undefined
          );
          const fullMessage = prefix + question;
          state.pendingQuestion = {
            type: "missing_field",
            field: completeness.missingFields[0],
            questionText: fullMessage,
          };
          state.missingFields = completeness.missingFields;
          state.conversationHistory.push({
            role: "assistant",
            message: fullMessage,
            timestamp: new Date(),
          });
          state.lastMessageId = twilioMessageId;
          await state.save();
          return {
            success: true,
            whatsappResponse: fullMessage,
            shouldCreateOrder: false,
          };
        }

        const orderMessage = this.buildOrderMessageFromCollectedData(state.collectedData);
        const collectedForOrder = {
          products: (state.collectedData.products || []).map((p: { name: string; quantity: number }) => ({
            name: p.name,
            quantity: p.quantity,
          })),
          deliveryDate: state.collectedData.deliveryDate,
          deliveryAddress: state.collectedData.deliveryAddress,
          fulfillmentType: state.collectedData.fulfillmentType,
          pickupTime: state.collectedData.pickupTime,
        };
        const orderResult = await processWhatsAppMessageForOrder(
          orderMessage,
          phoneNumber,
          whatsappMessageMongoId,
          twilioMessageId,
          true,
          collectedForOrder
        );
        if (orderResult.success && orderResult.orderId) {
          state.status = "completed";
          state.lastMessageId = twilioMessageId;
          state.orderId = orderResult.orderId;
          await state.save();
          return {
            success: true,
            whatsappResponse: orderResult.whatsappResponse || "✅ Pesanan Anda telah diterima!",
            orderId: orderResult.orderId,
            shouldCreateOrder: true,
          };
        } else {
          state.status = "collecting";
          await state.save();
          return {
            success: false,
            whatsappResponse: orderResult.whatsappResponse || "❌ Maaf, terjadi kesalahan. Silakan coba lagi.",
            shouldCreateOrder: false,
            error: orderResult.error,
          };
        }
      }

      // 4. Analyze message with context
      const analysis = await this.aiService.analyzeWithContext(
        messageBody,
        productsForAI,
        state.conversationHistory.map((h: { role: string; message: string }) => ({
          role: h.role,
          message: h.message,
        })),
        {
          collectedData: state.collectedData,
          missingFields: state.missingFields,
        }
      );

      // 4b. Let AI decide if the user wants to reset / start over
      if (analysis.intent === "reset") {
        state.collectedData = {};
        state.missingFields = [
          "products",
          "quantities",
          "deliveryDate",
          "fulfillmentType",
          "deliveryAddress",
          "pickupTime",
        ];
        state.pendingQuestion = undefined;
        state.status = "collecting";
        state.orderId = undefined;
        // Clear history so old orders are not re-used in context
        state.conversationHistory = [];

        const resetMessage =
          "Baik, semua pesanan sebelumnya sudah saya hapus. Jadi, mau pesan apa saja kali ini? Berapa banyak untuk masing-masing kue, dan kapan mau dikirim?";
        state.conversationHistory.push({
          role: "assistant",
          message: resetMessage,
          timestamp: new Date(),
        });
        state.lastMessageId = twilioMessageId;
        await state.save();
        return {
          success: true,
          whatsappResponse: resetMessage,
          shouldCreateOrder: false,
        };
      }

      // 5. Check for ambiguous products FIRST (before updating collected data)
      if (analysis.ambiguousProducts && analysis.ambiguousProducts.length > 0) {
        const ambiguousList = analysis.ambiguousProducts;

        // Only show products whose name contains the user's term (e.g. "cake" -> no Cheese Biscuit, "cheese" -> no Sweet Cake)
        const filterByMention = (mention: string, products: any[]) => {
          const m = normalize(mention);
          return products.filter((p) => p.name.toLowerCase().includes(m));
        };

        const lines: string[] = [];
        lines.push(
          "Saya melihat beberapa kata yang bisa berarti beberapa produk berbeda. Berikut daftar kemungkinan produknya:"
        );

        // Tampilkan juga produk yang sudah pasti (sudah kami catat) supaya pelanggan tahu apa yang sudah fix
        if (state.collectedData.products && state.collectedData.products.length > 0) {
          lines.push("\nSaat ini pesanan yang sudah kami catat:");
          for (const p of state.collectedData.products as any[]) {
            const qty =
              typeof (p as any).quantity === "number" && (p as any).quantity > 0
                ? ` ${(p as any).quantity} pcs`
                : "";
            lines.push(`- ${p.name}${qty}`);
          }
        }

        for (const ambiguous of ambiguousList) {
          // If user's mention exactly matches a product name (e.g. "cheese biscuit" = "Cheese Biscuit"), add it and don't ask
          const exactProduct = productsForAI.find(
            (p) => normalize(p.name) === normalize(ambiguous.userMention)
          );
          if (exactProduct) {
            if (!state.collectedData.products) state.collectedData.products = [];
            const qty =
              analysis.extractedData.products?.find(
                (e) => normalize(e.name) === normalize(exactProduct.name)
              )?.quantity ?? 1;
            const existing = state.collectedData.products.find(
              (p: { name: string }) => p.name === exactProduct.name
            );
            if (existing) (existing as any).quantity = qty;
            else state.collectedData.products.push({ name: exactProduct.name, quantity: qty, confidence: 1 });
            continue;
          }
          const similarProducts = this.similarityService.findSimilarProducts(
            ambiguous.userMention,
            productsForAI,
            0.3
          );
          const filtered = filterByMention(ambiguous.userMention, similarProducts);
          const toShow = filtered.length >= 2 ? filtered : similarProducts;

          if (toShow.length >= 2) {
            lines.push(`\nUntuk "${ambiguous.userMention}":`);
            for (const p of toShow) {
              lines.push(`- ${p.name} - Rp ${p.price.toLocaleString("id-ID")}`);
            }
          }
        }

        lines.push(
          "\nMohon tuliskan ulang pesanan dengan nama produk lengkap dan jumlah dari daftar di atas.\n" +
            'Contoh: "Cheesecake 2 pcs, Sweet Cake 3 pcs, Cheese Biscuit 1 pcs".'
        );

        const combinedQuestion = lines.join("\n");
        const hasAmbiguousSections = lines.length > 2;

        if (hasAmbiguousSections) {
          state.pendingQuestion = {
            type: "product_clarification",
            questionText: combinedQuestion,
          };

          state.conversationHistory.push({
            role: "assistant",
            message: combinedQuestion,
            timestamp: new Date(),
          });

          state.lastMessageId = twilioMessageId;
          await state.save();

          return {
            success: true,
            whatsappResponse: combinedQuestion,
            shouldCreateOrder: false,
          };
        }
      }

      // 6. Update collected data from analysis
      this.updateCollectedData(state, analysis.extractedData);

      // 7. Check completeness
      const completeness = this.checkCompleteness(state);

      if (!completeness.isComplete) {
        // Generate follow-up question for first missing field
        const question = this.generateFollowUpQuestion(
          completeness.missingFields[0],
          state,
          analysis.suggestedQuestion
        );

        state.pendingQuestion = {
          type: "missing_field",
          field: completeness.missingFields[0],
          questionText: question,
        };

        state.missingFields = completeness.missingFields;
        state.conversationHistory.push({
          role: "assistant",
          message: question,
          timestamp: new Date(),
        });

        state.lastMessageId = twilioMessageId;
        await state.save();

        return {
          success: true,
          whatsappResponse: question,
          shouldCreateOrder: false,
        };
      }

      // 8. All data complete! Create order from structured collected data so pickupTime/fulfillmentType are persisted
      const orderMessage = this.buildOrderMessageFromCollectedData(state.collectedData);
      const collectedForOrder = {
        products: (state.collectedData.products || []).map((p: { name: string; quantity: number }) => ({
          name: p.name,
          quantity: p.quantity,
        })),
        deliveryDate: state.collectedData.deliveryDate,
        deliveryAddress: state.collectedData.deliveryAddress,
        fulfillmentType: state.collectedData.fulfillmentType,
        pickupTime: state.collectedData.pickupTime,
      };

      const orderResult = await processWhatsAppMessageForOrder(
        orderMessage,
        phoneNumber,
        whatsappMessageMongoId,
        twilioMessageId,
        true, // For conversational flow, skip stock checks and just create the order
        collectedForOrder
      );

      if (orderResult.success && orderResult.orderId) {
        // Mark conversation as completed and store orderId,
        // but keep this single ConversationState reusable for future orders.
        state.status = "completed";
        state.lastMessageId = twilioMessageId;
        state.orderId = orderResult.orderId;
        await state.save();

        return {
          success: true,
          whatsappResponse: orderResult.whatsappResponse || "✅ Pesanan Anda telah diterima!",
          orderId: orderResult.orderId,
          shouldCreateOrder: true,
        };
      } else {
        // Keep status as "collecting" so user can retry with the same data
        state.status = "collecting";
        await state.save();

        return {
          success: false,
          whatsappResponse:
            orderResult.whatsappResponse ||
            "❌ Maaf, terjadi kesalahan saat memproses pesanan Anda. Silakan coba lagi.",
          shouldCreateOrder: false,
          error: orderResult.error,
        };
      }
    } catch (error: any) {
      console.error("❌ Error in ConversationManager:", error);
      return {
        success: false,
        whatsappResponse:
          "❌ Maaf, terjadi kesalahan. Silakan coba lagi atau hubungi kami langsung.",
        shouldCreateOrder: false,
        error: error.message,
      };
    }
  }

  /**
   * Update collected data from new analysis
   */
  private updateCollectedData(
    state: ConversationStateData,
    extractedData: ExtractedOrderData
  ): void {
    // Update products
    if (extractedData.products && extractedData.products.length > 0) {
      if (!state.collectedData.products) {
        state.collectedData.products = [];
      }

      // Merge products (avoid duplicates)
      for (const product of extractedData.products) {
        const existing = state.collectedData.products.find(
          (p) => p.name === product.name
        );
        if (existing) {
          existing.quantity = product.quantity; // Update quantity
          existing.confidence = product.confidence;
        } else {
          state.collectedData.products.push(product);
        }
      }
    }

    // Update delivery date
    if (extractedData.deliveryDate) {
      state.collectedData.deliveryDate = extractedData.deliveryDate;
    }

    // Update delivery address
    if (extractedData.deliveryAddress) {
      state.collectedData.deliveryAddress = extractedData.deliveryAddress;
    }

    // Update fulfillment type (pickup vs delivery) whenever the user clearly says pickup or delivery
    // (e.g. "mau di ambil besok jam 3 sore" → pickup) so we don't get stuck asking "what else?"
    if (extractedData.fulfillmentType === "pickup" || extractedData.fulfillmentType === "delivery") {
      state.collectedData.fulfillmentType = extractedData.fulfillmentType;
    }

    // Update pickup / delivery time (free‑form string)
    if (extractedData.pickupTime) {
      state.collectedData.pickupTime = extractedData.pickupTime;
    }

    // Update customer name if provided
    if (extractedData.customerName) {
      state.collectedData.customerName = extractedData.customerName;
    }
  }

  /**
   * Check if all required fields are complete
   */
  private checkCompleteness(state: ConversationStateData): {
    isComplete: boolean;
    missingFields: Array<
      | "products"
      | "quantities"
      | "deliveryDate"
      | "deliveryAddress"
      | "fulfillmentType"
      | "pickupTime"
    >;
  } {
    const missing: Array<
      | "products"
      | "quantities"
      | "deliveryDate"
      | "deliveryAddress"
      | "fulfillmentType"
      | "pickupTime"
    > = [];

    // Check products
    if (
      !state.collectedData.products ||
      state.collectedData.products.length === 0
    ) {
      missing.push("products");
    } else {
      // Check quantities (all products must have quantity > 0)
      const hasInvalidQuantity = state.collectedData.products.some(
        (p) => !p.quantity || p.quantity <= 0
      );
      if (hasInvalidQuantity) {
        missing.push("quantities");
      }
    }

    // Check delivery date
    if (!state.collectedData.deliveryDate) {
      missing.push("deliveryDate");
    }

    // Check fulfillment type (pickup vs delivery)
    if (!state.collectedData.fulfillmentType) {
      missing.push("fulfillmentType");
    }

    // Check delivery address – only required if fulfillmentType is delivery
    if (
      state.collectedData.fulfillmentType === "delivery" &&
      !state.collectedData.deliveryAddress
    ) {
      missing.push("deliveryAddress");
    }

    // Check pickup / delivery time – always ask for a time
    if (!state.collectedData.pickupTime) {
      missing.push("pickupTime");
    }

    return {
      isComplete: missing.length === 0,
      missingFields: missing,
    };
  }

  /**
   * Generate follow-up question for missing field
   */
  private generateFollowUpQuestion(
    missingField:
      | "products"
      | "quantities"
      | "deliveryDate"
      | "deliveryAddress"
      | "fulfillmentType"
      | "pickupTime",
    state: ConversationStateData,
    aiSuggestedQuestion?: string
  ): string {
    // Always use our clear template for fulfillmentType and pickupTime so we never show
    // generic "what else?" / "ada lagi?" when we're actually waiting for pickup/delivery or time
    if (missingField === "fulfillmentType" || missingField === "pickupTime") {
      const questions: Record<string, string> = {
        fulfillmentType:
          "Apakah pesanan ini mau DIAMBIL di toko (pickup) atau DIKIRIM ke alamat Anda (delivery)?\n\nBalas dengan salah satu kata saja: \"pickup\" atau \"delivery\".",
        pickupTime:
          state.collectedData.fulfillmentType === "delivery"
            ? "Jam berapa Anda ingin pesanan DIKIRIM? (contoh: jam 10 pagi, jam 3 sore)"
            : state.collectedData.fulfillmentType === "pickup"
            ? "Jam berapa Anda ingin MENGAMBIL pesanan di toko? (contoh: jam 10 pagi, jam 3 sore)"
            : "Jam berapa Anda ingin pesanan siap? (contoh: jam 10 pagi, jam 3 sore)",
      };
      return questions[missingField];
    }

    // Use AI suggestion if available for other fields
    if (aiSuggestedQuestion) {
      return aiSuggestedQuestion;
    }

    // Fallback to template questions
    const questions: Record<string, string> = {
      products: "Produk apa yang ingin Anda pesan? Silakan sebutkan nama produknya.",
      quantities: state.collectedData.products
        ? `Berapa jumlah ${state.collectedData.products.map((p) => p.name).join(" dan ")} yang Anda inginkan?`
        : "Berapa jumlah yang Anda inginkan?",
      deliveryDate:
        "Kapan Anda ingin pesanan dikirim? (contoh: besok, 15 Februari, atau tanggal lainnya)",
      deliveryAddress:
        "Bisa berikan alamat pengiriman yang lengkap? (termasuk nama jalan, nomor, dan kota)",
      fulfillmentType:
        "Apakah pesanan ini mau DIAMBIL di toko (pickup) atau DIKIRIM ke alamat Anda (delivery)?\n\nBalas dengan salah satu kata saja: \"pickup\" atau \"delivery\".",
      pickupTime:
        state.collectedData.fulfillmentType === "delivery"
          ? "Jam berapa Anda ingin pesanan DIKIRIM? (contoh: jam 10 pagi, jam 3 sore)"
          : state.collectedData.fulfillmentType === "pickup"
          ? "Jam berapa Anda ingin MENGAMBIL pesanan di toko? (contoh: jam 10 pagi, jam 3 sore)"
          : "Jam berapa Anda ingin pesanan siap? (contoh: jam 10 pagi, jam 3 sore)",
    };

    return questions[missingField] || "Mohon lengkapi informasi pesanan Anda.";
  }

  /**
   * Cancel active conversation
   */
  async cancelConversation(phoneNumber: string): Promise<void> {
    await connectToDB();
    await ConversationState.findOneAndUpdate(
      { phoneNumber, status: "collecting" },
      { status: "cancelled" }
    );
  }

  /**
   * Get active conversation state
   */
  async getConversationState(phoneNumber: string): Promise<ConversationStateData | null> {
    await connectToDB();
    return await ConversationState.findOne({
      phoneNumber,
      status: "collecting",
    });
  }

  /**
   * Build order message from collected data
   * Formats the data in a way that the existing order processing can understand
   */
  private buildOrderMessageFromCollectedData(collectedData: any): string {
    const parts: string[] = [];

    // Add products
    if (collectedData.products && collectedData.products.length > 0) {
      for (const product of collectedData.products) {
        parts.push(`${product.name} ${product.quantity}`);
      }
    }

    // Add delivery date
    if (collectedData.deliveryDate) {
      parts.push(`untuk tanggal ${collectedData.deliveryDate}`);
    }

    // Add delivery address
    if (collectedData.deliveryAddress) {
      parts.push(`alamat ${collectedData.deliveryAddress}`);
    }

    return parts.join(", ");
  }
}
