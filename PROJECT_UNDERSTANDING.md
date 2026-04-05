# Order Shop - Project Understanding & Refactor Plan

## Part 1: What This Project Does

### Overview
Order Shop is a **WhatsApp-integrated Bakery POS System** that allows customers to order bakery items through WhatsApp conversations. The system uses AI (Gemini/OpenAI) to understand natural language orders in Indonesian.

### Core Features

1. **WhatsApp Ordering** - Customers send messages, AI extracts order details
2. **Order Management** - Create, edit, and track orders
3. **Stock Management** - Track ingredients with FIFO/FEFO lot tracking
4. **Delivery Address Memory** - Save customer addresses for future orders

---

## Part 2: Detailed Conversation Flow

### NEW ORDER FLOW

```
┌──────────────────────────────────────────────────────────────────┐
│                    NEW ORDER CONVERSATION                         │
└──────────────────────────────────────────────────────────────────┘

Step 1: Check Existing Orders
│
├── User has existing orders?
│   ├── YES → Ask: "Kamu udah punya pesanan nih. Mau pesan baru atau edit yang ada?"
│   │          pendingQuestion.type = "new_or_edit"
│   │          Wait for response...
│   │
│   │          ├── User says "baru" → Set orderIntent = "new_order"
│   │          │                     Reset collectedData
│   │          │                     Continue to Step 2
│   │          │
│   │          └── User says "edit" → Set orderIntent = "edit_order"
│   │                                → EDIT ORDER FLOW (see below)
│   │
│   └── NO → Set orderIntent = undefined (implicit new order)
│            Continue to Step 2

Step 2: Collect Products
│
├── User sends message (e.g., "chiffon 2, cheesecake 1")
│
│   ├── Call AI to analyze
│   │   ├── Products detected? → Add to collectedData.products
│   │   │
│   │   └── Ambiguous product detected? (e.g., "cake" could be Sweet Cake or Cheesecake)
│   │       ├── YES → pendingQuestion.type = "product_clarification"
│   │       │         Show list: "Untuk 'cake': Sweet Cake (Rp 50k), Cheesecake (Rp 75k)"
│   │       │         Wait for clarification...
│   │       │         User clarifies → Extract exact product → Continue
│   │       │
│   │       └── NO → Continue
│   │
│   └── Products complete? → Check missing fields

Step 3: Collect Fulfillment Type (pickup vs delivery)
│
├── fulfillmentType missing?
│   ├── Ask: "Mau ambil di toko (pickup) atau dikirim (delivery)?"
│   │   pendingQuestion.type = "missing_field", field = "fulfillmentType"
│   │   Wait for response...
│   │
│   ├── User says "pickup" → collectedData.fulfillmentType = "pickup"
│   │                       Skip address collection, continue to Step 5
│   │
│   └── User says "delivery" → collectedData.fulfillmentType = "delivery"
│                              Continue to Step 4

Step 4: Collect Delivery Address
│
├── deliveryAddress missing AND fulfillmentType = "delivery"
│   │
│   ├── Check if customer has saved address
│   │   ├── YES → Ask: "Alamat sebelumnya: [saved address]. Mau pakai itu?"
│   │   │           pendingQuestion.type = "confirm_previous_address"
│   │   │           Wait for response...
│   │   │
│   │   │           ├── User says "ya" → Use saved address + saved pickupTime
│   │   │           │                     Continue to Step 5/6
│   │   │           │
│   │   │           └── User sends new address → AI extracts → Save address
│   │   │                                        Continue
│   │   │
│   │   └── NO → Ask: "Alamat pengirimannya mana?"
│   │             pendingQuestion.type = "missing_field", field = "deliveryAddress"
│   │             Wait for response...
│   │             AI extracts address → Continue

Step 5: Collect Delivery Date
│
├── deliveryDate missing?
│   ├── Ask: "Kapan mau dikirim? (besok, 15 Feb, dll)"
│   │   pendingQuestion.type = "missing_field", field = "deliveryDate"
│   │   Wait for response...
│   │   AI extracts date (e.g., "besok" → tomorrow's date)
│   │   → collectedData.deliveryDate = "2024-02-15"

Step 6: Collect Pickup/Delivery Time
│
├── pickupTime missing?
│   ├── Ask: "Jam berapa mau [dikirim/ambil]? (misal: jam 3 sore)"
│   │   pendingQuestion.type = "missing_field", field = "pickupTime"
│   │   Wait for response...
│   │   AI extracts time → collectedData.pickupTime = "jam 3 sore"

Step 7: Order Complete
│
├── All fields collected?
│   ├── YES → Create order in database
│   │          Save delivery address for future (if delivery)
│   │          Return: "✅ Pesanan O-0501 sudah kami terima!"
│   │
│   └── NO → Continue collecting missing fields
```

### EDIT ORDER FLOW

```
┌──────────────────────────────────────────────────────────────────┐
│                    EDIT ORDER CONVERSATION                        │
└──────────────────────────────────────────────────────────────────┘

Step 1: Select Order
│
├── User chose "edit" from new_or_edit question
│   │
│   ├── Fetch user's existing orders (last 10)
│   │   Show list: "1. O-0499 – Chiffon 2, Cheesecake 1"
│   │               "2. O-0498 – Sweet Cake 3"
│   │   Ask: "Mau edit yang mana?"
│   │   pendingQuestion.type = "order_selection"
│   │   Wait for response...
│   │
│   ├── User says "1" or "O-0499"
│   │   → Set selectedOrderId = "O-0499"
│   │   → Set editMode = "add_items"
│   │   → Show current items + ask: "Mau tambah/ubah apa?"

Step 2: Collect Item Changes
│
├── User sends changes (e.g., "tambah cheesecake 2, hapus chiffon")
│   │
│   ├── Call AI with editOrderContext
│   │   ├── AI extracts products with editIntent:
│   │   │   - "add": quantity = amount to ADD (e.g., tambah 2)
│   │   │   - "subtract": quantity = amount to REMOVE (e.g., kurangin 2)
│   │   │   - "replace": quantity = new total (e.g., "nya 3 aja")
│   │   │   - productsToRemove: ["Chiffon"] (full deletion)
│   │   │
│   │   └── Apply edit intents to current order items:
│   │       Current: Chiffon 2, Cheesecake 1
│   │       After: Chiffon (deleted), Cheesecake 1 + 2 = 3
│   │
│   └── Show proposed summary:
│   │   "Pesanan kamu saat ini (O-0499):
│   │    • Cheesecake: 3 pcs
│   │    Udah benar? Balas ya/betul atau sebut yang mau diubah."
│   │   pendingQuestion.type = "edit_confirm_items"
│   │   Wait for response...
│   │
│   ├── User says "ya/betul" → Continue to Step 3
│   │
│   └── User sends more changes → Re-analyze + update → Show proposed again

Step 3: Pickup vs delivery (canonical — before “sama/ubah” logistics)
│
├── Ask: "Mau ambil di toko (pickup) atau dikirim (delivery)?" (same idea as new order)
│   pendingQuestion.type = "missing_field", field = "fulfillmentType"
│   Wait for response...
│   │
│   ├── User says "pickup" → collectedData.fulfillmentType = "pickup"
│   │                       → Continue to Step 5 (skip saved-address step)
│   │
│   └── User says "delivery" → collectedData.fulfillmentType = "delivery"
│                              → Continue to Step 4

Step 4: Delivery address (only if delivery)
│
├── If customer has saved address:
│   │   Ask: "Mau pakai alamat sebelumnya?"
│   │   pendingQuestion.type = "confirm_previous_address"
│   │   → ya / pakai → use saved address → Continue to Step 5
│   │   → else → collect new address (missing_field deliveryAddress)
│   │
│   └── No saved address → Ask full address (missing_field deliveryAddress)

Step 5: Confirm logistics vs order (sama / ubah)
│
├── Ask: "Tanggal, alamat, jam mau sama aja atau mau ubah?"
│   pendingQuestion.type = "edit_confirm_delivery"
│   Wait for response...
│   │
│   ├── User says "sama"
│   │   → Apply item changes to order (add/remove items)
│   │   → Keep or align delivery details per rules
│   │   → Save → Return confirmation
│   │
│   └── User says "ubah"
│       → Ask: "Kirim alamat/tanggal/jam baru"
│         pendingQuestion.type = "edit_change_delivery"
│         Wait for response...
│         AI extracts new details → Apply all changes → Save → Return confirmation

**Implementation note:** `conversationManager.service.ts` today often jumps from Step 2 (“ya” on items) **straight** to **Step 5** (`edit_confirm_delivery`), **skipping** Steps 3–4. That is a **known bug** relative to this spec; refactor should align code with the steps above.
```

---

## Part 3: Detailed User Response Handling

### How the System Responds to Various User Inputs

#### A. Product Addition Requests
When users want to add menu items, the system handles various scenarios:

**Scenario 1: Direct Product Request**
- Input: "chiffon 2, brownies 1"
- AI Extraction: Identifies "chiffon" (quantity: 2) and "brownies" (quantity: 1)
- Response: Adds items to collectedData.products, continues to next step

**Scenario 2: Ambiguous Product Request**
- Input: "cake 2, cookies 3"
- AI Extraction: Detects ambiguity (multiple cake types, multiple cookie types)
- Response: Enters product_clarification state
- Prompt: "Untuk 'cake': Sweet Cake (Rp 50k), Chocolate Cake (Rp 60k), Red Velvet (Rp 70k). Mana yang kamu maksud?"

**Scenario 3: Quantity Modification**
- Input: "tambah chiffon 2" (while editing)
- AI Extraction: Identifies edit intent (add to existing order)
- Response: Increases chiffon quantity by 2 in the existing order

**Scenario 4: Partial Requests**
- Input: "aku mau pesen sesuatu"
- AI Extraction: May not detect specific products
- Response: Prompts for specific products: "Bisa kamu sebutkan produknya? Misalnya: chiffon, brownies, atau cheesecake"

#### B. Fulfillment Type Responses
- Input: "ambil di toko" → Sets fulfillmentType = "pickup"
- Input: "diantar ke rumah" → Sets fulfillmentType = "delivery"
- Input: "pickup" → Sets fulfillmentType = "pickup"
- Input: "delivery" → Sets fulfillmentType = "delivery"

#### C. Address Handling Responses
- Input: "ya" (when confirming saved address) → Uses saved address
- Input: "tidak" (when confirming saved address) → Prompts for new address
- Input: "Jl. Merdeka No. 10, Jakarta" → Saves new address

#### D. Edit Intent Responses
- Input: "baru" (when asked new or edit) → Resets for new order
- Input: "edit" (when asked new or edit) → Switches to edit flow
- Input: "ya/betul/sip" (when confirming changes) → Accepts proposed changes
- Input: "ganti semua" (during edit) → Clears current items, starts fresh

---

## Part 4: Menu Addition Process

### Adding New Menu Items to the System

#### A. Current Process
1. **Database Update**: Add new product to products collection
2. **AI Training**: Update AI model with new product names and descriptions
3. **Price Integration**: Ensure pricing information is available
4. **Stock Tracking**: Add ingredients to stock management system

#### B. User Interaction with New Menus
When users mention new menu items:

**Case 1: AI Recognizes New Item**
- User: "I want 2 of the new red velvet cake"
- AI: Successfully identifies "red velvet cake" and quantity 2
- System: Adds item to order, continues flow

**Case 2: AI Doesn't Recognize New Item**
- User: "I want the special birthday cake"
- AI: May not recognize "special birthday cake"
- System: May prompt "Aku belum mengenal produk 'special birthday cake'. Produk yang tersedia antara lain: chiffon, brownies, cheesecake"

**Case 3: Similar Name Recognition**
- User: "I want red cake" (when red velvet cake exists)
- AI: May recognize "red" as potential match for "red velvet"
- System: Enters clarification state: "Apakah maksud kamu Red Velvet Cake?"

#### C. Dynamic Menu Handling
The system should be able to handle:
- Seasonal menu items
- Limited edition products
- Price changes
- Availability status (in-stock/out-of-stock)
- Customizable options (size, flavor variations)

---

## Part 5: Current Architecture

### File Structure
```
server/lib/
├── actions/          # Database operations (22 files)
├── models/           # MongoDB schemas (13 files)
├── services/         # Business logic (15 files)
├── utils/            # Helpers (4 files)
└── server.ts         # Express routes (1100+ lines)
```

### Key Files (Current State)

| File | Lines | Purpose |
|------|-------|---------|
| `conversationManager.service.ts` | 2092 | Main conversation logic (TOO BIG) |
| `server.ts` | 1100+ | All API routes (TOO BIG) |
| `ai.service.ts` | 800+ | AI prompt & extraction |
| `order.action.ts` | 400+ | Order CRUD operations |

---

## Part 6: The Problem

### Why It's Hard to Understand

1. **conversationManager.service.ts is 2000+ lines** - Contains:
   - State management
   - AI integration
   - Edit flow logic
   - Product clarification
   - Address confirmation
   - Payment info
   - Debug logging
   - All mixed together!

2. **No clear separation of concerns** - Business logic, state management, and AI prompts are mixed

3. **State management is implicit** - `pendingQuestion.type` has 10 different states, making flow hard to follow

4. **Patching instead of fixing** - Each bug fix adds more complexity instead of simplifying

---

## Part 7: Current State Machine (Hard to Follow)

```
pendingQuestion.type has 10 possible values:
- missing_field
- product_clarification
- new_or_edit
- order_selection
- add_or_change
- edit_follow_up
- edit_change_delivery
- edit_confirm_items
- edit_confirm_delivery
- confirm_previous_address

orderIntent has 2 values:
- new_order
- edit_order

status has 3 values:
- collecting
- completed
- cancelled

editMode has 2 values:
- add_items
- change_items
```

The combination of these states creates **hundreds of possible paths**, making bugs inevitable.

---

## Part 8: Refactor Plan for Flexibility

### Proposed Architecture

```
server/lib/
├── conversation/
│   ├── ConversationMachine.ts           # Orchestrator (~100 lines)
│   ├── states/
│   │   ├── NewOrderCheckState.ts        # Handle "new or edit?" question
│   │   ├── CollectProductsState.ts      # Extract products from message
│   │   ├── ClarifyProductsState.ts      # Handle ambiguous products
│   │   ├── CollectFieldState.ts         # Generic missing field handler
│   │   ├── ConfirmAddressState.ts       # Handle saved address confirmation
│   │   ├── EditSelectOrderState.ts      # Handle order selection for edit
│   │   ├── EditCollectChangesState.ts   # Collect item changes
│   │   ├── EditConfirmItemsState.ts     # Confirm proposed item changes
│   │   ├── EditConfirmDeliveryState.ts  # Confirm/change delivery details
│   │   └── CompleteState.ts             # Finalize and save order
│   ├── transitions/
│   │   ├── transitions.ts               # Define valid state transitions
│   │   └── guards.ts                    # Conditions for transitions
│   └── context/
│       ├── ConversationContext.ts       # Shared state (collectedData, history)
│       └── StateHelpers.ts              # Reusable utilities
│
├── services/
│   ├── AIService.ts                     # AI extraction (unchanged)
│   ├── MessageFormatter.ts              # WhatsApp message formatting
│   └── OrderProcessor.ts                # Create/update orders in DB
│
└── models/
    └── ConversationState.ts             # DB model (unchanged schema)
```

### Key Changes for Flexibility

1. **Explicit State Machine** - Replace implicit `pendingQuestion.type` checks with proper state classes
   - Each state handles ONE thing
   - Clear transitions with guards
   - No hidden branches

2. **State Pattern** - Each state is a class with `handle()` method:
   ```typescript
   interface StateHandler {
     handle(context: ConversationContext, message: string): StateResult
   }
   
   class CollectProductsState implements StateHandler {
     async handle(context, message) → { response, nextState }
   }
   ```

3. **Separation of Concerns**:
   - `ConversationMachine.ts` - orchestration only
   - States - handle specific conversation phases
   - `AIService.ts` - extraction only
   - `OrderProcessor.ts` - database operations

4. **Visual Documentation** - State diagram in this file for reference

### Preview: ConversationMachine.ts

```typescript
class ConversationMachine {
  private state: StateType;
  private context: ConversationContext;

  async processMessage(message: string): Promise<Response> {
    // 1. Route to current state handler
    const handler = this.getStateHandler(this.state);
    
    // 2. Let state handle the message
    const result = await handler.handle(this.context, message);
    
    // 3. Transition if needed
    if (result.nextState) {
      this.transitionTo(result.nextState);
    }
    
    return result.response;
  }

  private getStateHandler(state: StateType): StateHandler {
    switch(state) {
      case 'new_order_check': return new NewOrderCheckState();
      case 'collect_products': return new CollectProductsState();
      case 'clarify_products': return new ClarifyProductsState();
      case 'collect_field': return new CollectFieldState();
      case 'confirm_address': return new ConfirmAddressState();
      case 'edit_select_order': return new EditSelectOrderState();
      case 'edit_collect_changes': return new EditCollectChangesState();
      case 'edit_confirm_items': return new EditConfirmItemsState();
      case 'edit_confirm_delivery': return new EditConfirmDeliveryState();
      case 'complete': return new CompleteState();
    }
  }
}
```

### Preview: CollectProductsState.ts

```typescript
class CollectProductsState implements StateHandler {
  async handle(context: ConversationContext, message: string): StateResult {
    const extracted = await context.aiService.extractProducts(message);
    
    // Handle ambiguous products
    if (extracted.ambiguousProducts.length > 0) {
      context.setPendingClarification(extracted.ambiguousProducts);
      return {
        response: this.formatClarificationMessage(extracted.ambiguousProducts),
        nextState: 'clarify_products'
      };
    }
    
    // Add valid products to context
    context.addProducts(extracted.validProducts);
    
    // Check if all required fields are collected
    if (context.isComplete()) {
      return {
        response: this.formatOrderSummary(context),
        nextState: 'complete'
      };
    }
    
    // Continue collecting missing fields
    const nextField = context.getNextMissingField();
    return {
      response: this.formatFieldRequest(nextField),
      nextState: 'collect_field'
    };
  }

  private formatClarificationMessage(ambiguousProducts: AmbiguousProduct[]): string {
    let message = "Untuk produk yang kamu sebutkan:\n";
    
    for (const ambiguousProduct of ambiguousProducts) {
      message += `\n• '${ambiguousProduct.requestedName}' bisa jadi:\n`;
      for (const option of ambiguousProduct.options) {
        message += `  - ${option.name} (${option.price})\n`;
      }
      message += `  Mana yang kamu maksud?\n`;
    }
    
    return message;
  }
}
```

### Preview: ClarifyProductsState.ts

```typescript
class ClarifyProductsState implements StateHandler {
  async handle(context: ConversationContext, message: string): StateResult {
    const pendingClarifications = context.getPendingClarifications();
    
    // Parse user's clarification response
    const clarifiedProducts = this.parseClarificationResponse(
      message, 
      pendingClarifications
    );
    
    if (clarifiedProducts.length === 0) {
      // User didn't provide clear clarification
      return {
        response: "Mohon sebutkan produk yang kamu maksud secara spesifik. Misalnya: 'chiffon' atau 'cheesecake'",
        nextState: 'clarify_products' // Stay in clarification state
      };
    }
    
    // Add clarified products to context
    context.addProducts(cllarifiedProducts);
    
    // Clear pending clarifications
    context.clearPendingClarifications();
    
    // Check if all required fields are collected
    if (context.isComplete()) {
      return {
        response: this.formatOrderSummary(context),
        nextState: 'complete'
      };
    }
    
    // Continue collecting missing fields
    const nextField = context.getNextMissingField();
    return {
      response: this.formatFieldRequest(nextField),
      nextState: 'collect_field'
    };
  }

  private parseClarificationResponse(
    message: string, 
    pendingClarifications: AmbiguousProduct[]
  ): Product[] {
    // This method would use AI to parse the user's clarification
    // and match it to the available options
    // Implementation would depend on the specific AI service
    return [];
  }
}
```

### State Transition Diagram (After Refactor)

```
┌─────────────────────────────────────────────────────────────────┐
│                    STATE TRANSITION DIAGRAM                      │
└─────────────────────────────────────────────────────────────────┘

NEW ORDER PATH (canonical: pickup/delivery before address):
────────────────
[new_order_check] ──→ has orders? ──→ [new_or_edit_prompt]
      │                                      │
      │                                      ├─ "baru" ──→ [collect_products]
      │                                      └
      │                                      └─ "edit" ──→ EDIT PATH
      │
      └─ no orders ──→ [collect_products]
                              │
                              ├─ ambiguous? ──→ [clarify_products] ──→ [collect_products]
                              │
                              └─ fields missing ──→ [collect_field] cycle:
                                                    pickup/delivery (fulfillmentType) FIRST
                                                    → if delivery: [confirm_address]? / address field
                                                    → date, time, …
                                                    → [complete]

EDIT ORDER PATH (canonical: items → pickup/delivery → address if delivery → sama/ubah):
────────────────
[edit_select_order] ──→ selected ──→ [edit_collect_changes]
                                            │
                                            ├─ ambiguous? ──→ [clarify_products]
                                            │
                                            └─ has changes ──→ [edit_confirm_items]
                                                                    │
                                                                    ├─ "ya" ──→ [fulfillment_pickup_or_delivery]
                                                                    │                 │
                                                                    │                 ├─ pickup ──→ [edit_confirm_delivery]
                                                                    │                 │
                                                                    │                 └─ delivery ──→ [confirm_address]? / address
                                                                    │                                   │
                                                                    │                                   └─→ [edit_confirm_delivery]
                                                                    │                                             │
                                                                    │                                             ├─ "sama" ──→ [complete]
                                                                    │                                             └
                                                                    │                                             └─ "ubah" ──→ [edit_change_delivery] ──→ [complete]
                                                                    │
                                                                    └─ more changes ──→ [edit_collect_changes]

**Note:** Live code may still shortcut `"ya"` → `[edit_confirm_delivery]` without `[fulfillment_pickup_or_delivery]`; see STATE_MAP / WHATSAPP_FLOW “implementation gap”.
```

---

## Part 9: Benefits of Refactor for Menu Flexibility

### 1. Easy Menu Expansion
- New products can be added to the database without changing conversation logic
- AI service can be trained with new product names separately
- Clarification state automatically handles new ambiguous product names

### 2. Improved User Experience with New Menus
- Better product suggestion when users use similar names
- Clearer clarification prompts for new menu items
- Consistent handling regardless of menu size

### 3. Scalability Considerations
- System can handle hundreds of menu items without performance degradation
- Modular design allows for seasonal menu features
- Easy to add new product categories (drinks, sides, etc.)

### 4. Enhanced Error Handling
- Clearer error messages when new items aren't recognized
- Better fallback options when AI doesn't understand new requests
- Graceful degradation for unrecognized product names

---

## Part 10: Implementation Steps

### Phase 1: Create State Infrastructure
1. Create `conversation/` folder structure
2. Define `StateHandler` interface
3. Create `ConversationContext` class
4. Create state transition definitions

### Phase 2: Extract States
1. Extract `NewOrderCheckState` (lines 136-252)
2. Extract `CollectProductsState` (lines 970-1224)
3. Extract `ClarifyProductsState` (lines 985-1089, 1356-1456)
4. Extract `CollectFieldState` (lines 1825-1926)
5. Extract `ConfirmAddressState` (lines 363-512)
6. Extract edit flow states (lines 254-360, 578-967)

### Phase 3: Create Orchestrator
1. Create `ConversationMachine.ts`
2. Implement state routing
3. Implement transition logic

### Phase 4: Testing
1. Test each state independently
2. Test state transitions
3. Test full conversation flows
4. Test new menu addition scenarios

### Phase 5: Cleanup
1. Remove old `conversationManager.service.ts`
2. Update imports in `server.ts`
3. Remove unused code

---

## Part 11: Key Models Reference

### ConversationState (MongoDB Schema)
```typescript
{
  phoneNumber: string,           // WhatsApp number (unique)
  status: "collecting" | "completed" | "cancelled",
  collectedData: {
    products: [{ name, quantity, confidence, note }],
    deliveryDate: string,        // YYYY-MM-DD
    deliveryAddress: string,
    fulfillmentType: "pickup" | "delivery",
    pickupTime: string,          // e.g., "jam 3 sore"
    productsToRemove: string[]   // For edit flow
  },
  missingFields: string[],       // What's still needed
  orderIntent: "new_order" | "edit_order",
  selectedOrderId: string,       // For edit: which order
  editMode: "add_items" | "change_items",
  pendingQuestion: {
    type: string,                // Current question type
    field: string,               // Which field we're asking about
    questionText: string,
    orderList: [...],            // For order_selection
    previousAddress: string      // For confirm_previous_address
  },
  conversationHistory: [{ role, message, timestamp }],
  orderId: string                // Final order ID (O-0501)
}
```

### Order (MongoDB Schema)
```typescript
{
  orderId: string,               // O-0501
  customerName: string,
  phoneNumber: string,
  items: [{ name, quantity, price, note }],
  subtotal: number,
  tax: number,
  total: number,
  status: "New Order" | "Pending" | "On Process" | "Completed" | "Cancelled",
  pickupDate: Date,
  fulfillmentType: "pickup" | "delivery",
  pickupTime: string,
  deliveryAddress: string,
  source: "manual" | "whatsapp",
  whatsappNumber: string,
  stockCalculationMetadata: {...},
  lotDeductionMetadata: {...}
}
```

---

## Part 12: Future Enhancements for Menu Flexibility

### A. Advanced Menu Features
- **Customizable Products**: Allow users to specify customizations (e.g., "chiffon with strawberry filling")
- **Bundle Deals**: Handle combo meal requests
- **Size Variations**: Support different sizes (small, medium, large)
- **Limited Time Offers**: Promote seasonal items

### B. Enhanced AI Capabilities
- **Natural Language Understanding**: Better comprehension of complex requests
- **Learning from Conversations**: Improve recognition of new product variations
- **Context Awareness**: Remember user preferences for personalized suggestions

### C. Menu Management API
- **Dynamic Menu Updates**: Add/remove products without system restart
- **Pricing Changes**: Real-time price updates
- **Availability Tracking**: Show only available items
- **Category Management**: Organize products by category

This document serves as the blueprint for understanding and refactoring the Order Shop conversation system.