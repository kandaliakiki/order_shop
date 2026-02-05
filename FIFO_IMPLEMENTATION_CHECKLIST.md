# FIFO/FEFO Implementation Checklist

## Overview
Complete list of features to implement for automatic FEFO lot deduction and order-lot linking.

## 🎯 Key Decisions Made

### **1. Empty Lots Display:**
✅ **Separate Tab** - "Active Lots" | "Used Lots"

### **2. Concurrent Orders:**
✅ **No Stock Locking for MVP** - Keep it simple, matches current behavior
- Orders check stock independently (same as now)
- First to process gets the stock (same as now)
- Later orders may stay "Pending" if insufficient (same as now)
- Can be manually processed later (same as now)

### **3. Complexity Level:**
✅ **Medium (⭐⭐⭐)** - Manageable for MVP, NOT too complex
- No stock reservation (too complex - skipped)
- No locking mechanism (too complex - skipped)
- Simple FEFO deduction (manageable)
- Order-lot linking (straightforward)

---

## 📋 Backend Changes

### **1. Order Model Updates**
- [ ] Add `lotUsageMetadata` field to Order model
  - Structure:
    ```typescript
    lotUsageMetadata?: {
      lotsUsed: Array<{
        lotId: string;              // MongoDB _id
        lotNumber: string;          // "LOT-0001"
        ingredientId: string;
        ingredientName: string;
        quantityUsed: number;
        unit: string;
        expiryDate: Date;
        deductedAt: Date;
        status: "fully_used" | "partially_used";
      }>;
      deductedAt: Date;
    }
    ```
- [ ] Update `OrderData` interface
- [ ] Update order schema

---

### **2. New Service: Lot Deduction Service**
- [ ] Create `lotDeduction.service.ts`
- [ ] Implement `findLotsToUse()` method
  - Find active lots (currentStock > 0)
  - Sort by expiry date (FEFO - First Expired First Out)
  - If same expiry, sort by purchase date (FIFO - First In First Out)
  - Return sorted lots
- [ ] Implement `deductFromLots()` method
  - Handle partial lot usage
  - Handle multiple lots per ingredient
  - Update `IngredientLot.currentStock`
  - Track which lots were used
  - Return lot usage data
- [ ] Implement `syncIngredientStock()` method
  - Ensure `Ingredient.currentStock` = sum of all `IngredientLot.currentStock`
  - Handle edge cases

---

### **3. Update Stock Deduction Service**
- [ ] Modify `stockDeduction.service.ts`
- [ ] Replace aggregate deduction with lot-level deduction
- [ ] Call `LotDeductionService` instead of direct ingredient update
- [ ] Store lot usage metadata in order
- [ ] Handle errors (insufficient stock, lot not found, etc.)

---

### **4. Update Ingredient Stock Calculation Service**
- [ ] Modify `ingredientStockCalculation.service.ts`
- [ ] Check lot availability (not just aggregate stock)
- [ ] Consider lot expiry when checking sufficiency
- [ ] Return lot-level information if needed

---

### **5. Update Order Processing Actions**
- [ ] Update `whatsappOrderProcessing.action.ts`
  - Integrate lot deduction
  - Store lot usage metadata
- [ ] Update `orderStockNotification.action.ts`
  - Use lot deduction for pending orders
  - Store lot usage metadata
- [ ] Update manual order creation (if exists)
  - Integrate lot deduction

---

### **6. New API Endpoints**
- [ ] `GET /api/order/:orderId/lots` - Get lots used for an order
- [ ] `GET /api/lot/:lotId/orders` - Get orders that used a specific lot
- [ ] `GET /api/ingredient/:id/lots/active` - Get only active lots (currentStock > 0)
- [ ] `GET /api/ingredient/:id/lots/all` - Get all lots including empty ones
- [ ] `POST /api/lots/sync` - Sync ingredient stock with lot stock (utility)

---

### **7. Bake Sheet Service Updates**
- [ ] Update `bakeSheet.service.ts`
- [ ] Add lot recommendations to bake sheet response
- [ ] Show recommended lots for each ingredient
- [ ] Sort lots by expiry (FEFO)
- [ ] Include expiry warnings

---

## 🎨 Frontend Changes

### **8. Bake Sheet Page Updates**
- [ ] Update `bake-sheet/page.tsx`
- [ ] Display recommended lots for each ingredient
- [ ] Show lot expiry dates
- [ ] Add visual indicators:
  - ⚠️ Expiring soon (≤7 days)
  - ❌ Expired
  - ✅ Good
- [ ] Show lot quantities available
- [ ] Sort lots by expiry date

---

### **9. Order Detail Page Updates**
- [ ] Update `order/[orderId]/page.tsx`
- [ ] Add "Lots Used" section
- [ ] Display which lots were used for this order
- [ ] Show:
  - Lot number (LOT-0001)
  - Ingredient name
  - Quantity used
  - Expiry date
  - Status (fully used / partially used)
- [ ] Link to lot details (if lot detail page exists)

---

### **10. Lots Page Updates**
- [ ] Update `lots/page.tsx`
- [ ] Add tab system: "Active Lots" | "Used Lots"
- [ ] **Active Lots Tab:**
  - Show only lots where `currentStock > 0`
  - Sort by expiry date (FEFO)
  - Show expiry indicators
- [ ] **Used Lots Tab:**
  - Show lots where `currentStock = 0`
  - Sort by expiry date or date used
  - Show "Used" badge
  - Optional: Show which orders used it
- [ ] Add badge/indicator for empty lots

---

### **11. New Component: Lot Usage Display**
- [ ] Create `LotUsageDisplay.tsx` component
- [ ] Show lots used for an order
- [ ] Display lot details (number, expiry, quantity)
- [ ] Show status badges

---

### **12. New Component: Recommended Lots Display**
- [ ] Create `RecommendedLotsDisplay.tsx` component
- [ ] Show recommended lots in bake sheet
- [ ] Visual expiry indicators
- [ ] Sort by expiry date

---

### **13. Ingredient Lots API Integration**
- [ ] Update `IngredientContext.tsx`
- [ ] Add `fetchActiveLots()` method (currentStock > 0)
- [ ] Add `fetchAllLots()` method (including empty)
- [ ] Add `fetchLotsByOrder()` method
- [ ] Add `fetchOrdersByLot()` method

---

## 🔄 Integration Points

### **14. WhatsApp Order Processing**
- [ ] Update webhook processing
- [ ] Integrate lot deduction
- [ ] Store lot usage in order metadata
- [ ] Handle errors gracefully

### **15. Manual Order Creation**
- [ ] Update manual order creation flow
- [ ] Integrate lot deduction
- [ ] Store lot usage metadata

### **16. Pending Order Processing**
- [ ] Update pending order processing
- [ ] Use lot deduction when processing
- [ ] Store lot usage metadata

---

## 🧪 Testing & Edge Cases

### **17. Edge Cases to Handle**
- [ ] Partial lot usage (order needs 5kg, lot has 3kg)
- [ ] Multiple lots per ingredient (need 10kg, use 3kg from lot A, 7kg from lot B)
- [ ] Fully used lot (currentStock becomes 0)
- [ ] **Concurrent orders:**
  - ✅ **Decision: No locking for MVP**
  - ✅ First order to process gets the stock
  - ✅ Later orders may fail if insufficient (stay "Pending")
  - ✅ Can be manually processed later
  - ⚠️ **Future:** Consider pending orders when checking availability
- [ ] Insufficient stock across all lots
- [ ] Expired lots (should not be used)
- [ ] Lot with 0 stock (should be skipped)
- [ ] Ingredient with no lots (fallback to aggregate stock)
- [ ] Order cancellation (should we restore lot stock? - Future feature)

### **18. Stock Synchronization**
- [ ] Ensure `Ingredient.currentStock` = sum of all `IngredientLot.currentStock`
- [ ] Add validation/sync function
- [ ] Handle discrepancies
- [ ] Add sync endpoint/utility

---

## 📊 Data Migration (If Needed)

### **19. Existing Data Handling**
- [ ] Handle existing orders (no lot usage metadata)
- [ ] Handle existing ingredients (no lots created)
- [ ] Migration script (if needed) to create initial lots from current stock
- [ ] Backfill lot usage for existing orders (optional)

---

## 🎯 UI/UX Enhancements

### **20. Visual Indicators**
- [ ] Expiry badges in lots list
- [ ] Status badges (Active, Used, Expired)
- [ ] Color coding (green = good, orange = expiring, red = expired)
- [ ] Progress indicators (how much of lot is used)

### **21. Filtering & Sorting**
- [ ] Filter by status (Active, Used, Expired)
- [ ] Sort by expiry date
- [ ] Sort by purchase date
- [ ] Sort by lot number

### **22. Search & Filter**
- [ ] Search lots by lot number
- [ ] Filter by ingredient
- [ ] Filter by expiry status

---

## 📝 Documentation

### **23. Code Documentation**
- [ ] Document lot deduction logic
- [ ] Document FEFO/FIFO sorting
- [ ] Document order-lot linking
- [ ] Add JSDoc comments

### **24. User Documentation**
- [ ] Document how FEFO works
- [ ] Document how to view lot usage
- [ ] Document bake sheet lot recommendations

---

## 🔍 Monitoring & Logging

### **25. Logging**
- [ ] Log lot deductions
- [ ] Log lot usage for orders
- [ ] Log errors (insufficient stock, lot not found)
- [ ] Log stock synchronization

---

## ⚠️ Complexity Assessment

### **Is This Too Complex for MVP?**

**Current Complexity:**
- Core FEFO logic: ⭐⭐⭐ (Medium)
- Order-lot linking: ⭐⭐ (Easy)
- UI updates: ⭐⭐ (Easy)
- **Total: ⭐⭐⭐ (Medium - Manageable)**

**If We Add Stock Reservation:**
- Stock locking: ⭐⭐⭐⭐ (Very Complex)
- Reservation system: ⭐⭐⭐⭐ (Very Complex)
- Release on cancel: ⭐⭐⭐ (Medium)
- **Total: ⭐⭐⭐⭐⭐ (Too Complex for MVP)**

### **Recommendation:**
✅ **Keep It Simple - No Stock Locking for MVP**

**Why:**
- Current system already works without locking
- Orders that can't be fulfilled stay "Pending"
- Can be manually processed later
- Matches current behavior (no breaking changes)
- Can add reservation in v2 if needed

**What We're Implementing:**
- ✅ FEFO lot deduction (automatic)
- ✅ Order-lot linking (traceability)
- ✅ Bake sheet recommendations (planning)
- ✅ No stock locking (keep simple)

**What We're NOT Implementing (for MVP):**
- ❌ Stock reservation
- ❌ Locking mechanism
- ❌ Pending order consideration
- ❌ Order cancellation stock restoration

---

## Summary by Priority

### **Priority 1: Core Functionality (Must Have)**
1. ✅ Order Model - Add `lotUsageMetadata`
2. ✅ Lot Deduction Service - Core FEFO logic
3. ✅ Update Stock Deduction Service - Use lot deduction
4. ✅ Update Order Processing - Integrate lot deduction
5. ✅ Bake Sheet - Show recommended lots
6. ✅ Order Detail - Show lots used

### **Priority 2: UI Enhancements (Should Have)**
7. ✅ Lots Page - Filter empty lots
8. ✅ Visual Indicators - Expiry badges
9. ✅ API Endpoints - Order-lot queries

### **Priority 3: Nice to Have (Can Add Later)**
10. ⚠️ Lot Detail Page - Show orders that used it
11. ⚠️ Stock Sync Utility
12. ⚠️ Advanced Filtering
13. ⚠️ Data Migration Scripts

---

## Estimated Time

### **Priority 1 (Core):**
- Backend: 4-5 hours
- Frontend: 2-3 hours
- **Total: 6-8 hours**

### **Priority 2 (UI):**
- Frontend: 2-3 hours
- **Total: 2-3 hours**

### **Priority 3 (Nice to Have):**
- Various: 3-4 hours
- **Total: 3-4 hours**

### **Grand Total: 11-15 hours** (for all features)

---

## Implementation Order

### **Phase 1: Backend Core (4-5 hours)**
1. Order Model - Add lotUsageMetadata
2. Lot Deduction Service - Create and implement
3. Update Stock Deduction Service
4. Update Order Processing Actions
5. Test lot deduction logic

### **Phase 2: Frontend Core (2-3 hours)**
6. Bake Sheet - Show recommended lots
7. Order Detail - Show lots used
8. Lots Page - Filter empty lots

### **Phase 3: API & Integration (1-2 hours)**
9. New API Endpoints
10. Update IngredientContext
11. Integration testing

### **Phase 4: Polish (2-3 hours)**
12. Visual indicators
13. Error handling
14. Edge case handling
15. Documentation

---

## Files to Create/Modify

### **New Files:**
- `server/lib/services/lotDeduction.service.ts` (NEW)
- `client/components/lot_component/LotUsageDisplay.tsx` (NEW)
- `client/components/lot_component/RecommendedLotsDisplay.tsx` (NEW)

### **Files to Modify:**
- `server/lib/models/order.model.ts`
- `server/lib/services/stockDeduction.service.ts`
- `server/lib/services/ingredientStockCalculation.service.ts`
- `server/lib/services/bakeSheet.service.ts`
- `server/lib/actions/whatsappOrderProcessing.action.ts`
- `server/lib/actions/orderStockNotification.action.ts`
- `server/server.ts` (new endpoints)
- `client/app/(root)/bake-sheet/page.tsx`
- `client/app/(root)/order/[orderId]/page.tsx`
- `client/app/(root)/lots/page.tsx`
- `client/components/ingredient_component/IngredientContext.tsx`

---

## Key Decisions Needed

### **1. Empty Lots Display:**
✅ **DECIDED: Separate Tab**
- **Active Lots Tab:** Show only lots where `currentStock > 0`
- **Used/Empty Lots Tab:** Show lots where `currentStock = 0`
- Clear separation, better organization
- Users can see history when needed

---

### **2. Concurrent Orders & Stock Reservation:**

#### **Current System Behavior (Before FIFO):**

**When Order 1 is Created:**
```
Order 1 (10:00 AM): Needs 5kg flour
  ↓
System checks: Ingredient.currentStock = 10kg
  ↓
Stock sufficient? YES ✅
  ↓
Status: "New Order" or "Pending"
  ↓
Stock deducted? NO ❌ (Not yet - only when processed)
```

**When Order 2 is Created (1 minute later):**
```
Order 2 (10:01 AM): Needs 6kg flour
  ↓
System checks: Ingredient.currentStock = 10kg (still 10kg!)
  ↓
Stock sufficient? YES ✅ (Order 1 hasn't deducted yet!)
  ↓
Status: "New Order" or "Pending"
  ↓
Stock deducted? NO ❌ (Not yet)
```

**When Orders are Processed:**
```
Order 1 processed first:
  - Deducts 5kg → Stock: 5kg remaining ✅

Order 2 processed second:
  - Tries to deduct 6kg
  - Only 5kg available ❌
  - Status: "Pending" (insufficient stock)
```

**Current System:**
- ✅ Checks stock at order creation
- ✅ Deducts when order is processed (status changes)
- ❌ **No stock reservation** - each order checks independently
- ❌ **No consideration of pending orders** - doesn't check if other orders need the stock

#### **With FIFO Implementation (Same Behavior):**

**When Order 1 is Created:**
```
Order 1 (10:00 AM): Needs 5kg flour
  ↓
System checks: Sum of all lot.currentStock = 10kg
  ↓
Stock sufficient? YES ✅
  ↓
Status: "New Order" or "Pending"
  ↓
Lots deducted? NO ❌ (Not yet - only when processed)
```

**When Order 2 is Created:**
```
Order 2 (10:01 AM): Needs 6kg flour
  ↓
System checks: Sum of all lot.currentStock = 10kg (still 10kg!)
  ↓
Stock sufficient? YES ✅ (Order 1 hasn't deducted yet!)
  ↓
Status: "New Order" or "Pending"
  ↓
Lots deducted? NO ❌ (Not yet)
```

**When Orders are Processed:**
```
Order 1 processed first:
  - Uses LOT-0001 (3kg) and LOT-0002 (2kg) via FEFO
  - Deducts from lots → Remaining: 5kg ✅

Order 2 processed second:
  - Tries to use 6kg
  - Only 5kg available in remaining lots ❌
  - Status: "Pending" (insufficient stock)
```

**Same Behavior, Just Using Lots Instead of Aggregate:**
- ✅ Checks lot stock at order creation
- ✅ Deducts from lots when order is processed
- ❌ **No lot reservation** - each order checks independently
- ❌ **No consideration of pending orders** - doesn't check if other orders need the stock

#### **Do We Need Stock/Lot Locking?**

**Option A: No Locking (Current - Simple) ✅ RECOMMENDED FOR MVP**
- Each order checks stock independently
- First to process gets the stock/lots
- Later orders may fail if insufficient (stay "Pending")
- **Complexity:** ⭐ (Simple - matches current behavior)
- **Risk:** Medium (orders may fail later, but can be manually processed)

**Option B: Stock Reservation (Complex)**
- Reserve stock when order created
- Deduct when order processed
- Release if order cancelled
- **Complexity:** ⭐⭐⭐⭐ (Very Complex)
- **Risk:** Low (but much more code, edge cases)

**Option C: Check Pending Orders (Medium)**
- When checking stock, also check pending orders' needs
- Calculate: Available = Current Stock - Sum of Pending Orders' Needs
- **Complexity:** ⭐⭐⭐ (Medium)
- **Risk:** Medium (better than A, simpler than B)

#### **Recommendation:**
✅ **Option A (No Locking) for MVP**

**Why:**
- ✅ **Matches current behavior** - no breaking changes
- ✅ **Simple to implement** - just use lots instead of aggregate
- ✅ **Orders that can't be fulfilled stay "Pending"** - can be manually processed later
- ✅ **Not too complex** - manageable for MVP
- ✅ **Can add reservation in v2** if needed

**What Happens:**
- Order 1 created → Checks lots → Sufficient → Status: "Pending"
- Order 2 created → Checks lots → Sufficient → Status: "Pending"
- Order 1 processed → Uses lots via FEFO → Deducts → ✅
- Order 2 processed → Tries to use lots → Insufficient → Status: "Pending" → Can process later when stock available

**This is acceptable because:**
- Orders are usually processed quickly (not sitting in "Pending" for long)
- If stock becomes available, pending orders can be processed
- Matches current system behavior (no new complexity)

---

### **3. Fallback Behavior:**

#### **Current System Behavior:**
When an order is created:
1. ✅ System checks `Ingredient.currentStock` (aggregate)
2. ✅ If sufficient → Deducts immediately
3. ❌ **Does NOT reserve stock** for pending orders
4. ❌ **Does NOT consider other pending orders' needs**

**Example Problem:**
```
Order 1 (10:00 AM): Needs 5kg flour
  - Checks stock: 10kg available ✅
  - Status: "Pending" (waiting for processing)
  - Stock NOT deducted yet

Order 2 (10:01 AM): Needs 6kg flour
  - Checks stock: 10kg available ✅ (Order 1 hasn't deducted yet!)
  - Status: "Pending"
  - Stock NOT deducted yet

Both orders think they have enough stock, but total need = 11kg, only 10kg available!
```

#### **Current System:**
- ✅ Checks stock at order creation
- ✅ Deducts when order status changes to "On Process" or "New Order"
- ❌ **No stock reservation** - first order to process gets the stock
- ❌ **No consideration of pending orders** - each order checks independently

#### **What Happens Now:**
```
Order 1 created → Checks stock → Sufficient → Status: "Pending"
Order 2 created → Checks stock → Sufficient → Status: "Pending"
  ↓
Order 1 processed → Deducts 5kg → Stock: 5kg remaining
Order 2 processed → Tries to deduct 6kg → Only 5kg available → ERROR or "Pending"
```

#### **Is Stock Locking Needed?**

**Option A: No Locking (Current - Simple)**
- Each order checks stock independently
- First to process gets the stock
- Later orders may fail if insufficient
- **Complexity:** ⭐ (Simple)
- **Risk:** Medium (orders may fail later)

**Option B: Stock Reservation (Complex)**
- Reserve stock when order created
- Deduct when order processed
- Release if order cancelled
- **Complexity:** ⭐⭐⭐⭐ (Very Complex)
- **Risk:** Low (but much more code)

**Option C: Check Pending Orders (Medium)**
- When checking stock, also check pending orders' needs
- Calculate: Available = Current Stock - Sum of Pending Orders' Needs
- **Complexity:** ⭐⭐⭐ (Medium)
- **Risk:** Medium (better than A, simpler than B)

#### **Recommendation:**
✅ **Option A (No Locking) for MVP**
- Keep it simple
- Current system already works this way
- Orders that can't be fulfilled stay "Pending"
- Can be manually processed later when stock available
- **Not too complex** - matches current behavior

**Future Enhancement (v2):**
- Add stock reservation if needed
- Or check pending orders when calculating availability

### **3. Fallback Behavior:**
- If no lots exist, use aggregate stock? ✅ (Recommended)
- Create a default lot? ❌ (Too complex)
- Error out? ❌ (Bad UX)

### **4. Stock Sync:**
- Automatic sync? ✅ (Recommended - on lot update)
- Manual sync endpoint? ⚠️ (Optional utility)
- Validation on save? ✅ (Recommended)

---

## Testing Checklist

- [ ] Single lot usage (fully used)
- [ ] Partial lot usage
- [ ] Multiple lots per ingredient
- [ ] Multiple ingredients
- [ ] Insufficient stock
- [ ] Expired lots (should not be used)
- [ ] Empty lots (should be skipped)
- [ ] Concurrent orders
- [ ] Stock synchronization
- [ ] Order-lot linking
- [ ] Bake sheet recommendations
- [ ] UI display (active vs empty lots)
