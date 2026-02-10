"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const generative_ai_1 = require("@google/generative-ai");
const openai_1 = __importDefault(require("openai"));
class AIService {
    constructor() {
        // Rate limiting (same as context-catch)
        this.lastRequestTime = 0;
        this.dailyRequestCount = 0;
        this.lastResetDate = Date.now();
        this.provider = (process.env.AI_PROVIDER || "gemini");
        if (this.provider === "gemini") {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey)
                throw new Error("Gemini API key not configured");
            this.gemini = new generative_ai_1.GoogleGenerativeAI(apiKey);
            this.geminiModel = this.gemini.getGenerativeModel({
                model: "gemini-2.0-flash",
            });
            console.log("✅ Using Gemini 2.0 Flash as AI provider");
        }
        else {
            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey)
                throw new Error("OpenAI API key not configured");
            this.openai = new openai_1.default({ apiKey });
            console.log("✅ Using OpenAI GPT-4o-mini as AI provider");
        }
    }
    /**
     * Analyze WhatsApp message with conversation context
     * Returns extracted data, missing fields, and ambiguous products
     */
    analyzeWithContext(messageBody, availableProducts, conversationHistory, currentState) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkGeminiRateLimit();
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];
            const historyText = conversationHistory
                ? conversationHistory
                    .map((msg) => `${msg.role === "user" ? "Pelanggan" : "Anda"}: ${msg.message}`)
                    .join("\n")
                : "Tidak ada riwayat percakapan sebelumnya.";
            const collectedDataText = (currentState === null || currentState === void 0 ? void 0 : currentState.collectedData)
                ? JSON.stringify(currentState.collectedData, null, 2)
                : "Belum ada data yang dikumpulkan.";
            const prompt = `Anda adalah asisten penjualan yang ramah untuk toko kue. 
Anda sedang mengobrol dengan pelanggan melalui WhatsApp untuk mengambil pesanan.

PRODUK YANG TERSEDIA:
${availableProducts.map((p, i) => `${i + 1}. ${p.name} - Rp ${p.price.toLocaleString("id-ID")}`).join("\n")}

RIWAYAT PERCAKAPAN:
${historyText}

DATA YANG SUDAH DIKOLEKSI:
${collectedDataText}

Hari ini: ${todayStr} (YYYY-MM-DD)
Besok: ${tomorrowStr} (YYYY-MM-DD)

PESAN TERBARU DARI PELANGGAN:
"${messageBody}"

TUGAS ANDA:
1. Ekstrak informasi dari pesan terbaru:
   - products: Nama produk yang disebutkan (harus cocok dengan produk yang tersedia)
   - quantities: Jumlah untuk setiap produk
   - deliveryDate: Tanggal pengiriman (format: YYYY-MM-DD atau null)
   - deliveryAddress: Alamat pengiriman lengkap (atau null)
   
2. Identifikasi field yang masih kurang:
   - "products": Apakah ada produk yang disebutkan?
   - "quantities": Apakah ada jumlah yang disebutkan untuk setiap produk?
   - "deliveryDate": Apakah ada tanggal pengiriman?
   - "deliveryAddress": Apakah ada alamat pengiriman?

3. Jika produk yang disebutkan ambigu (misal "kue" bisa berarti beberapa produk), list semua kemungkinan dengan similarity score.
   PENTING: Jika sebuah kata dari pelanggan bisa cocok ke LEBIH DARI 1 produk (misal "cake" atau "kue"), SELALU anggap itu ambigu dan MASUKKAN ke "ambiguousProducts" walaupun pada pesan yang sama juga ada produk lain yang sudah jelas.

4. Buat pertanyaan follow-up yang natural dalam Bahasa Indonesia jika ada field yang kurang.

RESPOND DENGAN JSON:
{
  "extractedData": {
    "products": [{"name": "exact product name", "quantity": 1, "confidence": 0.9}],
    "deliveryDate": "YYYY-MM-DD or null",
    "deliveryAddress": "string or null",
    "notes": "string or null",
    "confidence": 0.85
  },
  "missingFields": ["products", "quantities", "deliveryDate", "deliveryAddress"],
  "ambiguousProducts": [
    {
      "userMention": "kue",
      "possibleMatches": [
        {"name": "Chiffon Cake", "price": 50000, "similarity": 0.8},
        {"name": "Cheesecake", "price": 75000, "similarity": 0.7}
      ]
    }
  ],
  "suggestedQuestion": "Pertanyaan follow-up dalam Bahasa Indonesia yang ramah",
  "intent": "reset" | "order" | "other"
}

RULES:
- Product names harus cocok EXACTLY dengan produk yang tersedia
- Quantities harus positive integers
- deliveryDate: "besok" = ${tomorrowStr}, "hari ini" = ${todayStr}
- Return null untuk field yang tidak ditemukan
- missingFields: List field yang BELUM lengkap
- ambiguousProducts: WAJIB diisi jika ada kata dari pelanggan yang bisa cocok ke >= 2 produk (misal "cake" cocok ke Sweet Cake dan Cheesecake), bahkan jika pada pesan yang sama juga ada produk lain yang sudah jelas.
- Jika sebuah mention dianggap ambigu, JANGAN memasukkan produk hasil tebakannya ke "extractedData.products" sebelum pelanggan menjawab klarifikasi.
- suggestedQuestion: Pertanyaan natural dalam Bahasa Indonesia
- intent:
  - "reset" jika pelanggan dengan jelas meminta untuk mengulang / reset / mulai dari awal / batalkan semua pesanan sebelumnya (contoh: "saya mau pesan dari awal lagi", "reset pesanan", "hapus semua pesanan yang sudah dicatat").
  - "order" jika pesan ini bagian normal dari percakapan pesanan.
  - "other" jika pesan bukan tentang pesanan (small talk, pertanyaan lain, dsb).

Return ONLY valid JSON, no other text.`;
            if (this.provider === "gemini") {
                return yield this.analyzeWithContextGemini(prompt);
            }
            else {
                return yield this.analyzeWithContextOpenAI(prompt);
            }
        });
    }
    analyzeWithContextGemini(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.geminiModel)
                throw new Error("Gemini model not initialized");
            const result = yield this.geminiModel.generateContent(prompt);
            const response = result.response;
            const text = response.text();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error("Failed to extract JSON from AI response");
            }
            return JSON.parse(jsonMatch[0]);
        });
    }
    analyzeWithContextOpenAI(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!this.openai)
                throw new Error("OpenAI client not initialized");
            const response = yield this.openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "You are a friendly sales assistant for a bakery. Extract order information from WhatsApp messages and return ONLY valid JSON.",
                    },
                    { role: "user", content: prompt },
                ],
                response_format: { type: "json_object" },
                temperature: 0.3,
            });
            const content = ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "{}";
            return JSON.parse(content);
        });
    }
    /**
     * Extract product phrases and quantities from message as the user wrote them.
     * Does NOT match to catalog - use for post-clarification resolution.
     */
    extractProductPhrasesWithQuantities(messageBody) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            yield this.checkGeminiRateLimit();
            const prompt = `Extract from this order message each product or term the customer mentioned and the quantity.
Return ONLY valid JSON in this format: { "items": [ { "phrase": "exact text as customer wrote", "quantity": number } ] }
Do NOT translate or match to any product catalog. Keep "phrase" exactly as the customer wrote it (e.g. "chocolate", "cheese biscuit", "cheesecake").
Message: "${messageBody}"`;
            if (this.provider === "gemini") {
                const result = yield this.geminiModel.generateContent(prompt);
                const text = result.response.text();
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (!jsonMatch)
                    return [];
                const parsed = JSON.parse(jsonMatch[0]);
                return Array.isArray(parsed.items) ? parsed.items : [];
            }
            else {
                const response = yield this.openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: "Extract product phrases and quantities. Return ONLY valid JSON with key 'items'." },
                        { role: "user", content: prompt },
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.2,
                });
                const content = ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "{}";
                const parsed = JSON.parse(content);
                return Array.isArray(parsed.items) ? parsed.items : [];
            }
        });
    }
    /**
     * Analyze WhatsApp message and extract order information
     */
    analyzeWhatsAppMessage(messageBody, availableProducts // For context
    ) {
        return __awaiter(this, void 0, void 0, function* () {
            // Rate limiting check
            yield this.checkGeminiRateLimit();
            // Get today's date for context
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD
            const prompt = `You are analyzing a WhatsApp message to extract order information.

Available products in our database:
${availableProducts.map((p) => `- ${p.name} ($${p.price})`).join("\n")}

Today's date: ${todayStr} (YYYY-MM-DD)
Tomorrow's date: ${tomorrowStr} (YYYY-MM-DD)

Message from customer:
"${messageBody}"

Extract the following information:
1. Product names mentioned (match to closest product name from the list above)
2. Quantities for each product
3. Phone number (if mentioned)
4. Pickup/delivery date (if mentioned - e.g., "tomorrow", "next Monday", "Feb 10", "pickup on 2/10")
   - If user says "tomorrow", return "${tomorrowStr}"
   - If user says "today", return "${todayStr}"
   - For other dates, calculate relative to today (${todayStr}) and return in YYYY-MM-DD format
   - Return null if no date mentioned
5. Delivery address (if mentioned - e.g., "alamat Jl. Sudirman No. 123, Jakarta")
   - Extract full address including street, number, city
   - Return null if no address mentioned
6. Any special notes or requirements

IMPORTANT: Do NOT extract customer name. Always return null for customerName.

Respond with ONLY valid JSON in this exact format:
{
  "products": [
    {
      "name": "exact product name from available products list",
      "quantity": 1,
      "confidence": 0.9
    }
  ],
  "customerName": null,
  "phoneNumber": "phone or null",
  "deliveryDate": "YYYY-MM-DD or null",
  "deliveryAddress": "full address or null",
  "notes": "any special notes or null",
  "confidence": 0.85
}

Rules:
- Product names must match EXACTLY one from the available products list
- If product name is ambiguous (e.g., "cake"), choose the closest match
- Quantities must be positive integers
- Confidence should be 0-1 (1 = very confident, 0 = not confident)
- For deliveryDate: Calculate dates relative to today (${todayStr}). "tomorrow" = ${tomorrowStr}
- Return null for fields not found in message
- deliveryDate must be in YYYY-MM-DD format or null`;
            if (this.provider === "gemini") {
                return yield this.analyzeWithGemini(prompt);
            }
            else {
                return yield this.analyzeWithOpenAI(prompt);
            }
        });
    }
    analyzeWithGemini(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.geminiModel)
                throw new Error("Gemini model not initialized");
            const result = yield this.geminiModel.generateContent(prompt);
            const response = result.response;
            const text = response.text();
            // Parse JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error("Failed to extract JSON from AI response");
            }
            return JSON.parse(jsonMatch[0]);
        });
    }
    analyzeWithOpenAI(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!this.openai)
                throw new Error("OpenAI client not initialized");
            const response = yield this.openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "You are an order extraction assistant. Extract order information from WhatsApp messages and return ONLY valid JSON.",
                    },
                    { role: "user", content: prompt },
                ],
                response_format: { type: "json_object" },
                temperature: 0.3,
            });
            const content = ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "{}";
            return JSON.parse(content);
        });
    }
    /**
     * Parse date range from natural language input
     * Returns structured date range JSON
     */
    parseDateRange(input) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkGeminiRateLimit();
            const today = new Date().toISOString().split('T')[0];
            const prompt = `Parse the date request from: "${input}"

Today's date: ${today}

Return JSON:
{
  "dateRange": {
    "start": "2024-01-15", // YYYY-MM-DD format
    "end": "2024-01-17"    // Same as start if single date, or end date if range
  },
  "type": "single" | "range",
  "interpretation": "today" // What the user meant (for display)
}

Examples:
- "today" or "" or no input → { "start": "${today}", "end": "${today}", "type": "single", "interpretation": "today" }
- "tomorrow" → Calculate tomorrow's date
- "next 3 days" → { "start": "${today}", "end": "calculated end date", "type": "range", "interpretation": "next 3 days" }
- "this week" → { "start": "Monday of this week", "end": "Sunday of this week", "type": "range", "interpretation": "this week" }
- "January 15th" → { "start": "2024-01-15", "end": "2024-01-15", "type": "single", "interpretation": "January 15th" }

Return ONLY valid JSON, no other text.`;
            if (this.provider === "gemini") {
                return yield this.parseDateRangeWithGemini(prompt);
            }
            else {
                return yield this.parseDateRangeWithOpenAI(prompt);
            }
        });
    }
    parseDateRangeWithGemini(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.geminiModel)
                throw new Error("Gemini model not initialized");
            const result = yield this.geminiModel.generateContent(prompt);
            const response = result.response;
            const text = response.text();
            // Parse JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error("Failed to extract JSON from AI response");
            }
            return JSON.parse(jsonMatch[0]);
        });
    }
    parseDateRangeWithOpenAI(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!this.openai)
                throw new Error("OpenAI client not initialized");
            const response = yield this.openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "You are a date parsing assistant. Parse date requests and return ONLY valid JSON.",
                    },
                    { role: "user", content: prompt },
                ],
                response_format: { type: "json_object" },
                temperature: 0.3,
            });
            const content = ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "{}";
            return JSON.parse(content);
        });
    }
    /**
     * Analyze waste message and extract waste information
     */
    analyzeWasteMessage(text) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkGeminiRateLimit();
            const prompt = `Extract waste information from: "${text}"

Return JSON:
{
  "items": [
    {
      "name": "product or ingredient name",
      "quantity": 5,
      "unit": "pcs",
      "reason": "burnt"
    }
  ]
}

Rules:
- Extract item name (product or ingredient)
- Extract quantity (number)
- Extract unit (pcs, kg, g, L, ml, etc.)
- Extract reason (burnt, expired, damaged, etc.)
- Return empty array if no waste information found

Return ONLY valid JSON, no other text.`;
            if (this.provider === "gemini") {
                return yield this.analyzeWasteWithGemini(prompt);
            }
            else {
                return yield this.analyzeWasteWithOpenAI(prompt);
            }
        });
    }
    analyzeWasteWithGemini(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.geminiModel)
                throw new Error("Gemini model not initialized");
            const result = yield this.geminiModel.generateContent(prompt);
            const response = result.response;
            const text = response.text();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error("Failed to extract JSON from AI response");
            }
            return JSON.parse(jsonMatch[0]);
        });
    }
    analyzeWasteWithOpenAI(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!this.openai)
                throw new Error("OpenAI client not initialized");
            const response = yield this.openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "You are a waste logging assistant. Extract waste information and return ONLY valid JSON.",
                    },
                    { role: "user", content: prompt },
                ],
                response_format: { type: "json_object" },
                temperature: 0.3,
            });
            const content = ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "{}";
            return JSON.parse(content);
        });
    }
    /**
     * Parse stock addition information from user input
     * Extracts ingredient name, quantity, unit, expiry, supplier, and cost
     */
    parseStockAddition(userInput) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkGeminiRateLimit();
            const prompt = `Extract stock addition information from this message: "${userInput}"

Return JSON with:
- ingredientName: name of ingredient (e.g., "flour", "eggs", "sugar")
- quantity: number (e.g., 10, 5, 2.5)
- unit: unit of measurement (e.g., "kg", "g", "pcs", "L", "ml")
- expiryDays: number of days until expiry (if mentioned, otherwise null)
- supplier: supplier name (if mentioned, otherwise null)
- cost: cost amount (if mentioned, otherwise null)

Examples:
Input: "/stock 10kg flour"
Output: {"ingredientName": "flour", "quantity": 10, "unit": "kg", "expiryDays": null, "supplier": null, "cost": null}

Input: "just received 5 eggs expires in 7 days"
Output: {"ingredientName": "eggs", "quantity": 5, "unit": "pcs", "expiryDays": 7, "supplier": null, "cost": null}

Input: "/stock 2kg butter from ABC supplier $25"
Output: {"ingredientName": "butter", "quantity": 2, "unit": "kg", "expiryDays": null, "supplier": "ABC supplier", "cost": 25}

Now parse: "${userInput}"

Return ONLY valid JSON, no other text.`;
            if (this.provider === "gemini") {
                return yield this.parseStockAdditionWithGemini(prompt);
            }
            else {
                return yield this.parseStockAdditionWithOpenAI(prompt);
            }
        });
    }
    parseStockAdditionWithGemini(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.geminiModel)
                throw new Error("Gemini model not initialized");
            const result = yield this.geminiModel.generateContent(prompt);
            const response = result.response;
            const text = response.text();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error("Failed to extract JSON from AI response");
            }
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                ingredientName: parsed.ingredientName || "",
                quantity: parsed.quantity || 0,
                unit: parsed.unit || "pcs",
                expiryDays: parsed.expiryDays || undefined,
                supplier: parsed.supplier || undefined,
                cost: parsed.cost || undefined,
            };
        });
    }
    parseStockAdditionWithOpenAI(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!this.openai)
                throw new Error("OpenAI client not initialized");
            const response = yield this.openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "You are a stock addition parsing assistant. Extract stock information and return ONLY valid JSON.",
                    },
                    { role: "user", content: prompt },
                ],
                response_format: { type: "json_object" },
                temperature: 0.3,
            });
            const content = ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "{}";
            const parsed = JSON.parse(content);
            return {
                ingredientName: parsed.ingredientName || "",
                quantity: parsed.quantity || 0,
                unit: parsed.unit || "pcs",
                expiryDays: parsed.expiryDays || undefined,
                supplier: parsed.supplier || undefined,
                cost: parsed.cost || undefined,
            };
        });
    }
    /**
     * Check and enforce Gemini free tier rate limits
     * Free tier: 15 requests per minute (RPM), 1,500 requests per day (RPD)
     */
    checkGeminiRateLimit() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.provider !== "gemini")
                return;
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
                throw new Error("Gemini daily rate limit exceeded (1,500 requests/day). Please wait or upgrade to paid tier.");
            }
            // Check per-minute limit (15 RPM = 1 request every 4 seconds)
            const timeSinceLastRequest = now - this.lastRequestTime;
            const minInterval = 4000; // 4 seconds = 15 requests per minute
            if (timeSinceLastRequest < minInterval) {
                const waitTime = minInterval - timeSinceLastRequest;
                yield new Promise((resolve) => setTimeout(resolve, waitTime));
            }
            this.lastRequestTime = Date.now();
            this.dailyRequestCount++;
        });
    }
    /**
     * Predict expiry days for an ingredient using AI
     * Used when ingredient.defaultExpiryDays is not set in database
     */
    predictExpiryDays(ingredientName) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            yield this.checkGeminiRateLimit();
            const prompt = `What is the typical shelf life (in days) for the ingredient "${ingredientName}" when stored properly?

Consider:
- Type of ingredient (dairy, flour, spice, etc.)
- Typical storage conditions
- Industry standards

Return ONLY a number representing the days until expiry. For example:
- Eggs: 30 days
- Flour: 180 days
- Milk: 7 days
- Sugar: 365 days

Ingredient: "${ingredientName}"
Return only the number of days:`;
            if (this.provider === "gemini") {
                try {
                    const result = yield this.geminiModel.generateContent(prompt);
                    const response = result.response.text();
                    // Extract number from response
                    const days = parseInt(((_a = response.match(/\d+/)) === null || _a === void 0 ? void 0 : _a[0]) || "30");
                    return Math.max(1, days); // Ensure at least 1 day
                }
                catch (error) {
                    console.error("AI prediction failed:", error);
                    throw error; // Re-throw to be caught by caller
                }
            }
            else {
                try {
                    const response = yield this.openai.chat.completions.create({
                        model: "gpt-4o-mini",
                        messages: [
                            {
                                role: "system",
                                content: "You are a food safety expert. Return only a number representing shelf life in days.",
                            },
                            { role: "user", content: prompt },
                        ],
                        temperature: 0.3,
                    });
                    const days = parseInt(((_e = (_d = (_c = (_b = response.choices[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) === null || _d === void 0 ? void 0 : _d.match(/\d+/)) === null || _e === void 0 ? void 0 : _e[0]) || "30");
                    return Math.max(1, days);
                }
                catch (error) {
                    console.error("AI prediction failed:", error);
                    throw error; // Re-throw to be caught by caller
                }
            }
        });
    }
}
exports.AIService = AIService;
