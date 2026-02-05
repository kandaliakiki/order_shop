# Bakery Manager Feature - Analysis & Implementation Preview

## 📋 Overview

This document outlines the implementation plan for a **Cost-Optimized WhatsApp Bakery Manager with Hybrid Routing**. The system will route messages intelligently before calling AI, reducing token costs while providing interactive menu options and command-based operations.

**Project Context:** This is a POS (Point of Sale) system for a bakery, with order management, product/ingredient tracking, and WhatsApp integration for automated order processing.

---

## 🎯 Key Requirements Analysis

### 1. **Router Logic (Message Routing Before AI)**
**Goal:** Avoid unnecessary AI calls for simple interactions, reducing costs.

**Current Flow:**
```
Incoming Message → Store in DB → Always Call AI → Process Order
```

**New Flow:**
```
Incoming Message → Store in DB → Router → {
  - Greeting? → Send Interactive Buttons (NO AI)
  - Slash Command? → Call AI for Parsing
  - Button Click? → Route by button_id
  - Regular Message? → Call AI for Order Processing
}
```

### 2. **Interactive Buttons vs Text Menu - CLARIFICATION**

**IMPORTANT:** There are TWO different approaches:

#### **Option A: Text-Based Menu (NO Buttons)**
- **What it is:** Just plain text message with numbered options
- **User interaction:** User types the number or command manually
- **Example:**
  ```
  🍰 Welcome to Bakery Manager
  
  1️⃣ Bake Sheet - Type: /bakesheet
  2️⃣ Log Waste - Type: /waste
  3️⃣ Check Expiry - Type: /expiry
  4️⃣ Add Order - Type: /order
  
  Or simply send your order!
  ```
- **User types:** "1" or "/bakesheet" or just sends order text
- **Cost:** FREE (no API calls needed)
- **Pros:** Simple, zero cost, works immediately
- **Cons:** User must type, less intuitive

#### **Option B: Interactive Buttons (ACTUAL Buttons)**
- **What it is:** Clickable buttons in WhatsApp (like Meta Graph API)
- **User interaction:** User clicks a button, WhatsApp sends button_id to webhook
- **Requires:** Twilio Content Templates API setup (more complex)
- **Example:** User sees actual buttons they can click
- **Cost:** FREE (but requires setup)
- **Pros:** Better UX, more intuitive
- **Cons:** Requires Twilio Content API setup, more complex

#### **Option C: Numbered Menu (Hybrid)**
- **What it is:** Text menu, but user can type "1", "2", "3" instead of full commands
- **User interaction:** User types number, system interprets it
- **Example:** User types "1" → system treats as "/bakesheet"
- **Cost:** FREE
- **Pros:** Easier than typing full commands, simpler than buttons
- **Cons:** Still requires typing

**Decision:** Using **Option A (Simple Text Menu)** for MVP. Buttons can be added later if needed.

**Default Behavior:** If message doesn't match greeting or command, it defaults to regular order processing (existing behavior - `return { type: 'order', shouldCallAI: true }`).

### 3. **Command System**
Four main commands:
- `/order [text]` - **NEW:** Add order to system (alternative to sending plain message)
- `/bakesheet [date?]` - **REVISED:** Summarize orders for a date and show ingredients needed (replaces `/batch`)
- `/waste [text]` - Log waste and decrement inventory
- `/expiry [item?]` - Check ingredient expiry dates

**Note:** 
- `/order` command does the same thing as sending a plain message (current behavior), but gives users an explicit way to add orders via command.
- `/bakesheet` (formerly `/batch`) creates a Daily Bake Sheet summary showing:
  - List of orders for the specified date (today, tomorrow, or specific date)
  - Aggregated products and quantities needed
  - Total ingredients required
  - Stock availability check (sufficient/insufficient)

### 4. **New Data Models Needed**
- **Ingredient_Lots** - Track individual ingredient batches with expiry dates
- **WasteLog** - Store waste entries
- **BakeSheet** - Store daily bake sheet summaries
- **CommandLog** - Track all AI chatbot interactions (for logs section)

### 5. **UI Requirements**
- **Daily Bake Sheet Page**: Today/Tomorrow summary + date picker
- **Expiry Section**: New page + dashboard widget
- **Logs Section**: History of all AI chatbot interactions

---

## 🏗️ Architecture Overview

### Backend Structure

```
server/
├── lib/
│   ├── models/
│   │   ├── ingredientLot.model.ts (NEW)
│   │   ├── wasteLog.model.ts (NEW)
│   │   ├── bakeSheet.model.ts (NEW)
│   │   └── commandLog.model.ts (NEW)
│   ├── services/
│   │   ├── messageRouter.service.ts (NEW) - Routes messages before AI
│   │   ├── bakeSheet.service.ts (NEW) - Handles /bakesheet command (replaces batch)
│   │   ├── wasteLogging.service.ts (NEW) - Handles /waste command
│   │   └── expiryCheck.service.ts (NEW) - Handles /expiry command
│   │   // Note: /order uses existing processWhatsAppMessageForOrder
│   ├── actions/
│   │   ├── whatsappRouter.action.ts (NEW) - Main router action
│   │   ├── bakeSheet.action.ts (NEW) - Bake sheet CRUD
│   │   ├── wasteLog.action.ts (NEW) - Waste log CRUD
│   │   └── expiryCheck.action.ts (NEW) - Expiry queries
│   └── utils/
│       └── twilioInteractiveMessage.ts (NEW) - Helper for interactive messages
```

### Frontend Structure

```
client/
├── app/(root)/
│   ├── bake-sheet/
│   │   └── page.tsx (NEW)
│   ├── expiry/
│   │   └── page.tsx (NEW)
│   └── logs/
│       └── page.tsx (NEW)
├── components/
│   ├── bake_sheet_component/ (NEW)
│   ├── expiry_component/ (NEW)
│   └── logs_component/ (NEW)
```

---

## 📝 Detailed Implementation Preview

### Phase 1: Message Router & Interactive Menu

#### 1.1 Router Service (`messageRouter.service.ts`)

```typescript
export type MessageRoute = 
  | { type: 'greeting'; shouldCallAI: false }
  | { type: 'command'; command: 'order' | 'bakesheet' | 'waste' | 'expiry'; args: string; shouldCallAI: true }
  | { type: 'button_click'; buttonId: string; shouldCallAI: false }
  | { type: 'order'; shouldCallAI: true }; // Regular message treated as order

export class MessageRouterService {
  // Bakery agent name - can be customized
  private agentName = 'BakeBot'; // Selected: 'BakeBot'
  private greetingPatterns = ['hi', 'hello', 'hey', 'menu', 'help'];
  
  routeMessage(body: string, buttonId?: string): MessageRoute {
    // Check for button click (from webhook payload)
    if (buttonId) {
      return { type: 'button_click', buttonId, shouldCallAI: false };
    }
    
    // Check for greetings
    const normalizedBody = body.toLowerCase().trim();
    if (this.greetingPatterns.some(pattern => normalizedBody.includes(pattern))) {
      return { type: 'greeting', shouldCallAI: false };
    }
    
    // Check for slash commands
    if (body.startsWith('/')) {
      const [command, ...args] = body.slice(1).split(' ');
      if (['order', 'bakesheet', 'waste', 'expiry'].includes(command)) {
        return { 
          type: 'command', 
          command: command as 'order' | 'bakesheet' | 'waste' | 'expiry',
          args: args.join(' '),
          shouldCallAI: true 
        };
      }
    }
    
    // Check for numbered menu responses (if using Option C)
    if (/^[1-4]$/.test(normalizedBody)) {
      const menuMap: Record<string, 'order' | 'bakesheet' | 'waste' | 'expiry'> = {
        '1': 'bakesheet',
        '2': 'waste',
        '3': 'expiry',
        '4': 'order',
      };
      return {
        type: 'command',
        command: menuMap[normalizedBody],
        args: '',
        shouldCallAI: true,
      };
    }
    
    // Default: treat as order
    return { type: 'order', shouldCallAI: true };
  }
}
```

#### 1.2 Interactive Menu Response

**Option A: Simple Text Menu (SELECTED FOR MVP)**
```typescript
// Bakery agent name options:
// 'BakeBot', 'BakeBot', 'BakeryAssistant', 'BakeBuddy', 'SweetAssistant', 'BakeryHelper'
const AGENT_NAME = 'BakeBot'; // Can be customized

function getGreetingMenu(): string {
  return `🍰 *Welcome to ${AGENT_NAME}*

What would you like to do?

1️⃣ *Bake List* - Type: /batch [forwarded messages]
2️⃣ *Log Waste* - Type: /waste [item] [quantity] [reason]
3️⃣ *Check Expiry* - Type: /expiry [item?]
4️⃣ *Add Order* - Type: /order [your order details]

Or simply send your order without /order! 📝`;
}
```

**Option C: Numbered Menu (NOT SELECTED - Using Option A)**
```typescript
// This option is available but not selected for MVP
// We're using Option A (text menu with full commands) instead
```

**Option B: Twilio Content Template (Requires Setup)**
- Requires Twilio Content API setup
- More interactive but requires additional configuration
- Better UX but more complex

**Recommendation:** Start with Option A (text menu) for simplicity and zero cost.

#### 1.3 Updated Webhook Handler

```typescript
app.post("/api/twilio/webhook", async (req: Request, res: Response) => {
  // ... validation ...
  
  const { MessageSid, From, To, Body, ButtonId } = req.body;
  
  // Store message
  const savedMessage = await createWhatsAppMessage({
    messageId: MessageSid,
    from: From,
    to: To,
    body: Body || "",
    analyzed: false,
  });
  
  // Route message
  const router = new MessageRouterService();
  const route = router.routeMessage(Body || "", ButtonId);
  
  let responseMessage: string;
  
  if (route.type === 'greeting') {
    // No AI call - just return menu
    responseMessage = getGreetingMenu();
  } else if (route.type === 'button_click') {
    // Handle button click
    responseMessage = await handleButtonClick(route.buttonId, From);
  } else if (route.type === 'command') {
    // Call AI for command parsing
    if (route.command === 'order') {
      // /order command uses same flow as regular order
      const processResult = await processWhatsAppMessageForOrder(
        route.args || Body || "", // Use args if provided, else use full body
        From,
        savedMessage._id.toString(),
        MessageSid
      );
      responseMessage = processResult.whatsappResponse || "Order received.";
    } else {
      // Other commands (bakesheet, waste, expiry)
      responseMessage = await handleCommand(route.command, route.args, From, savedMessage._id.toString());
    }
  } else {
    // Regular order processing (existing flow)
    const processResult = await processWhatsAppMessageForOrder(
      Body || "",
      From,
      savedMessage._id.toString(),
      MessageSid
    );
    responseMessage = processResult.whatsappResponse || "Message received.";
  }
  
  // Log command interaction
  if (route.type === 'command' || route.type === 'button_click') {
    await createCommandLog({
      messageId: savedMessage._id.toString(),
      command: route.type === 'command' ? route.command : route.buttonId,
      input: Body || "",
      output: responseMessage,
      whatsappNumber: From,
    });
  }
  
  res.status(200).type("text/xml").send(`
    <Response>
      <Message>${responseMessage}</Message>
    </Response>
  `);
});
```

---

### Phase 2: Command Handlers

#### 2.0 `/order` Command Handler

**Purpose:** Explicitly add order via command (same as sending plain message, but gives users option to use command).

**Implementation:**
```typescript
// In the webhook handler, /order is handled the same as regular order
// The router already routes it to processWhatsAppMessageForOrder
// This is just for user convenience - they can type "/order chiffon 1 cheesecake 1"
// instead of just "chiffon 1 cheesecake 1"

// No separate handler needed - uses existing order processing flow
```

**User Experience:**
- User types: `/order chiffon 1 cheesecake 1`
- System: Extracts "chiffon 1 cheesecake 1" and processes as order
- Same result as typing: `chiffon 1 cheesecake 1` (without /order)

**Why have it?**
- Gives users explicit command option
- Consistent with other commands (/bakesheet, /waste, /expiry)
- Users might prefer typing commands

---

#### 2.1 `/bakesheet` Command Handler (REVISED - Replaces `/batch`)

**Purpose:** Create a Daily Bake Sheet summary for a date or date range showing:
- All orders for the specified date(s)
- Aggregated products and quantities
- Total ingredients required
- Stock availability check

**Command Usage (Natural Language - AI Parses):**
- `/bakesheet` or `/bakesheet today` - Today's orders (most common usage)
- `/bakesheet tomorrow` - Tomorrow's orders
- `/bakesheet next 3 days` - Next 3 days
- `/bakesheet this week` - This week (Monday to Sunday)
- `/bakesheet January 15th` - Specific date
- `/bakesheet next Monday to Friday` - Date range
- `/bakesheet summarize orders tomorrow` - Natural language variations

**Note:** Most usage will be "today" only. For full detailed views, users can check the POS system directly.

**Service:**
```typescript
export class BakeSheetService {
  async processBakeSheetCommand(
    dateInput: string, // Natural language - AI parses everything
    whatsappNumber: string
  ): Promise<{ success: boolean; bakeSheet?: BakeSheet; message: string }> {
    // 1. Use AI to parse natural language into date range JSON
    const aiService = new AIService();
    const parsed = await aiService.parseDateRange(dateInput);
    // Returns: { dateRange: { start: "2024-01-15", end: "2024-01-17" }, type: "range", interpretation: "next 3 days" }
    
    const startDate = new Date(parsed.dateRange.start);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(parsed.dateRange.end);
    endDate.setHours(23, 59, 59, 999);
    
    // 2. Fetch all orders for this date range
    const orders = await fetchOrdersByDateRange(startDate, endDate);
    
    if (orders.length === 0) {
      const dateDisplay = parsed.type === 'single' 
        ? parsed.dateRange.start 
        : `${parsed.dateRange.start} to ${parsed.dateRange.end}`;
      return {
        success: true,
        message: `📋 *Daily Bake Sheet - ${dateDisplay}*\n\nNo orders found for this date range.`,
      };
    }
    
    // 3. Group orders by date (for day-by-day breakdown if range)
    const ordersByDate: Record<string, typeof orders> = {};
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      if (!ordersByDate[orderDate]) {
        ordersByDate[orderDate] = [];
      }
      ordersByDate[orderDate].push(order);
    });
    
    // 4. Aggregate products from all orders (overall + per day)
    const overallProductAggregation: Record<string, number> = {};
    const dailyProductAggregation: Record<string, Record<string, number>> = {};
    
    Object.entries(ordersByDate).forEach(([date, dateOrders]) => {
      dailyProductAggregation[date] = {};
      dateOrders.forEach(order => {
        order.items.forEach(item => {
          // Overall aggregation
          if (overallProductAggregation[item.name]) {
            overallProductAggregation[item.name] += item.quantity;
          } else {
            overallProductAggregation[item.name] = item.quantity;
          }
          // Daily aggregation
          if (dailyProductAggregation[date][item.name]) {
            dailyProductAggregation[date][item.name] += item.quantity;
          } else {
            dailyProductAggregation[date][item.name] = item.quantity;
          }
        });
      });
    });
    
    // 5. Calculate total ingredients needed (aggregated across all days)
    const ingredientRequirements: Record<string, { quantity: number; unit: string }> = {};
    
    for (const [productName, totalQuantity] of Object.entries(overallProductAggregation)) {
      const product = await findProductByName(productName);
      if (product && product.ingredients) {
        product.ingredients.forEach(ing => {
          const totalNeeded = ing.quantity * totalQuantity;
          const key = `${ing.ingredient}_${ing.unit}`;
          if (ingredientRequirements[key]) {
            ingredientRequirements[key].quantity += totalNeeded;
          } else {
            ingredientRequirements[key] = {
              quantity: totalNeeded,
              unit: ing.unit,
            };
          }
        });
      }
    }
    
    // 6. Check stock availability
    const stockChecks: Array<{ name: string; needed: number; available: number; unit: string; sufficient: boolean }> = [];
    for (const [key, req] of Object.entries(ingredientRequirements)) {
      const [ingredientId, unit] = key.split('_');
      const ingredient = await findIngredientById(ingredientId);
      if (ingredient) {
        const sufficient = ingredient.currentStock >= req.quantity;
        stockChecks.push({
          name: ingredient.name,
          needed: req.quantity,
          available: ingredient.currentStock,
          unit: req.unit,
          sufficient,
        });
      }
    }
    
    // 7. Format response message
    const dateDisplay = parsed.type === 'single' 
      ? parsed.dateRange.start 
      : `${parsed.dateRange.start} to ${parsed.dateRange.end}`;
    
    let message = `📋 *Daily Bake Sheet - ${dateDisplay}*\n`;
    message += `*Interpretation:* ${parsed.interpretation}\n\n`;
    
    // If single date or small range, show day-by-day breakdown
    const daysCount = Object.keys(ordersByDate).length;
    if (daysCount <= 3) {
      // Day-by-day breakdown
      Object.entries(ordersByDate).sort().forEach(([date, dateOrders]) => {
        const dayProducts = dailyProductAggregation[date];
        const productList = Object.entries(dayProducts)
          .map(([name, qty]) => `  • ${name}: ${qty}`)
          .join('\n');
        message += `*${date}:*\n`;
        message += `  Orders: ${dateOrders.length}\n`;
        message += `  Products:\n${productList}\n\n`;
      });
    } else {
      // Large range - show summary only
      message += `*Total Orders:* ${orders.length}\n`;
      message += `*Days Covered:* ${daysCount} days\n\n`;
    }
    
    // Overall products summary
    const overallProductList = Object.entries(overallProductAggregation)
      .map(([name, qty]) => `• ${name}: ${qty}`)
      .join('\n');
    message += `*Total Products Needed:*\n${overallProductList}\n\n`;
    
    // Stock status
    const insufficientIngredients = stockChecks.filter(s => !s.sufficient);
    if (insufficientIngredients.length === 0) {
      message += `*Stock Status:* ✅ All ingredients sufficient`;
    } else {
      message += `*Stock Status:* ⚠️ Insufficient stock:\n`;
      message += insufficientIngredients.map(i => 
        `• ${i.name}: Need ${i.needed} ${i.unit}, Have ${i.available} ${i.unit}`
      ).join('\n');
    }
    
    // Note about POS system for full details
    if (daysCount > 1 || orders.length > 10) {
      message += `\n\n💡 For full details, check the POS system.`;
    }
    
    // 8. Create or update bake sheet (store in DB)
    const bakeItems = Object.entries(overallProductAggregation).map(([name, qty]) => ({
      productName: name,
      quantity: qty,
    }));
    
    const bakeSheet = await createOrUpdateBakeSheet({
      date: parsed.type === 'single' ? parsed.dateRange.start : `${parsed.dateRange.start}_to_${parsed.dateRange.end}`,
      dateRange: parsed.dateRange,
      items: bakeItems,
      ingredientRequirements: Object.entries(ingredientRequirements).map(([key, req]) => {
        const [ingredientId, unit] = key.split('_');
        return { ingredientId, ...req };
      }),
      stockChecks,
      source: 'whatsapp',
      whatsappNumber,
    });
    
    return {
      success: true,
      bakeSheet,
      message,
    };
  }
}

// AI Service method for date parsing
async parseDateRange(input: string): Promise<{
  dateRange: { start: string; end: string };
  type: 'single' | 'range';
  interpretation: string;
}> {
  const prompt = `Parse the date request from: "${input}"

Today's date: ${new Date().toISOString().split('T')[0]}

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
- "today" → { start: "2024-01-15", end: "2024-01-15", type: "single", interpretation: "today" }
- "tomorrow" → { start: "2024-01-16", end: "2024-01-16", type: "single", interpretation: "tomorrow" }
- "next 3 days" → { start: "2024-01-15", end: "2024-01-17", type: "range", interpretation: "next 3 days" }
- "this week" → { start: "2024-01-15", end: "2024-01-21", type: "range", interpretation: "this week" }
- "" or no input → { start: "today", end: "today", type: "single", interpretation: "today" }`;

  // Call AI (Gemini or OpenAI)
  const response = await this.callAI(prompt);
  return JSON.parse(response);
}
```

#### 2.2 `/waste` Command Handler

**Purpose:** Log waste and decrement ingredient inventory.

**AI Prompt:**
```typescript
const wastePrompt = `Extract waste information from: "${text}"

Return JSON:
{
  "items": [
    {
      "name": "product or ingredient name",
      "quantity": 5,
      "unit": "pieces",
      "reason": "burnt"
    }
  ]
}`;
```

**Service:**
```typescript
export class WasteLoggingService {
  async processWasteCommand(
    text: string,
    whatsappNumber: string
  ): Promise<{ success: boolean; message: string }> {
    // 1. AI extraction
    const aiService = new AIService();
    const extracted = await aiService.analyzeWasteMessage(text);
    
    // 2. For each item, decrement inventory
    const results = [];
    for (const item of extracted.items) {
      // Try to find as product first, then ingredient
      let decremented = false;
      
      // Check if it's a product
      const product = await findProductByName(item.name);
      if (product && product.ingredients.length > 0) {
        // Decrement ingredients for this product
        for (const ing of product.ingredients) {
          await decrementIngredientStock(
            ing.ingredient,
            ing.quantity * item.quantity,
            ing.unit
          );
        }
        decremented = true;
      } else {
        // Check if it's an ingredient
        const ingredient = await findIngredientByName(item.name);
        if (ingredient) {
          await decrementIngredientStock(
            ingredient._id,
            item.quantity,
            item.unit
          );
          decremented = true;
        }
      }
      
      if (decremented) {
        // Log waste entry
        await createWasteLog({
          itemName: item.name,
          quantity: item.quantity,
          unit: item.unit,
          reason: item.reason,
          loggedBy: whatsappNumber,
          loggedAt: new Date(),
        });
        results.push(`✅ ${item.quantity} ${item.unit} ${item.name} (${item.reason})`);
      } else {
        results.push(`❌ ${item.name} not found`);
      }
    }
    
    return {
      success: true,
      message: `Waste Logged:\n${results.join('\n')}`,
    };
  }
}
```

#### 2.3 `/expiry` Command Handler

**Purpose:** Check ingredient expiry dates.

**Service:**
```typescript
export class ExpiryCheckService {
  async processExpiryCommand(
    itemName?: string,
    whatsappNumber: string
  ): Promise<{ message: string }> {
    if (itemName) {
      // Check specific item
      const lots = await findIngredientLotsByName(itemName);
      const expiringSoon = lots.filter(lot => {
        const daysUntilExpiry = differenceInDays(lot.expiryDate, new Date());
        return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
      });
      
      if (expiringSoon.length === 0) {
        return { message: `✅ ${itemName} - No items expiring in the next 7 days.` };
      }
      
      const list = expiringSoon.map(lot => 
        `• ${lot.quantity} ${lot.unit} - Expires: ${format(lot.expiryDate, 'MMM dd, yyyy')} (${differenceInDays(lot.expiryDate, new Date())} days)`
      ).join('\n');
      
      return { message: `⚠️ ${itemName} - Expiring Soon:\n${list}` };
    } else {
      // Top 5 expiring soonest
      const top5 = await findTopExpiringIngredients(5);
      
      if (top5.length === 0) {
        return { message: `✅ No ingredients expiring in the next 7 days.` };
      }
      
      const list = top5.map(item => 
        `• ${item.ingredientName}: ${item.quantity} ${item.unit} - ${format(item.expiryDate, 'MMM dd')} (${item.daysLeft} days)`
      ).join('\n');
      
      return { message: `⚠️ Top 5 Expiring Ingredients:\n${list}` };
    }
  }
}
```

---

### Phase 3: Data Models

#### 3.1 Ingredient Lot Model

```typescript
// server/lib/models/ingredientLot.model.ts
export interface IngredientLotData {
  lotId: string; // Auto-generated: "LOT-0001"
  ingredient: mongoose.Types.ObjectId; // Reference to Ingredient
  quantity: number;
  unit: string;
  expiryDate: Date;
  purchaseDate?: Date;
  supplier?: string;
  cost?: number;
  currentStock: number; // Remaining quantity in this lot
}

const ingredientLotSchema = new mongoose.Schema({
  lotId: { type: String, unique: true },
  ingredient: { type: mongoose.Schema.Types.ObjectId, ref: "Ingredient", required: true },
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  purchaseDate: { type: Date },
  supplier: { type: String },
  cost: { type: Number },
  currentStock: { type: Number, required: true, min: 0 },
}, { timestamps: true });
```

#### 3.2 Waste Log Model

```typescript
// server/lib/models/wasteLog.model.ts
export interface WasteLogData {
  wasteId: string; // "WASTE-0001"
  itemName: string; // Product or ingredient name
  quantity: number;
  unit: string;
  reason: string; // "burnt", "expired", "damaged", etc.
  loggedBy: string; // WhatsApp number or user ID
  loggedAt: Date;
  cost?: number; // Estimated cost of waste
}
```

#### 3.3 Bake Sheet Model

```typescript
// server/lib/models/bakeSheet.model.ts
export interface BakeSheetData {
  sheetId: string; // "BAKE-2024-01-15"
  date: string; // YYYY-MM-DD
  items: Array<{
    productId: mongoose.Types.ObjectId;
    productName: string;
    quantity: number;
  }>;
  source: 'whatsapp' | 'manual';
  whatsappNumber?: string;
  status: 'draft' | 'confirmed' | 'completed';
  createdAt: Date;
}
```

#### 3.4 Command Log Model

```typescript
// server/lib/models/commandLog.model.ts
export interface CommandLogData {
  logId: string; // "LOG-0001"
  messageId: mongoose.Types.ObjectId; // Reference to WhatsAppMessage
  command: string; // "batch", "waste", "expiry", or button_id
  input: string; // Original message/input
  output: string; // AI response or system response
  whatsappNumber: string;
  executedAt: Date;
  aiUsed: boolean;
  tokensUsed?: number; // For cost tracking
}
```

---

### Phase 4: Frontend UI

#### 4.1 Daily Bake Sheet Page

**Route:** `/bake-sheet`

**Features:**
- Default view: Today + Tomorrow summary
- Date picker to view any date or date range
- List of orders for selected date(s)
- Aggregated products and quantities (day-by-day for small ranges, summary for large)
- Total ingredients required with stock status
- Visual indicators for insufficient stock (red/yellow)
- Can be accessed via WhatsApp: `/bakesheet [natural language date]`
- **No date range limits** - supports any range

**Dashboard Widget (NEW):**
- Show today's bake sheet summary
- Quick view of products and quantities for today
- Click to go to full bake sheet page
- Place alongside existing dashboard widgets

**Component Structure:**
```typescript
// client/app/(root)/bake-sheet/page.tsx
export default function BakeSheetPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bakeSheets, setBakeSheets] = useState<BakeSheet[]>([]);
  
  return (
    <div>
      <DatePicker value={selectedDate} onChange={setSelectedDate} />
      <BakeSheetSummary date={selectedDate} />
      <BakeSheetList date={selectedDate} />
    </div>
  );
}
```

#### 4.2 Expiry Page

**Route:** `/expiry`

**Features:**
- List of all ingredients with expiry tracking
- Filter by "Expiring Soon" (7 days)
- Sort by expiry date
- Visual indicators (red for urgent, yellow for warning)
- Search by ingredient name

**Dashboard Widget (NEW):**
- Show top 5 expiring ingredients (expiring within 7 days)
- Visual indicators (red for urgent, yellow for warning)
- Click to go to full expiry page
- Place alongside existing dashboard widgets

#### 4.3 Logs Page

**Route:** `/logs`

**Features:**
- List of all command interactions
- Filter by command type (batch/waste/expiry)
- Search by date range
- Show input/output for each command
- Show AI token usage (if tracked)
- Link to related WhatsApp message

---

## 🤔 Questions & Considerations

### 1. **Twilio Interactive Buttons**
- **Question:** Do you want to use Twilio Content Templates (requires setup) or simple text menu?
- **Recommendation:** Start with text menu, upgrade later if needed.

### 2. **Ingredient Lots vs Current Stock - EXPLANATION**

**What is Lot-Based Tracking?**
Lot-based tracking means tracking ingredients by individual batches/lots, each with its own:
- Purchase date
- Expiry date
- Quantity
- Supplier
- Cost

**Example:**
- You buy 10kg of flour on Jan 1 (expires Jan 30) → Lot 1
- You buy 5kg of flour on Jan 15 (expires Feb 14) → Lot 2
- Current system: Just tracks total (15kg flour)
- Lot-based: Tracks each purchase separately with expiry dates

**Why Use Lots?**
- Know which batch expires first (FIFO - First In First Out)
- Track expiry dates per batch
- Better inventory management
- Can see which supplier provided which batch

**Implementation Strategy:**
- Keep `Ingredient.currentStock` = Total available (sum of all lots) - for quick lookups
- Add `IngredientLot` model = Individual batches with expiry dates
- When deducting stock: Deduct from oldest lot first (FIFO)
- When checking expiry: Check individual lots, not just total

**Current State:** Your `Ingredient` model has `currentStock` but no lot tracking yet. We'll add lots as a new feature while keeping current stock for backward compatibility.

### 3. **POS System Integration - CLARIFIED**
- **Answer:** Yes! This project IS a POS system (Point of Sale system for bakery).
- **Current System:** Already has ingredient stock management (`Ingredient.currentStock`)
- **Waste Decrement:** Will use the existing ingredient stock system (decrement `currentStock` directly)
- **No External API Needed:** Everything is integrated within this POS system

### 4. **Forwarded Messages Format - MVP DECISION**
- **Answer:** Single forwarded message for MVP
- **How it works:**
  - User forwards one message containing multiple orders
  - User types: `/batch [paste forwarded message]`
  - System extracts all orders from that single message
  - Future: Can add support for multiple separate messages later

### 5. **Dashboard Integration - UPDATED REQUIREMENTS**

**Current Dashboard Widgets (Keep):**
- SummarySales
- ProductPerformanceSection
- RecentOrdersSection

**New Widgets to Add:**
- **Expiring Ingredients Widget** - Shows top 5 ingredients expiring soon (7 days)
- **Today's Bake Sheet Widget** - Shows today's bake list summary

**Dashboard Layout:**
```
┌─────────────────────────────────────┐
│  SummarySales (Keep)                 │
├─────────────────────────────────────┤
│  ProductPerformance  │ RecentOrders │
│  (Keep)              │ (Keep)        │
├─────────────────────────────────────┤
│  Today's Bake Sheet  │ Expiring      │
│  (NEW)               │ Ingredients   │
│                      │ (NEW)         │
└─────────────────────────────────────┘
```

**Future Widgets (Not in MVP):**
- Recent Waste Logs
- Recent Command Logs

---

## 📊 Cost Optimization Strategy

### Token Savings:
1. **Greetings:** 0 tokens (hard-coded response)
2. **Button Clicks:** 0 tokens (routing only)
3. **Commands:** ~500-1000 tokens (focused prompts)
4. **Orders:** ~1000-2000 tokens (existing flow)

### Estimated Savings:
- **Before:** Every message = ~1500 tokens
- **After:** ~30% of messages (greetings) = 0 tokens
- **Savings:** ~30% reduction in AI costs

---

## 🚀 Implementation Order

1. **Phase 1:** Router + Greeting Menu (No AI calls)
2. **Phase 2:** Command Handlers (/order, /batch, /waste, /expiry)
3. **Phase 3:** Data Models (IngredientLot, WasteLog, BakeSheet, CommandLog)
4. **Phase 4:** Frontend UI (Bake Sheet, Expiry, Logs pages)
5. **Phase 5:** Dashboard Integration

---

## 💡 Brainstorming Points

### Alternative Approaches:

1. **Menu System:**
   - **Option A:** Text-based menu with full commands (user types "/batch", "/waste", etc.)
   - **Option B:** Twilio Content Templates with actual buttons (requires setup)
   - **Option C:** Numbered menu (user types "1", "2", "3", "4" - we interpret as commands)

2. **Batch Processing:**
   - **Option A:** Single AI call for all forwarded messages
   - **Option B:** Process each forwarded message separately, then aggregate
   - **Recommendation:** Option A (more efficient)

3. **Expiry Tracking:**
   - **Option A:** Manual entry when receiving ingredients
   - **Option B:** Auto-calculate from purchase date + shelf life
   - **Option C:** Barcode scanning integration (future)

4. **Waste Logging:**
   - **Option A:** Decrement from ingredient stock directly
   - **Option B:** Create "waste" transactions that affect stock
   - **Recommendation:** Option B (better audit trail)

---

## ❓ Questions for You

1. **Bakery Agent Name:** Choose a name for the WhatsApp bot
   - Suggestions: 'BakeBot', 'BakeBot', 'BakeryAssistant', 'BakeBuddy', 'SweetAssistant', 'BakeryHelper'
   - **Default:** 'BakeBot' (can be changed)
   
2. **Menu Type:** ✅ **DECIDED - Option A (Simple Text Menu)**
   - User types full commands: "/bakesheet", "/waste", "/expiry", "/order"
   - Simple, no setup required
   - Can upgrade to buttons later if needed
   
3. **`/bakesheet` Command:** ✅ **REVISED**
   - Replaces `/batch` (backward compatible - `/batch` still works)
   - Purpose: Summarize orders for a date and show ingredients needed
   - Usage: `/bakesheet`, `/bakesheet today`, `/bakesheet tomorrow`, `/bakesheet 2024-01-15`
   - Shows: Orders count, products needed, ingredients required, stock status
4. **Ingredient Lots:** ✅ **CLARIFIED**
   - Will add lot-based tracking as new feature
   - Keeps existing `currentStock` for backward compatibility
   - Lots track individual batches with expiry dates
   - See "Lot-Based Tracking Explanation" section above
   
5. **POS Integration:** ✅ **CLARIFIED**
   - This project IS the POS system
   - Waste decrement uses existing ingredient stock system
   - No external API needed
   
6. **Forwarded Messages:** ✅ **NOT NEEDED - `/bakesheet` works differently**
   - `/bakesheet` queries existing orders from database by date
   - No need to forward messages
   - Just specify date: `/bakesheet today` or `/bakesheet tomorrow`
   - User forwards one message with multiple orders
   - Type: `/batch [paste forwarded message]`
   - Can add multiple message support later
   
7. **Dashboard Widgets:** ✅ **DECIDED**
   - Keep existing: SummarySales, ProductPerformance, RecentOrders
   - Add: Expiring Ingredients widget (top 5)
   - Add: Today's Bake Sheet widget

---

## 📝 Next Steps

Once you confirm:
1. Preferred approach for interactive buttons
2. Whether to implement ingredient lots now or later
3. Any specific requirements for the commands
4. Dashboard widget priorities

I'll create a detailed implementation plan and start coding! 🚀

---

## 💻 Complete Code Preview

### Router Service (Complete Implementation)

```typescript
// server/lib/services/messageRouter.service.ts
export type MessageRoute = 
  | { type: 'greeting'; shouldCallAI: false }
  | { type: 'command'; command: 'order' | 'bakesheet' | 'waste' | 'expiry'; args: string; shouldCallAI: true }
  | { type: 'button_click'; buttonId: string; shouldCallAI: false }
  | { type: 'order'; shouldCallAI: true };

export class MessageRouterService {
  // Bakery agent name - can be customized
  private agentName = 'BakeBot'; // Selected: 'BakeBot'
  private greetingPatterns = ['hi', 'hello', 'hey', 'menu', 'help'];
  
  routeMessage(body: string, buttonId?: string): MessageRoute {
    const normalizedBody = body.toLowerCase().trim();
    
    // 1. Check for button click (from webhook payload - if using Option B)
    if (buttonId) {
      return { type: 'button_click', buttonId, shouldCallAI: false };
    }
    
    // 2. Check for greetings
    if (this.greetingPatterns.some(pattern => normalizedBody.includes(pattern))) {
      return { type: 'greeting', shouldCallAI: false };
    }
    
    // 3. Check for numbered menu responses (Option C - not selected but code ready)
    if (/^[1-4]$/.test(normalizedBody)) {
      const menuMap: Record<string, 'order' | 'bakesheet' | 'waste' | 'expiry'> = {
        '1': 'bakesheet',
        '2': 'waste',
        '3': 'expiry',
        '4': 'order',
      };
      return {
        type: 'command',
        command: menuMap[normalizedBody],
        args: '',
        shouldCallAI: true,
      };
    }
    
    // 4. Check for slash commands
    if (body.startsWith('/')) {
      const [command, ...args] = body.slice(1).split(' ');
      if (['order', 'bakesheet', 'waste', 'expiry'].includes(command)) {
        return { 
          type: 'command', 
          command: command as 'order' | 'bakesheet' | 'waste' | 'expiry',
          args: args.join(' '),
          shouldCallAI: true 
        };
      }
    }
    
    // 5. Default: treat as order (existing behavior - no change)
    // This means if user just sends "chiffon 1 cheesecake 1" without any command,
    // it will be processed as a regular order (current behavior)
    return { type: 'order', shouldCallAI: true };
  }
}
```

### Menu Helper Functions

```typescript
// server/lib/utils/menuHelpers.ts

// Option A: Text menu with full commands (SELECTED FOR MVP)
const AGENT_NAME = 'BakeBot'; // Selected: 'BakeBot'

export function getGreetingMenuOptionA(): string {
  return `🍰 *Welcome to ${AGENT_NAME}*

What would you like to do?

1️⃣ *Bake List* - Type: /batch [forwarded messages]
2️⃣ *Log Waste* - Type: /waste [item] [quantity] [reason]
3️⃣ *Check Expiry* - Type: /expiry [item?]
4️⃣ *Add Order* - Type: /order [your order details]

Or simply send your order without /order! 📝`;
}

// Option C: Numbered menu (user types 1, 2, 3, 4)
export function getGreetingMenuOptionC(): string {
  return `🍰 *Welcome to Bakery Manager*

What would you like to do? Type the number:

1️⃣ Bake List
2️⃣ Log Waste
3️⃣ Check Expiry
4️⃣ Add Order

Or simply send your order! 📝`;
}

// Button click handlers (if using Option B - Twilio Content Templates)
export async function handleButtonClick(
  buttonId: string,
  whatsappNumber: string
): Promise<string> {
  const buttonMap: Record<string, () => Promise<string>> = {
    'cmd_batch': async () => {
      return `📋 *Bake List*\n\nPlease forward the order messages you want to aggregate, then type:\n/batch [paste forwarded messages]`;
    },
    'cmd_waste': async () => {
      return `🗑️ *Log Waste*\n\nType:\n/waste [item] [quantity] [reason]\n\nExample: /waste 5 croissants burnt`;
    },
    'cmd_expiry': async () => {
      return `📅 *Check Expiry*\n\nType:\n/expiry [item?]\n\nExample: /expiry flour\nOr just /expiry for top 5 expiring items`;
    },
    'cmd_order': async () => {
      return `📝 *Add Order*\n\nType:\n/order [your order details]\n\nExample: /order chiffon 1 cheesecake 1\n\nOr simply send your order without /order!`;
    },
  };
  
  const handler = buttonMap[buttonId];
  if (handler) {
    return await handler();
  }
  
  return '❌ Unknown command. Type "menu" to see options.';
}
```

### Updated Webhook Handler (Complete)

```typescript
// server/server.ts - Updated webhook endpoint

app.post("/api/twilio/webhook", async (req: Request, res: Response) => {
  try {
    // Validate webhook signature
    const isValid = validateTwilioWebhook(req);
    if (!isValid) {
      console.warn("❌ Invalid Twilio webhook signature");
      return res.status(403).json({
        error: "Invalid webhook signature",
      });
    }

    // Extract message data from Twilio webhook
    const { MessageSid, From, To, Body, ButtonId } = req.body;

    console.log("📱 Received WhatsApp message:", {
      MessageSid,
      From,
      To,
      Body: Body?.substring(0, 100),
      ButtonId, // Will be present if user clicked a button (Option B)
    });

    // Store message in database
    const messageData = {
      messageId: MessageSid,
      from: From,
      to: To,
      body: Body || "",
      analyzed: false,
    };

    const savedMessage = await createWhatsAppMessage(messageData);

    // Route message
    const router = new MessageRouterService();
    const route = router.routeMessage(Body || "", ButtonId);

    let responseMessage: string;
    let shouldLogCommand = false;

    if (route.type === 'greeting') {
      // No AI call - just return menu (Option A selected)
      responseMessage = getGreetingMenuOptionA();
      console.log("✅ Greeting detected - returning menu (0 tokens)");
      
    } else if (route.type === 'button_click') {
      // Handle button click (Option B - Twilio Content Templates)
      responseMessage = await handleButtonClick(route.buttonId, From);
      shouldLogCommand = true;
      console.log(`✅ Button click: ${route.buttonId} (0 tokens)`);
      
    } else if (route.type === 'command') {
      shouldLogCommand = true;
      
      if (route.command === 'order') {
        // /order command uses same flow as regular order
        const orderText = route.args || Body || "";
        const processResult = await processWhatsAppMessageForOrder(
          orderText,
          From,
          savedMessage._id.toString(),
          MessageSid
        );
        responseMessage = processResult.whatsappResponse || "Order received.";
        console.log(`✅ /order command processed`);
        
      } else {
        // Other commands (batch, waste, expiry)
        responseMessage = await handleCommand(
          route.command,
          route.args,
          From,
          savedMessage._id.toString()
        );
        console.log(`✅ /${route.command} command processed`);
      }
      
    } else {
      // Regular order processing (existing flow - DEFAULT BEHAVIOR)
      // This happens when user sends plain message like "chiffon 1 cheesecake 1"
      // No command, no greeting - just regular order (current behavior)
      const processResult = await processWhatsAppMessageForOrder(
        Body || "",
        From,
        savedMessage._id.toString(),
        MessageSid
      );
      responseMessage = processResult.whatsappResponse || "Message received.";
      console.log("✅ Regular order processed (default behavior)");
    }

    // Log command interaction (for logs page)
    if (shouldLogCommand) {
      await createCommandLog({
        messageId: savedMessage._id.toString(),
        command: route.type === 'command' ? route.command : route.buttonId || 'unknown',
        input: Body || "",
        output: responseMessage,
        whatsappNumber: From,
        aiUsed: route.shouldCallAI || false,
      });
    }

    // Respond to Twilio
    res.status(200).type("text/xml").send(`
      <Response>
        <Message>${responseMessage}</Message>
      </Response>
    `);
    
  } catch (error) {
    console.error("Error processing Twilio webhook:", error);
    res.status(200).type("text/xml").send("<Response></Response>");
  }
});
```

### Command Handler Dispatcher

```typescript
// server/lib/actions/whatsappRouter.action.ts

import { BatchProcessingService } from "../services/batchProcessing.service";
import { WasteLoggingService } from "../services/wasteLogging.service";
import { ExpiryCheckService } from "../services/expiryCheck.service";

export async function handleCommand(
  command: 'bakesheet' | 'waste' | 'expiry',
  args: string,
  whatsappNumber: string,
  messageId: string
): Promise<string> {
  try {
    switch (command) {
      case 'bakesheet':
        const bakeSheetService = new BakeSheetService();
        const bakeSheetResult = await bakeSheetService.processBakeSheetCommand(args, whatsappNumber);
        return bakeSheetResult.message;
        
      case 'waste':
        const wasteService = new WasteLoggingService();
        const wasteResult = await wasteService.processWasteCommand(args, whatsappNumber);
        return wasteResult.message;
        
      case 'expiry':
        const expiryService = new ExpiryCheckService();
        const expiryResult = await expiryService.processExpiryCommand(
          args.trim() || undefined,
          whatsappNumber
        );
        return expiryResult.message;
        
      default:
        return '❌ Unknown command. Type "menu" to see options.';
    }
  } catch (error: any) {
    console.error(`Error handling /${command} command:`, error);
    return `❌ Error processing /${command} command: ${error.message}`;
  }
}
```

---

## 🎯 Summary of Changes

### What's New:
1. ✅ **Router Service** - Routes messages before AI calls
2. ✅ **Menu System** - Three options (A, B, C) for user interaction
3. ✅ **`/order` Command** - Explicit command for adding orders
4. ✅ **Numbered Menu Support** - Users can type "1", "2", "3", "4"
5. ✅ **Command Logging** - All commands logged for logs page

### Menu Options Comparison:

| Feature | Option A (Text) | Option B (Buttons) | Option C (Numbers) |
|---------|----------------|-------------------|-------------------|
| **Setup Complexity** | ⭐ Easy | ⭐⭐⭐ Complex | ⭐ Easy |
| **User Experience** | ⭐⭐ Good | ⭐⭐⭐ Best | ⭐⭐⭐ Great |
| **Cost** | FREE | FREE | FREE |
| **User Types** | "/batch" | Clicks button | "1" |
| **Implementation** | ✅ Ready | ⚠️ Needs setup | ✅ Ready |

**Decision:** ✅ **Using Option A (Simple Text Menu)** for MVP. 
- Users type full commands: `/batch`, `/waste`, `/expiry`, `/order`
- No setup required
- Can upgrade to buttons (Option B) later if needed

---

---

## ✅ Final Decisions Summary

1. **Agent Name:** ✅ **'BakeBot'** (selected)
2. **Menu Type:** Option A - Simple Text Menu (users type full commands)
3. **Default Behavior:** Plain messages (no command) = Regular order processing (existing behavior)
4. **POS System:** This project IS the POS system - no external API needed
5. **Forwarded Messages:** Single message for MVP
6. **Dashboard:** Keep existing widgets + Add Expiring Ingredients + Today's Bake Sheet
7. **Lot-Based Tracking:** Will be added as new feature, keeps existing `currentStock` for compatibility

---

## 📝 Implementation Notes

- **No Breaking Changes:** Default order behavior remains the same
- **Cost Optimization:** Greetings = 0 tokens (hard-coded menu)
- **Backward Compatible:** Existing order flow unchanged
- **MVP Focus:** Simple text menu, single forwarded message, basic dashboard widgets

Ready to implement! 🚀
