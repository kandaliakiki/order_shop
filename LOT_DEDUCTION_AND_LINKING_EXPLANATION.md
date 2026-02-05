# Lot Deduction & Order-Lot Linking - How It Works

## The Question
When an order is processed, how do we handle lot stock deduction and linking?

---

## Recommended Approach: Deduct Immediately + Keep Lot Record

### **How It Works:**

1. **When Order is Processed:**
   ```
   Order needs 5kg flour
     ↓
   System finds lots (FEFO):
   - LOT-0001: 3kg available (expires Jan 16)
   - LOT-0002: 2kg available (expires Jan 20)
     ↓
   Deducts immediately:
   - LOT-0001.currentStock: 3kg → 0kg (fully used)
   - LOT-0002.currentStock: 2kg → 0kg (fully used)
     ↓
   Stores in Order:
   - lotUsageMetadata: [
       { lotId: "LOT-0001", quantityUsed: 3kg },
       { lotId: "LOT-0002", quantityUsed: 2kg }
     ]
   ```

2. **Lot Status After Deduction:**
   - `currentStock` is updated immediately (can be 0)
   - Lot record is **NOT deleted** (kept for history)
   - Lot is still in database, just marked as "empty"

3. **Display Logic:**
   - **Active Lots View**: Only show lots where `currentStock > 0`
   - **All Lots View**: Show all lots (including empty ones)
   - **Used/Empty Lots**: Can be shown at bottom or in separate section

---

## Data Flow

### **1. Lot Deduction (Immediate)**
```typescript
// When order processed:
for each ingredient requirement:
  find lots (sorted by expiry - FEFO)
  for each lot:
    if lot.currentStock > 0:
      use = min(remaining, lot.currentStock)
      lot.currentStock -= use  // Deduct immediately
      lot.save()
      track in order metadata
```

### **2. Lot Display (Filtered)**
```typescript
// Active lots (for use):
IngredientLot.find({
  ingredient: ingredientId,
  currentStock: { $gt: 0 }  // Only show lots with stock
}).sort({ expiryDate: 1 })

// All lots (for history):
IngredientLot.find({
  ingredient: ingredientId
}).sort({ expiryDate: 1 })
```

### **3. Order-Lot Linking**
```typescript
// In Order model:
lotUsageMetadata: {
  lotsUsed: [
    {
      lotId: "LOT-0001",
      lotNumber: "LOT-0001",
      ingredientId: "...",
      ingredientName: "Flour",
      quantityUsed: 3,
      unit: "kg",
      expiryDate: "2025-01-16",
      deductedAt: "2025-01-15T10:30:00Z"
    },
    {
      lotId: "LOT-0002",
      lotNumber: "LOT-0002",
      ingredientId: "...",
      ingredientName: "Flour",
      quantityUsed: 2,
      unit: "kg",
      expiryDate: "2025-01-20",
      deductedAt: "2025-01-15T10:30:00Z"
    }
  ]
}
```

---

## Display Options

### **Option A: Filter Empty Lots (Recommended)**
**Active Lots Page:**
- Only show lots where `currentStock > 0`
- Empty lots are hidden (but still in database)
- Clean, simple view

**All Lots View (Optional):**
- Show all lots including empty ones
- Empty lots shown at bottom or with "Used" badge
- Good for history/audit

**Pros:**
- ✅ Clean interface
- ✅ Only shows usable lots
- ✅ Empty lots still in database (for history)

**Cons:**
- ⚠️ Need to filter in queries

---

### **Option B: Show Empty Lots at Bottom**
**Lots Page:**
- Active lots at top (currentStock > 0)
- Empty lots at bottom (currentStock = 0)
- Visual separator or badge

**Pros:**
- ✅ Can see history
- ✅ Clear separation

**Cons:**
- ⚠️ Can clutter interface
- ⚠️ More complex sorting

---

### **Option C: Separate "Used Lots" Section**
**Lots Page:**
- Tabs: "Active Lots" | "Used Lots"
- Active: currentStock > 0
- Used: currentStock = 0

**Pros:**
- ✅ Clear separation
- ✅ Can see history when needed

**Cons:**
- ⚠️ More UI complexity

---

## Order-Lot Linking: How to View

### **1. From Order → See Lots Used**
```
Order Detail Page (O-0481):
  ↓
Shows:
  "Lots Used for This Order:"
  - LOT-0001: 3kg Flour (expired Jan 16)
  - LOT-0002: 2kg Flour (expired Jan 20)
  - LOT-0005: 4 Eggs (expired Jan 16)
```

### **2. From Lot → See Orders That Used It**
```
Lot Detail View (LOT-0001):
  ↓
Shows:
  "Orders That Used This Lot:"
  - O-0481: 3kg (Jan 15, 2025)
  - O-0482: 0.5kg (Jan 15, 2025)
  - O-0485: 1kg (Jan 16, 2025)
  
  Total Used: 4.5kg / 5kg
  Remaining: 0.5kg
```

### **3. Query Examples**
```typescript
// Find all orders that used a specific lot
Order.find({
  "lotUsageMetadata.lotsUsed.lotId": "LOT-0001"
})

// Find all lots used for a specific order
Order.findById(orderId)
  .select("lotUsageMetadata.lotsUsed")

// Find all empty lots
IngredientLot.find({
  currentStock: 0
})
```

---

## Partial Lot Usage Example

### **Scenario:**
- Order needs 5kg flour
- LOT-0001 has 3kg (expires Jan 16)
- LOT-0002 has 5kg (expires Jan 20)

### **What Happens:**
```
1. Use LOT-0001 first (FEFO - expiring soon)
   - Use all 3kg from LOT-0001
   - LOT-0001.currentStock: 3kg → 0kg (fully used)

2. Use LOT-0002 second
   - Use 2kg from LOT-0002 (partial usage)
   - LOT-0002.currentStock: 5kg → 3kg (partially used)

3. Store in Order:
   lotUsageMetadata: [
     { lotId: "LOT-0001", quantityUsed: 3kg, status: "fully_used" },
     { lotId: "LOT-0002", quantityUsed: 2kg, status: "partially_used" }
   ]
```

### **Display:**
- **LOT-0001**: currentStock = 0 → Hidden from active lots (or shown as "Used")
- **LOT-0002**: currentStock = 3kg → Still shown in active lots

---

## Database Schema Updates

### **Order Model:**
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

### **IngredientLot Model:**
```typescript
// No changes needed - currentStock already exists
// Just update currentStock when deducting
```

---

## Implementation Logic

### **Step 1: Find Lots to Use (FEFO)**
```typescript
async findLotsToUse(ingredientId, requiredQuantity) {
  // Find all active lots
  const lots = await IngredientLot.find({
    ingredient: ingredientId,
    currentStock: { $gt: 0 }  // Only lots with stock
  })
  .sort({ 
    expiryDate: 1,           // Expiring soon first (FEFO)
    purchaseDate: 1          // If same expiry, oldest first (FIFO)
  });
  
  return lots;
}
```

### **Step 2: Deduct from Lots**
```typescript
async deductFromLots(lots, requiredQuantity) {
  const lotsUsed = [];
  let remaining = requiredQuantity;
  
  for (const lot of lots) {
    if (remaining <= 0) break;
    
    const use = Math.min(remaining, lot.currentStock);
    lot.currentStock -= use;  // Deduct immediately
    await lot.save();
    
    lotsUsed.push({
      lotId: lot._id,
      lotNumber: lot.lotId,
      quantityUsed: use,
      status: lot.currentStock === 0 ? "fully_used" : "partially_used"
    });
    
    remaining -= use;
  }
  
  return lotsUsed;
}
```

### **Step 3: Store in Order**
```typescript
await Order.findByIdAndUpdate(orderId, {
  lotUsageMetadata: {
    lotsUsed: lotsUsed,
    deductedAt: new Date()
  }
});
```

---

## Display in UI

### **Lots Page:**
```typescript
// Default view: Only active lots
const activeLots = lots.filter(lot => lot.currentStock > 0);

// Optional: Show empty lots at bottom
const emptyLots = lots.filter(lot => lot.currentStock === 0);
```

### **Order Detail Page:**
```typescript
// Show lots used
{order.lotUsageMetadata?.lotsUsed.map(lot => (
  <div>
    {lot.lotNumber}: {lot.quantityUsed}{lot.unit} {lot.ingredientName}
    {lot.status === "fully_used" && <Badge>Fully Used</Badge>}
  </div>
))}
```

### **Bake Sheet:**
```typescript
// Show recommended lots
{ingredient.availableLots
  .sort((a, b) => a.expiryDate - b.expiryDate)
  .map(lot => (
    <div>
      {lot.lotId}: {lot.currentStock}{lot.unit}
      {lot.isExpiringSoon && <Badge>Expiring Soon</Badge>}
    </div>
  ))}
```

---

## Summary

### **How It Works:**
1. ✅ **Deduct immediately** from `lot.currentStock` when order processed
2. ✅ **Keep lot record** in database (don't delete)
3. ✅ **Filter empty lots** from active view (currentStock = 0)
4. ✅ **Store in order** which lots were used
5. ✅ **Show in order details** which lots were used

### **Benefits:**
- ✅ Can see which lots were used for each order
- ✅ Can see which orders used a specific lot
- ✅ Empty lots kept for history/audit
- ✅ Clean interface (only show active lots)
- ✅ Simple logic (just update currentStock)

### **Display Options:**
- **Active Lots**: Only show `currentStock > 0` (recommended)
- **All Lots**: Show all including empty (optional, for history)
- **Order Details**: Show lots used (read-only)

### **Is It Possible?**
✅ **YES** - This approach is:
- Simple to implement
- Clean for users
- Maintains history
- Allows traceability

The key is: **Deduct immediately, keep record, filter display**.
