# WhatsApp Stock Addition - Simple & Smart Preview

## 🎯 Goal
Make it **super easy** to add stock via WhatsApp with **minimal input** while keeping flexibility.

---

## 💡 Solution: Smart Defaults + AI Parsing

### User Experience Flow

**Simple Input (Most Common):**
```
User: "/stock 10kg flour"
Bot: ✅ Added 10kg All-Purpose Flour
     Expiry: Feb 15, 2024 (30 days from today)
     Stock updated: 15kg total
```

**With Expiry Override:**
```
User: "/stock 5kg eggs expires in 7 days"
Bot: ✅ Added 5kg Eggs
     Expiry: Jan 22, 2024 (7 days from today)
     Stock updated: 20kg total
```

**Natural Language (AI Parsing):**
```
User: "just received 3kg sugar, expires next month"
Bot: ✅ Added 3kg Granulated Sugar
     Expiry: Feb 15, 2024 (30 days from today)
     Stock updated: 8kg total
```

---

## 🛠️ Implementation Strategy

### 1. New WhatsApp Command: `/stock` or `/addstock`

**Command Format:**
```
/stock [quantity] [ingredient name] [optional: expiry info]
```

**Examples:**
- `/stock 10kg flour`
- `/stock 5 eggs expires in 7 days`
- `/stock 2kg sugar`
- `received 3kg butter` (natural language, AI parses)

---

## 2. Smart Defaults System

### 2.1 Default Expiry Days per Ingredient Type

**Create a default expiry configuration:**

```typescript
// server/lib/config/ingredientDefaults.ts
export const DEFAULT_EXPIRY_DAYS: Record<string, number> = {
  // Dairy
  "egg": 30,
  "eggs": 30,
  "milk": 7,
  "butter": 14,
  "cream": 7,
  "cheese": 14,
  
  // Flour & Grains
  "flour": 180,  // 6 months
  "sugar": 365,  // 1 year
  "salt": 365,
  
  // Leavening
  "yeast": 90,
  "baking powder": 180,
  "baking soda": 180,
  
  // Flavorings
  "vanilla": 365,
  "cocoa": 365,
  "chocolate": 180,
  
  // Default fallback
  "default": 30,  // 30 days if not specified
};
```

**How it works:**
1. User says: `/stock 10kg flour`
2. System finds "flour" → default expiry: 180 days
3. Calculates: Today + 180 days = expiry date
4. Creates lot automatically

---

## 3. AI-Powered Parsing

### 3.1 Extract Information from Natural Language

**AI Prompt:**
```typescript
// Extract from: "/stock 10kg flour expires in 7 days"
// or: "just received 5kg sugar"

{
  "ingredientName": "flour",  // Match to existing ingredient
  "quantity": 10,
  "unit": "kg",
  "expiryDays": 7,  // If specified, otherwise use default
  "expiryDate": null,  // Calculate from expiryDays
  "supplier": null,  // Optional
  "cost": null  // Optional
}
```

**AI Service Method:**
```typescript
// server/lib/services/ai.service.ts
async parseStockAddition(message: string): Promise<{
  ingredientName: string;
  quantity: number;
  unit: string;
  expiryDays?: number;  // If user specified
  supplier?: string;
  cost?: number;
}> {
  // Use AI to extract from natural language
  // Examples:
  // "10kg flour" → { ingredientName: "flour", quantity: 10, unit: "kg" }
  // "5 eggs expires in 7 days" → { ingredientName: "eggs", quantity: 5, unit: "pieces", expiryDays: 7 }
  // "just received 3kg sugar" → { ingredientName: "sugar", quantity: 3, unit: "kg" }
}
```

---

## 4. Backend Implementation

### 4.1 New Service: `StockAdditionService`

```typescript
// server/lib/services/stockAddition.service.ts
import { AIService } from "./ai.service";
import Ingredient from "../models/ingredient.model";
import IngredientLot from "../models/ingredientLot.model";
import { DEFAULT_EXPIRY_DAYS } from "../config/ingredientDefaults";
import { addDays } from "date-fns";

export class StockAdditionService {
  private aiService = new AIService();

  async processStockAddition(
    message: string,
    whatsappNumber: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Parse user input with AI
      const parsed = await this.aiService.parseStockAddition(message);
      
      // 2. Find ingredient (fuzzy match)
      const ingredient = await this.findIngredient(parsed.ingredientName);
      if (!ingredient) {
        return {
          success: false,
          message: `❌ Ingredient "${parsed.ingredientName}" not found. Please check the name.`,
        };
      }

      // 3. Calculate expiry date
      const expiryDate = this.calculateExpiryDate(
        ingredient.name,
        parsed.expiryDays
      );

      // 4. Create lot
      const lot = await IngredientLot.create({
        ingredient: ingredient._id,
        quantity: parsed.quantity,
        unit: parsed.unit || ingredient.unit,
        expiryDate: expiryDate,
        purchaseDate: new Date(),
        supplier: parsed.supplier,
        cost: parsed.cost,
        currentStock: parsed.quantity,  // New lot, full quantity available
      });

      // 5. Update ingredient total stock
      ingredient.currentStock += parsed.quantity;
      await ingredient.save();

      // 6. Format response
      const expiryDays = this.getDaysUntilExpiry(expiryDate);
      return {
        success: true,
        message: `✅ Added ${parsed.quantity}${parsed.unit || ingredient.unit} ${ingredient.name}\n` +
                 `📦 Lot ID: ${lot.lotId}\n` +
                 `📅 Expiry: ${this.formatDate(expiryDate)} (${expiryDays} days)\n` +
                 `📊 Total Stock: ${ingredient.currentStock}${ingredient.unit}`,
      };
    } catch (error: any) {
      console.error("Error processing stock addition:", error);
      return {
        success: false,
        message: `❌ Error: ${error.message}`,
      };
    }
  }

  private async findIngredient(name: string) {
    // Fuzzy match ingredient name
    const ingredients = await Ingredient.find({
      name: { $regex: new RegExp(name, "i") },
    });
    return ingredients[0] || null;
  }

  private calculateExpiryDate(
    ingredientName: string,
    customExpiryDays?: number
  ): Date {
    if (customExpiryDays) {
      return addDays(new Date(), customExpiryDays);
    }

    // Find default expiry for this ingredient
    const lowerName = ingredientName.toLowerCase();
    for (const [key, days] of Object.entries(DEFAULT_EXPIRY_DAYS)) {
      if (lowerName.includes(key)) {
        return addDays(new Date(), days);
      }
    }

    // Fallback to default
    return addDays(new Date(), DEFAULT_EXPIRY_DAYS.default);
  }

  private getDaysUntilExpiry(expiryDate: Date): number {
    return Math.ceil(
      (expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}
```

---

## 5. Update Message Router

### 5.1 Add `/stock` Command

```typescript
// server/lib/services/messageRouter.service.ts
routeMessage(body: string, buttonId?: string): MessageRoute {
  const normalizedBody = body.toLowerCase().trim();

  // Check for slash commands
  if (body.startsWith('/')) {
    const [command, ...args] = body.slice(1).split(' ');
    
    if (command === 'stock' || command === 'addstock') {
      return {
        type: 'command',
        command: 'stock',
        args: args.join(' '),
        shouldCallAI: true
      };
    }
    
    // ... existing commands
  }
  
  // Natural language detection (optional)
  if (this.isStockAdditionMessage(normalizedBody)) {
    return {
      type: 'command',
      command: 'stock',
      args: body,
      shouldCallAI: true
    };
  }
  
  // ... rest of routing
}

private isStockAdditionMessage(message: string): boolean {
  const keywords = ['received', 'stock', 'delivery', 'arrived', 'new'];
  return keywords.some(keyword => message.includes(keyword));
}
```

### 5.2 Update Router Action

```typescript
// server/lib/actions/whatsappRouter.action.ts
export async function handleCommand(
  command: "bakesheet" | "waste" | "expiry" | "stock",  // Add "stock"
  args: string,
  whatsappNumber: string,
  messageId: string
): Promise<string> {
  try {
    switch (command) {
      // ... existing cases
      
      case "stock":
        const stockService = new StockAdditionService();
        const stockResult = await stockService.processStockAddition(
          args,
          whatsappNumber
        );
        return stockResult.message;
        
      // ... rest
    }
  } catch (error: any) {
    console.error(`Error handling /${command} command:`, error);
    return `❌ Error processing /${command} command: ${error.message}`;
  }
}
```

---

## 6. Update Greeting Menu

```typescript
// server/lib/utils/menuHelpers.ts
export function getGreetingMenu(): string {
  return `🍰 *Welcome to BakeBot*

What would you like to do?

1️⃣ *Add Order* - Send your order (e.g., "2 cheesecake, 1 chiffon")
2️⃣ *Bake Sheet* - View today's orders and ingredients needed
3️⃣ *Add Stock* - Add new inventory (e.g., "/stock 10kg flour")
4️⃣ *Log Waste* - Record waste (e.g., "/waste 5 croissants burnt")
5️⃣ *Check Expiry* - See expiring ingredients

Type a number, use a command, or just send your order!`;
}
```

---

## 7. User Input Scenarios

### Scenario 1: Minimal Input (Most Common)
```
User: /stock 10kg flour
Bot: ✅ Added 10kg All-Purpose Flour
     📦 Lot ID: LOT-0042
     📅 Expiry: Aug 15, 2024 (180 days)
     📊 Total Stock: 25kg
```

### Scenario 2: With Custom Expiry
```
User: /stock 5 eggs expires in 7 days
Bot: ✅ Added 5 pieces Eggs
     📦 Lot ID: LOT-0043
     📅 Expiry: Jan 22, 2024 (7 days)
     📊 Total Stock: 15 pieces
```

### Scenario 3: Natural Language
```
User: just received 3kg sugar
Bot: ✅ Added 3kg Granulated Sugar
     📦 Lot ID: LOT-0044
     📅 Expiry: Jan 15, 2025 (365 days)
     📊 Total Stock: 8kg
```

### Scenario 4: With Supplier (Optional)
```
User: /stock 2kg butter from ABC supplier
Bot: ✅ Added 2kg Unsalted Butter
     📦 Lot ID: LOT-0045
     📅 Expiry: Jan 29, 2024 (14 days)
     📊 Total Stock: 4kg
     🏪 Supplier: ABC supplier
```

---

## 8. Default Expiry Configuration

### 8.1 Per-Ingredient Defaults

**File: `server/lib/config/ingredientDefaults.ts`**

```typescript
export const DEFAULT_EXPIRY_DAYS: Record<string, number> = {
  // Dairy (short shelf life)
  "egg": 30,
  "eggs": 30,
  "milk": 7,
  "butter": 14,
  "cream": 7,
  "heavy cream": 7,
  "cheese": 14,
  
  // Flour & Grains (long shelf life)
  "flour": 180,
  "all-purpose flour": 180,
  "bread flour": 180,
  "whole wheat flour": 180,
  "sugar": 365,
  "granulated sugar": 365,
  "brown sugar": 365,
  "powdered sugar": 365,
  "salt": 365,
  
  // Leavening Agents
  "yeast": 90,
  "active dry yeast": 90,
  "instant yeast": 90,
  "baking powder": 180,
  "baking soda": 180,
  
  // Flavorings (very long shelf life)
  "vanilla": 365,
  "vanilla extract": 365,
  "cocoa": 365,
  "cocoa powder": 365,
  "chocolate": 180,
  "chocolate chips": 180,
  
  // Nuts & Seeds
  "almonds": 365,
  "walnuts": 180,
  "pecans": 180,
  
  // Default fallback
  "default": 30,
};

// Helper function to get expiry days for an ingredient
export function getDefaultExpiryDays(ingredientName: string): number {
  const lowerName = ingredientName.toLowerCase();
  
  // Exact match first
  if (DEFAULT_EXPIRY_DAYS[lowerName]) {
    return DEFAULT_EXPIRY_DAYS[lowerName];
  }
  
  // Partial match (e.g., "all-purpose flour" contains "flour")
  for (const [key, days] of Object.entries(DEFAULT_EXPIRY_DAYS)) {
    if (lowerName.includes(key) || key.includes(lowerName)) {
      return days;
    }
  }
  
  // Fallback
  return DEFAULT_EXPIRY_DAYS.default;
}
```

---

## 9. AI Parsing Implementation

### 9.1 Enhanced AI Service

```typescript
// server/lib/services/ai.service.ts
async parseStockAddition(userInput: string): Promise<{
  ingredientName: string;
  quantity: number;
  unit: string;
  expiryDays?: number;
  supplier?: string;
  cost?: number;
}> {
  const prompt = `Extract stock addition information from this message: "${userInput}"

Return JSON with:
- ingredientName: name of ingredient (e.g., "flour", "eggs", "sugar")
- quantity: number (e.g., 10, 5, 2.5)
- unit: unit of measurement (e.g., "kg", "g", "pieces", "L", "ml")
- expiryDays: number of days until expiry (if mentioned, otherwise null)
- supplier: supplier name (if mentioned, otherwise null)
- cost: cost amount (if mentioned, otherwise null)

Examples:
Input: "/stock 10kg flour"
Output: {"ingredientName": "flour", "quantity": 10, "unit": "kg", "expiryDays": null, "supplier": null, "cost": null}

Input: "just received 5 eggs expires in 7 days"
Output: {"ingredientName": "eggs", "quantity": 5, "unit": "pieces", "expiryDays": 7, "supplier": null, "cost": null}

Input: "/stock 2kg butter from ABC supplier $25"
Output: {"ingredientName": "butter", "quantity": 2, "unit": "kg", "expiryDays": null, "supplier": "ABC supplier", "cost": 25}

Now parse: "${userInput}"`;

  // Call AI (Gemini/OpenAI)
  const response = await this.callAI(prompt);
  
  // Parse JSON response
  try {
    const parsed = JSON.parse(response);
    return {
      ingredientName: parsed.ingredientName,
      quantity: parsed.quantity,
      unit: parsed.unit || "pieces",  // Default unit
      expiryDays: parsed.expiryDays || undefined,
      supplier: parsed.supplier || undefined,
      cost: parsed.cost || undefined,
    };
  } catch (error) {
    throw new Error("Failed to parse stock addition information");
  }
}
```

---

## 10. Benefits of This Approach

### ✅ Minimal Input Required
- **Most common**: Just `/stock 10kg flour` (2 pieces of info)
- **Optional**: Add expiry, supplier, cost only when needed

### ✅ Smart Defaults
- System knows eggs = 30 days, flour = 180 days
- No need to specify expiry for common items
- Can override when needed

### ✅ Natural Language Support
- AI understands "just received 5kg sugar"
- Flexible input format
- User-friendly

### ✅ Flexible
- Can add expiry override: "expires in 7 days"
- Can add supplier: "from ABC supplier"
- Can add cost: "$25"
- But none are required!

### ✅ WhatsApp-First
- No need to open POS system
- Quick stock updates via chat
- Perfect for busy bakery staff

---

## 11. Summary

**What User Types:**
- Minimum: `/stock 10kg flour` (just quantity + name)
- Optional: Add expiry, supplier, cost if needed

**What System Does:**
1. AI parses the message
2. Finds ingredient (fuzzy match)
3. Uses default expiry (based on ingredient type)
4. Creates lot automatically
5. Updates total stock
6. Sends confirmation

**Result:**
- ✅ Super simple for users
- ✅ Smart defaults (no expiry needed for common items)
- ✅ Flexible (can override when needed)
- ✅ WhatsApp-first workflow

---

## 12. Next Steps

1. Create `ingredientDefaults.ts` config file
2. Add `parseStockAddition()` to AI service
3. Create `StockAdditionService`
4. Add `/stock` command to router
5. Update greeting menu
6. Test with various input formats

**This gives you the best of both worlds:**
- Simple for daily use (just name + quantity)
- Flexible when needed (custom expiry, supplier, cost)
- Smart defaults (no need to remember expiry dates)
