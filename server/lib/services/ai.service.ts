import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

type AIProvider = "openai" | "gemini";

export interface ExtractedOrderData {
  products: Array<{
    name: string; // e.g., "chiffon", "cheesecake"
    quantity: number; // e.g., 1, 2
    confidence: number; // 0-1, how confident AI is about this match
  }>;
  customerName?: string;
  phoneNumber?: string;
  deliveryDate?: string;
  notes?: string;
  confidence: number; // Overall confidence (0-1)
}

export class AIService {
  private provider: AIProvider;
  private gemini?: GoogleGenerativeAI;
  private geminiModel?: any;
  private openai?: OpenAI;

  // Rate limiting (same as context-catch)
  private lastRequestTime: number = 0;
  private dailyRequestCount: number = 0;
  private lastResetDate: number = Date.now();

  constructor() {
    this.provider = (process.env.AI_PROVIDER || "gemini") as AIProvider;

    if (this.provider === "gemini") {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("Gemini API key not configured");
      this.gemini = new GoogleGenerativeAI(apiKey);
      this.geminiModel = this.gemini.getGenerativeModel({
        model: "gemini-2.0-flash",
      });
      console.log("✅ Using Gemini 2.0 Flash as AI provider");
    } else {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error("OpenAI API key not configured");
      this.openai = new OpenAI({ apiKey });
      console.log("✅ Using OpenAI GPT-4o-mini as AI provider");
    }
  }

  /**
   * Analyze WhatsApp message and extract order information
   */
  async analyzeWhatsAppMessage(
    messageBody: string,
    availableProducts: Array<{ name: string; price: number }> // For context
  ): Promise<ExtractedOrderData> {
    // Rate limiting check
    await this.checkGeminiRateLimit();

    const prompt = `You are analyzing a WhatsApp message to extract order information.

Available products in our database:
${availableProducts.map((p) => `- ${p.name} ($${p.price})`).join("\n")}

Message from customer:
"${messageBody}"

Extract the following information:
1. Product names mentioned (match to closest product name from the list above)
2. Quantities for each product
3. Customer name (if mentioned)
4. Phone number (if mentioned)
5. Delivery date (if mentioned)
6. Any special notes or requirements

Respond with ONLY valid JSON in this exact format:
{
  "products": [
    {
      "name": "exact product name from available products list",
      "quantity": 1,
      "confidence": 0.9
    }
  ],
  "customerName": "name or null",
  "phoneNumber": "phone or null",
  "deliveryDate": "YYYY-MM-DD or null",
  "notes": "any special notes or null",
  "confidence": 0.85
}

Rules:
- Product names must match EXACTLY one from the available products list
- If product name is ambiguous (e.g., "cake"), choose the closest match
- Quantities must be positive integers
- Confidence should be 0-1 (1 = very confident, 0 = not confident)
- Return null for fields not found in message`;

    if (this.provider === "gemini") {
      return await this.analyzeWithGemini(prompt);
    } else {
      return await this.analyzeWithOpenAI(prompt);
    }
  }

  private async analyzeWithGemini(prompt: string): Promise<ExtractedOrderData> {
    if (!this.geminiModel) throw new Error("Gemini model not initialized");

    const result = await this.geminiModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from AI response");
    }

    return JSON.parse(jsonMatch[0]) as ExtractedOrderData;
  }

  private async analyzeWithOpenAI(prompt: string): Promise<ExtractedOrderData> {
    if (!this.openai) throw new Error("OpenAI client not initialized");

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an order extraction assistant. Extract order information from WhatsApp messages and return ONLY valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || "{}";
    return JSON.parse(content) as ExtractedOrderData;
  }

  /**
   * Check and enforce Gemini free tier rate limits
   * Free tier: 15 requests per minute (RPM), 1,500 requests per day (RPD)
   */
  private async checkGeminiRateLimit(): Promise<void> {
    if (this.provider !== "gemini") return;

    const now = Date.now();

    // Reset daily counter if new day
    const today = new Date(now).toDateString();
    const lastReset = new Date(this.lastResetDate).toDateString();
    if (today !== lastReset) {
      this.dailyRequestCount = 0;
      this.lastResetDate = now;
    }

    // Check daily limit (1,500 requests/day)
    if (this.dailyRequestCount >= 1500) {
      throw new Error(
        "Gemini daily rate limit exceeded (1,500 requests/day). Please wait or upgrade to paid tier."
      );
    }

    // Check per-minute limit (15 RPM = 1 request every 4 seconds)
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = 4000; // 4 seconds = 15 requests per minute

    if (timeSinceLastRequest < minInterval) {
      const waitTime = minInterval - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
    this.dailyRequestCount++;
  }
}

