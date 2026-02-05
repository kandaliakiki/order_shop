# FIFO/FEFO User Flow & Use Cases - Brainstorm

## The Goal
Implement FIFO (First In First Out) or FEFO (First Expired First Out) to ensure we use older/expiring ingredients first, and link orders to specific lots/batches.

---

## Use Cases & User Scenarios

### **Scenario 1: Automatic FIFO/FEFO (Behind the Scenes)**
**What:** System automatically uses oldest/expiring lots when processing orders

**User Flow:**
```
1. Order comes in (WhatsApp or manual)
2. System calculates ingredient requirements
3. System automatically finds and uses oldest/expiring lots (FEFO)
4. System deducts from those lots
5. Order processed - user doesn't see lot details
```

**Pros:**
- ✅ Simple for users - no extra steps
- ✅ Prevents waste automatically
- ✅ No user training needed
- ✅ Works in background

**Cons:**
- ❌ User can't see which lots were used
- ❌ No manual control
- ❌ Can't override if needed

**Best For:** MVP - Simple, automatic waste prevention

---

### **Scenario 2: Bake Sheet View (Recommended)**
**What:** Show lot recommendations when viewing bake sheet (before baking)

**User Flow:**
```
1. User views today's bake sheet
2. System shows:
   - Products needed
   - Ingredients needed
   - Recommended lots to use (sorted by expiry)
   - Visual indicators (expiring soon, expired)
3. User can see which lots to use before starting
4. When order is processed, system uses recommended lots
```

**Example Display:**
```
Today's Bake Sheet - Jan 15, 2025

Products Needed:
- Chiffon Cake: 2
- Cheesecake: 1

Ingredients Needed:
- Flour: 5kg
  Recommended Lots:
  ✅ LOT-0001: 3kg (expires Jan 20) - Use this first
  ✅ LOT-0002: 2kg (expires Jan 25) - Use this second
  
- Eggs: 6 pieces
  Recommended Lots:
  ⚠️ LOT-0005: 4 pieces (expires Jan 16) - Use this first (expiring soon!)
  ✅ LOT-0006: 2 pieces (expires Jan 20) - Use this second
```

**Pros:**
- ✅ User can see what to use before starting
- ✅ Helps with planning
- ✅ Visual feedback on expiry
- ✅ Can catch issues before baking

**Cons:**
- ⚠️ Need to update bake sheet UI
- ⚠️ More complex display

**Best For:** Production workflow - helps bakers plan

---

### **Scenario 3: Order Processing View**
**What:** Show lot recommendations when order status changes to "On Process"

**User Flow:**
```
1. Order created (status: "New Order" or "Pending")
2. User clicks "Start Processing" or changes status to "On Process"
3. System shows modal/page with:
   - Order details
   - Recommended lots to use
   - Visual lot selection (optional)
4. User confirms → System uses those lots
5. Stock deducted from selected lots
```

**Example Display:**
```
Order: O-0481
Customer: John Doe
Items: Chiffon Cake x2, Cheesecake x1

Recommended Lots to Use:
┌─────────────────────────────────────┐
│ Flour: 5kg needed                  │
│ ✅ LOT-0001: 3kg (expires Jan 20)  │
│ ✅ LOT-0002: 2kg (expires Jan 25)  │
│ [Auto-select recommended]           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Eggs: 6 pieces needed               │
│ ⚠️ LOT-0005: 4 pieces (expires Jan 16) │
│ ✅ LOT-0006: 2 pieces (expires Jan 20) │
│ [Auto-select recommended]           │
└─────────────────────────────────────┘

[Start Processing] [Cancel]
```

**Pros:**
- ✅ User sees what will be used
- ✅ Can override if needed
- ✅ Good for quality control
- ✅ Links order to specific lots

**Cons:**
- ⚠️ Extra step in order processing
- ⚠️ Might slow down workflow
- ⚠️ Need UI for lot selection

**Best For:** Quality control - when you want to verify before processing

---

### **Scenario 4: Manual Lot Selection (Advanced)**
**What:** User manually selects which lots to use for each order

**User Flow:**
```
1. Order created
2. User views order details
3. System shows available lots for each ingredient
4. User manually selects which lots to use
5. System deducts from selected lots
```

**Pros:**
- ✅ Full control
- ✅ Can handle special cases
- ✅ Good for quality control

**Cons:**
- ❌ Time-consuming
- ❌ Requires training
- ❌ Slows down workflow
- ❌ Overkill for most cases

**Best For:** Special cases only - not recommended for daily use

---

## Recommended Approach: Hybrid (Automatic + Visibility)

### **For MVP: Automatic FIFO/FEFO with Bake Sheet View**

**Implementation:**
1. **Automatic Deduction**: System automatically uses FEFO when processing orders
2. **Bake Sheet Integration**: Show recommended lots in bake sheet view
3. **Order-Lot Linking**: Store which lots were used in order metadata
4. **Order Detail View**: Show which lots were used (read-only)

**User Flow:**
```
Morning:
1. User opens Bake Sheet page
2. Sees today's orders and recommended lots
3. Can plan which ingredients to use

During Day:
1. Orders come in (WhatsApp/manual)
2. System automatically uses FEFO
3. Stock deducted from appropriate lots
4. Order linked to lots used

Evening:
1. User views order details
2. Can see which lots were used
3. Can verify everything was correct
```

---

## What Needs to Be Built

### **1. Lot Deduction Service (FEFO Logic)**
```typescript
// Pseudo-code
class LotDeductionService {
  async findLotsToUse(ingredientId, requiredQuantity) {
    // Find all active lots for ingredient
    // Sort by expiry date (soonest first) - FEFO
    // If same expiry, sort by purchase date (oldest first) - FIFO
    // Return lots with enough stock
  }
  
  async deductFromLots(lots, quantity) {
    // Deduct from lots until quantity met
    // Handle partial lot usage
    // Update IngredientLot.currentStock
    // Update Ingredient.currentStock
  }
}
```

### **2. Order Model Update**
```typescript
lotUsageMetadata?: {
  lotsUsed: Array<{
    lotId: string;
    lotNumber: string; // "LOT-0001"
    ingredientId: string;
    ingredientName: string;
    quantityUsed: number;
    expiryDate: Date;
  }>;
  deductedAt: Date;
}
```

### **3. Bake Sheet Enhancement**
- Show recommended lots for each ingredient
- Visual indicators (expiring soon, expired)
- Sort by expiry date

### **4. Order Detail Page Enhancement**
- Show which lots were used
- Display lot expiry dates
- Show if any lots were expiring soon

---

## User Flow Examples

### **Example 1: Daily Workflow (Automatic)**
```
7:00 AM - Baker opens Bake Sheet
  ↓
Sees: "Today needs 5kg flour"
Sees: "Recommended: Use LOT-0001 (expires Jan 16) first"
  ↓
8:00 AM - Order comes in via WhatsApp
  ↓
System automatically:
  - Calculates needs 2kg flour
  - Finds LOT-0001 has 3kg (expires Jan 16)
  - Uses 2kg from LOT-0001
  - Updates LOT-0001.currentStock = 1kg
  - Links order to LOT-0001
  ↓
Order processed, baker doesn't need to do anything
```

### **Example 2: Quality Control (Manual Check)**
```
Order O-0481 created
  ↓
Baker views order details
  ↓
Sees: "Lots to be used:"
  - LOT-0001: 2kg flour (expires Jan 16 - expiring soon!)
  - LOT-0005: 4 eggs (expires Jan 16 - expiring soon!)
  ↓
Baker confirms: "Yes, use these lots"
  ↓
System deducts from lots
Order processed
```

---

## Benefits for Users

### **1. Waste Prevention**
- Automatically uses expiring ingredients first
- Reduces food waste
- Saves money

### **2. Quality Control**
- Can see which batches were used
- Can trace issues back to specific lots
- Better inventory management

### **3. Planning**
- Bake sheet shows what to use
- Can plan ingredient usage
- Avoids surprises

### **4. Compliance**
- Track which batches used for each order
- Useful for recalls or quality issues
- Better record keeping

---

## Implementation Complexity

### **Core Features:**
1. **FEFO Logic**: ⭐⭐⭐ (Medium)
   - Find lots by expiry
   - Handle partial usage
   - Update lot stock

2. **Order-Lot Linking**: ⭐⭐ (Easy)
   - Store in order metadata
   - Display in order details

3. **Bake Sheet Integration**: ⭐⭐⭐ (Medium)
   - Calculate recommended lots
   - Display in UI
   - Visual indicators

**Total Complexity:** ⭐⭐⭐ (Medium)
**Time Estimate:** 6-8 hours

---

## Recommended MVP Implementation

### **Phase 1: Automatic FEFO (Core)**
- Implement lot deduction with FEFO
- Link orders to lots used
- Update lot stock automatically
- **User sees:** Nothing (works in background)

### **Phase 2: Bake Sheet View**
- Show recommended lots in bake sheet
- Visual expiry indicators
- **User sees:** What to use before starting

### **Phase 3: Order Detail View**
- Show which lots were used
- Display lot expiry info
- **User sees:** History of what was used

---

## My Recommendation

### **For MVP: Automatic FEFO + Bake Sheet View**

**Why:**
1. ✅ **Automatic waste prevention** - works without user intervention
2. ✅ **Bake sheet helps planning** - users can see what to use
3. ✅ **Order-lot linking** - can track which batches were used
4. ✅ **Not too complex** - manageable for MVP
5. ✅ **Practical value** - actually helps users

**User Experience:**
- Morning: Check bake sheet → See recommended lots
- During day: Orders processed automatically with FEFO
- Evening: View order details → See which lots were used

**This gives you:**
- ✅ Automatic waste prevention
- ✅ Better planning (bake sheet)
- ✅ Traceability (order-lot linking)
- ✅ Not too complex for MVP

---

## Questions to Answer

1. **When should lot selection happen?**
   - ✅ **Recommended:** Automatically when order processed
   - ✅ **Plus:** Show in bake sheet for planning
   - ✅ **Plus:** Show in order details for history

2. **Should users manually select lots?**
   - ✅ **Recommended:** No for MVP (automatic)
   - ✅ **Future:** Maybe add manual override option

3. **What's the priority?**
   - ✅ **Priority 1:** Automatic FEFO deduction
   - ✅ **Priority 2:** Bake sheet view
   - ✅ **Priority 3:** Order detail view

---

## Summary

**Best Approach for MVP:**
- ✅ **Automatic FEFO** when processing orders
- ✅ **Bake Sheet View** showing recommended lots
- ✅ **Order-Lot Linking** for traceability
- ✅ **Order Detail View** showing lots used

**Complexity:** ⭐⭐⭐ (Medium - 6-8 hours)
**Value:** ⭐⭐⭐⭐ (High - waste prevention, traceability)

**This is a good balance between:**
- Practical value (waste prevention)
- User experience (bake sheet helps planning)
- Complexity (manageable for MVP)
- Future extensibility (can add manual selection later)
