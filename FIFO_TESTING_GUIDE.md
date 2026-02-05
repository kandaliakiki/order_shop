# FIFO/FEFO Lot Tracking - WhatsApp Testing Guide

## Overview
This guide provides step-by-step instructions for testing the FIFO/FEFO lot tracking system via WhatsApp. 

**Important:** All WhatsApp messages are sent to the **store owner/bakery manager**, NOT to customers. The store owner forwards customer messages to the bot, and the bot responds with order details, stock status, and management information for the business owner.

---

## Prerequisites

### 1. Database Setup
- ✅ Ingredients seeded with `defaultExpiryDays`
- ✅ Ingredient lots created with various expiry dates
- ✅ Products configured with ingredients

### 2. WhatsApp Setup
- ✅ Twilio WhatsApp configured
- ✅ Webhook URL set up
- ✅ Test WhatsApp number ready

### 3. Verify Initial State
Before testing, check:
- **Lots Page**: Should show active lots with expiry dates
- **Ingredients Page**: Should show `defaultExpiryDays` for each ingredient
- **Dashboard**: Should display expiring ingredients widget

---

## Test Scenarios

### **Test 1: Basic Order Flow with Lot Deduction**

#### **Setup:**
1. Create lots with different expiry dates:
   - **LOT-0001**: Flour, 10kg, expires in 5 days
   - **LOT-0002**: Flour, 5kg, expires in 10 days
   - **LOT-0003**: Eggs, 20 pieces, expires in 3 days
   - **LOT-0004**: Eggs, 15 pieces, expires in 7 days

#### **Test Steps:**
1. **Store Owner Forwards Customer Message:**
   ```
   Hi, I want to order 2 chiffon cakes and 1 cheesecake
   ```
   (This is the customer's message forwarded by the store owner)

2. **Expected Behavior:**
   - ✅ Order created with status "New Order" (if stock sufficient)
   - ✅ System uses FEFO (earliest expiry first)
   - ✅ Flour: Uses LOT-0001 first (expires in 5 days)
   - ✅ Eggs: Uses LOT-0003 first (expires in 3 days)
   - ✅ WhatsApp message sent to **store owner** (not customer)

3. **Verify in POS System:**
   - Go to **Order Detail Page** (`/order/O-XXXX`)
   - Check **"Lots Used"** section
   - Verify lots are listed in FEFO order
   - Verify quantities deducted match order requirements

#### **Expected WhatsApp Response (to Store Owner):**
```
✅ New Order Received

Order ID: O-XXXX
Status: New Order

✅ All ingredients are sufficient. Stock has been deducted.

Lots Used (FEFO):

• Flour
  ✓ LOT-0001: 3kg (Fully Used)
  ◐ LOT-0002: 2kg (Partially Used)

• Eggs
  ✓ LOT-0003: 6 pieces (Fully Used)

You can view full details in the POS system.
```

---

### **Test 2: Partial Lot Usage**

#### **Setup:**
1. Create a lot with more stock than needed:
   - **LOT-0005**: Flour, 20kg, expires in 4 days

#### **Test Steps:**
1. **Store Owner Forwards Customer Message:**
   ```
   I need 1 chocolate cake
   ```
   (Customer's message forwarded by store owner. Assuming chocolate cake needs 5kg flour)

2. **Expected Behavior:**
   - ✅ Order created successfully
   - ✅ LOT-0005 used **partially** (5kg deducted, 15kg remaining)
   - ✅ Lot status: "partially_used"
   - ✅ LOT-0005 still visible in "Active Lots" tab
   - ✅ WhatsApp response shows lot usage details

3. **Verify:**
   - **WhatsApp Response** should show:
     - LOT-0005: 5kg (Partially Used)
   - Check **Lots Page** → **Active Lots** tab
   - LOT-0005 should show `currentStock: 15kg`
   - Check **Order Detail** → Should show "Partially Used" status

---

### **Test 3: Multiple Lots Per Ingredient (FEFO)**

#### **Setup:**
1. Create multiple lots with different expiry dates:
   - **LOT-0006**: Milk, 5L, expires **tomorrow** (earliest)
   - **LOT-0007**: Milk, 3L, expires in **5 days**
   - **LOT-0008**: Milk, 2L, expires in **10 days**

#### **Test Steps:**
1. **Store Owner Forwards Customer Message:**
   ```
   Order 3 cheesecakes
   ```
   (Customer's message forwarded by store owner. Assuming cheesecake needs 2L milk each = 6L total)

2. **Expected Behavior:**
   - ✅ System uses FEFO order:
     - First: LOT-0006 (5L) - **fully used**
     - Second: LOT-0007 (1L) - **partially used**
   - ✅ LOT-0008 not used (not needed)
   - ✅ Order confirmed

3. **Verify:**
   - **Order Detail** → Check "Lots Used":
     - LOT-0006: 5L (Fully Used)
     - LOT-0007: 1L (Partially Used)
   - **Lots Page**:
     - LOT-0006: Moved to "Used Lots" tab
     - LOT-0007: Still in "Active Lots" with 2L remaining

---

### **Test 4: Insufficient Stock (Pending Order)**

#### **Setup:**
1. Create limited stock:
   - **LOT-0009**: Butter, 2kg, expires in 6 days

#### **Test Steps:**
1. **Store Owner Forwards Customer Message:**
   ```
   I want 5 croissants
   ```
   (Customer's message forwarded by store owner. Assuming croissants need 1kg butter each = 5kg needed, but only 2kg available)

2. **Expected Behavior:**
   - ✅ Order created with status **"Pending"**
   - ✅ Stock **NOT deducted** (insufficient)
   - ✅ WhatsApp message indicates insufficient stock

3. **Verify:**
   - **Orders Page**: Order status = "Pending"
   - **Order Detail**: Shows insufficient ingredients
   - **Lots Page**: No lots deducted (LOT-0009 still has 2kg)

#### **Expected WhatsApp Response (to Store Owner):**
```
⚠️ Order O-XXXX - Insufficient Stock

Order received but marked as Pending due to insufficient ingredients:

• Butter
  Required: 5kg
  Available: 2kg
  Shortage: 3kg

⚠️ Stock was NOT deducted. Order status: Pending

Please restock and process the order manually, or it will be processed automatically once stock is available.
```

---

### **Test 5: Expired Lots (Should Not Be Used)**

#### **Setup:**
1. Create lots with expired dates:
   - **LOT-0010**: Flour, 10kg, **expired 2 days ago**
   - **LOT-0011**: Flour, 5kg, expires in **3 days** (not expired)

#### **Test Steps:**
1. **Store Owner Forwards Customer Message:**
   ```
   Order 2 chiffon cakes
   ```
   (Customer's message forwarded by store owner. Assuming needs 3kg flour)

2. **Expected Behavior:**
   - ✅ System **skips** LOT-0010 (expired)
   - ✅ Uses LOT-0011 (not expired)
   - ✅ Order confirmed

3. **Verify:**
   - **Order Detail**: Only LOT-0011 listed in "Lots Used"
   - **Lots Page**: LOT-0010 still shows but marked as "Expired"

---

### **Test 6: Bake Sheet with Recommended Lots**

#### **Setup:**
1. Create multiple orders for today:
   - Order 1: 2 chiffon cakes
   - Order 2: 1 cheesecake
   - Order 3: 3 chocolate cakes

2. Create lots with various expiry dates:
   - **LOT-0012**: Flour, 10kg, expires in **2 days** (expiring soon)
   - **LOT-0013**: Flour, 5kg, expires in **15 days**
   - **LOT-0014**: Eggs, 30 pieces, expires in **1 day** (expiring soon)
   - **LOT-0015**: Eggs, 20 pieces, expires in **8 days**

#### **Test Steps:**
1. **Store Owner Sends Command:**
   ```
   /bakesheet today
   ```
   (Store owner directly sends command to bot)

2. **Expected Behavior:**
   - ✅ Bake sheet generated for today
   - ✅ Shows aggregated products needed
   - ✅ Shows ingredient requirements
   - ✅ Shows **recommended lots** (FEFO sorted)
   - ✅ Expiry indicators (Expired, Expiring Soon, Good)

3. **Verify:**
   - **Bake Sheet Page**: Check recommended lots section
   - Lots should be sorted by expiry (earliest first)
   - Expiring soon lots should have orange badge
   - Expired lots should have red badge

#### **Expected WhatsApp Response:**
```
📋 Daily Bake Sheet - 2024-01-15
Interpretation: Single date - today

Today:
  Orders: 3
  Products:
  • Chiffon Cake: 2
  • Cheesecake: 1
  • Chocolate Cake: 3

Total Products Needed:
• Chiffon Cake: 2
• Cheesecake: 1
• Chocolate Cake: 3

Stock Status: ✅ All ingredients sufficient

Recommended Lots (FEFO):
Flour:
  • LOT-0012: 10kg (Expiring Soon - 2 days)
  • LOT-0013: 5kg (Good - 15 days)

Eggs:
  • LOT-0014: 30 pieces (Expiring Soon - 1 day)
  • LOT-0015: 20 pieces (Good - 8 days)
```

---

### **Test 7: Expiry Check Command**

#### **Setup:**
1. Create lots with various expiry dates:
   - **LOT-0016**: Milk, 3L, expires **tomorrow**
   - **LOT-0017**: Cheese, 500g, expires in **3 days**
   - **LOT-0018**: Butter, 2kg, expires in **5 days**

#### **Test Steps:**
1. **Store Owner Sends Command:**
   ```
   /expiry
   ```
   (Store owner directly sends command. No item specified - should return top 5 expiring soonest)

2. **Expected Behavior:**
   - ✅ Returns top 5 lots expiring soonest
   - ✅ Sorted by expiry date (ascending)
   - ✅ Shows days until expiry

#### **Expected WhatsApp Response (to Store Owner):**
```
📅 Expiring Ingredients (Top 5)

1. Milk (LOT-0016)
   Expires: Tomorrow (1 day)
   Stock: 3L

2. Cheese (LOT-0017)
   Expires: Jan 18, 2024 (3 days)
   Stock: 500g

3. Butter (LOT-0018)
   Expires: Jan 20, 2024 (5 days)
   Stock: 2kg

... (up to 5 items)
```

#### **Test with Specific Item:**
1. **Store Owner Sends Command:**
   ```
   /expiry milk
   ```

2. **Expected Behavior:**
   - ✅ Returns all milk lots sorted by expiry
   - ✅ Shows expiry status for each lot

---

### **Test 8: Stock Addition with Auto Expiry**

#### **Setup:**
1. Ensure ingredient has `defaultExpiryDays` set:
   - Flour: 180 days
   - Eggs: 30 days

#### **Test Steps:**
1. **Store Owner Sends Command:**
   ```
   /stock 10kg flour
   ```

2. **Expected Behavior:**
   - ✅ Lot created automatically
   - ✅ Expiry date calculated: Today + 180 days (from ingredient default)
   - ✅ Stock added to ingredient
   - ✅ Lot visible in "Active Lots" tab

3. **Verify:**
   - **Lots Page**: New lot created with expiry = Today + 180 days
   - **Ingredients Page**: Flour stock increased by 10kg

#### **Test with Custom Expiry:**
1. **Store Owner Sends Command:**
   ```
   /stock 5kg flour expires in 7 days
   ```

2. **Expected Behavior:**
   - ✅ Lot created with expiry = Today + 7 days (user-specified)
   - ✅ Overrides ingredient default

#### **Test with Ingredient Without Default:**
1. **Store Owner Sends Command:**
   ```
   /stock 2kg butter
   ```
   (Store owner sends command. Assuming butter has no `defaultExpiryDays`)

2. **Expected Behavior:**
   - ✅ AI predicts expiry (or uses 30-day default if AI fails)
   - ✅ Lot created with predicted/default expiry
   - ✅ Message indicates if default was used

---

### **Test 9: Waste Logging**

#### **Setup:**
1. Create active lots:
   - **LOT-0019**: Flour, 5kg, expires in 10 days

#### **Test Steps:**
1. **Store Owner Sends Command:**
   ```
   /waste 2kg flour burnt
   ```

2. **Expected Behavior:**
   - ✅ AI extracts: item=flour, quantity=2kg, reason=burnt
   - ✅ Stock decremented from ingredient
   - ✅ Waste log created
   - ✅ Confirmation message sent

3. **Verify:**
   - **Ingredients Page**: Flour stock decreased by 2kg
   - **Logs Page**: Waste entry created
   - **Lots Page**: If lot was fully used, moved to "Used Lots"

#### **Expected WhatsApp Response (to Store Owner):**
```
✅ Waste Logged

Item: Flour
Quantity: 2kg
Reason: Burnt

Stock updated successfully. Flour stock decreased by 2kg.
```

---

### **Test 10: Order Detail - Lot Usage Display**

#### **Setup:**
1. Create an order that uses multiple lots

#### **Test Steps:**
1. **Store Owner Forwards Customer Message:**
   ```
   Order 3 cheesecakes
   ```
   (Customer's message forwarded by store owner)

2. **Verify in POS System:**
   - Navigate to **Order Detail Page** (`/order/O-XXXX`)
   - Scroll to **"Lots Used"** section
   - Verify:
     - ✅ All lots used are listed
     - ✅ Lot numbers displayed
     - ✅ Quantities used shown
     - ✅ Expiry dates shown
     - ✅ Status (Fully Used / Partially Used)
     - ✅ Deducted timestamp

3. **Expected Display:**
   ```
   Lots Used
   Deducted at: Jan 15, 2024, 10:30 AM

   • Flour
     Lot: LOT-0012
     Quantity Used: 3kg
     Expiry: Jan 17, 2024
     Status: Fully Used

   • Eggs
     Lot: LOT-0014
     Quantity Used: 6 pieces
     Expiry: Jan 16, 2024
     Status: Partially Used
   ```

---

### **Test 11: Active vs Used Lots Tabs**

#### **Setup:**
1. Create orders that fully use some lots

#### **Test Steps:**
1. **Create Orders:**
   - Order 1: Uses LOT-0020 fully (moves to Used)
   - Order 2: Uses LOT-0021 partially (stays Active)

2. **Verify in Lots Page:**
   - **Active Lots Tab:**
     - ✅ Shows only lots with `currentStock > 0`
     - ✅ LOT-0021 visible (partially used)
     - ✅ LOT-0020 NOT visible (fully used)

   - **Used Lots Tab:**
     - ✅ Shows only lots with `currentStock = 0`
     - ✅ LOT-0020 visible (fully used)
     - ✅ LOT-0021 NOT visible (still has stock)

---

### **Test 12: Bake Sheet Date Range**

#### **Test Steps:**
1. **Store Owner Sends Commands:**
   ```
   /bakesheet tomorrow
   /bakesheet next 3 days
   /bakesheet january 20
   ```
   (Store owner directly sends commands to bot)

2. **Expected Behavior:**
   - ✅ AI parses natural language dates
   - ✅ Returns bake sheet for specified date/range
   - ✅ Shows recommended lots for each ingredient
   - ✅ Aggregates orders across date range

---

### **Test 13: Concurrent Orders (No Locking)**

#### **Setup:**
1. Create limited stock:
   - **LOT-0022**: Flour, 10kg total

#### **Test Steps:**
1. **Store Owner Forwards Two Customer Messages Simultaneously:**
   - Customer Message 1: Needs 6kg flour (e.g., "Order 2 cakes")
   - Customer Message 2: Needs 7kg flour (e.g., "Order 3 cakes")
   - (Total: 13kg needed, only 10kg available)

2. **Expected Behavior:**
   - ✅ Both orders check stock independently
   - ✅ Both see 10kg available (initially)
   - ✅ Order 1 processed first → Uses 6kg → 4kg remaining
   - ✅ Order 2 processed → Only 4kg available → Status: "Pending"
   - ✅ Order 2 can be processed later when stock available

3. **Verify:**
   - Order 1: Status = "New Order", Stock deducted
   - Order 2: Status = "Pending", Stock NOT deducted
   - **Lots Page**: LOT-0022 shows 4kg remaining

---

### **Test 14: Stock Sync (Aggregate = Sum of Lots)**

#### **Setup:**
1. Create multiple lots for same ingredient:
   - **LOT-0023**: Flour, 5kg
   - **LOT-0024**: Flour, 3kg
   - **LOT-0025**: Flour, 2kg
   - Total: 10kg

#### **Test Steps:**
1. **Check Ingredient Stock:**
   - Go to **Ingredients Page**
   - Verify Flour shows `currentStock: 10kg` (sum of all lots)

2. **Deduct from Lots:**
   - Create order that uses 3kg flour

3. **Verify Sync:**
   - **Lots Page**: Check individual lot stocks
   - **Ingredients Page**: Aggregate should = sum of all lot stocks
   - ✅ Should always be in sync

---

### **Test 15: Order Processing After Restocking**

#### **Setup:**
1. Create pending order (insufficient stock)

#### **Test Steps:**
1. **Store Owner Forwards Customer Message:**
   ```
   Order 5 croissants
   ```
   (Customer's message forwarded. Insufficient butter - order goes to Pending)

2. **Store Owner Adds Stock:**
   ```
   /stock 5kg butter
   ```
   (Store owner sends command to add stock)

3. **Process Pending Order:**
   - Go to **Orders Page**
   - Find pending order
   - Click "Process Stock" (or use API endpoint)
   - Or wait for cronjob to process

4. **Expected Behavior:**
   - ✅ Order status changes to "New Order"
   - ✅ Stock deducted using FEFO
   - ✅ WhatsApp confirmation sent to customer

---

## Test Checklist

### **Order Flow:**
- [ ] Basic order creation via WhatsApp
- [ ] Order confirmation message received
- [ ] Order appears in POS system
- [ ] Order detail page shows correct information
- [ ] Lots used displayed in order detail

### **Lot Deduction:**
- [ ] FEFO sorting (earliest expiry first)
- [ ] Partial lot usage
- [ ] Multiple lots per ingredient
- [ ] Fully used lots moved to "Used Lots" tab
- [ ] Expired lots not used
- [ ] Stock sync (aggregate = sum of lots)

### **Insufficient Stock:**
- [ ] Order marked as "Pending"
- [ ] Stock NOT deducted when insufficient
- [ ] WhatsApp message indicates insufficient stock
- [ ] Order can be processed after restocking

### **Bake Sheet:**
- [ ] `/bakesheet today` works
- [ ] `/bakesheet tomorrow` works
- [ ] `/bakesheet next 3 days` works
- [ ] Recommended lots displayed (FEFO sorted)
- [ ] Expiry indicators shown (Expired, Expiring Soon, Good)
- [ ] Bake sheet page displays correctly

### **Expiry Check:**
- [ ] `/expiry` returns top 5 expiring
- [ ] `/expiry [item]` returns item-specific lots
- [ ] Sorted by expiry date
- [ ] Days until expiry calculated correctly

### **Stock Addition:**
- [ ] `/stock [qty] [unit] [ingredient]` creates lot
- [ ] Uses ingredient `defaultExpiryDays` if available
- [ ] AI prediction if no default
- [ ] 30-day default if AI fails
- [ ] Custom expiry override works

### **Waste Logging:**
- [ ] `/waste [text]` extracts item, quantity, reason
- [ ] Stock decremented correctly
- [ ] Waste log created
- [ ] Confirmation message sent

### **UI Features:**
- [ ] Active/Used Lots tabs work
- [ ] Lots page sorting works
- [ ] Order detail shows lots used
- [ ] Bake sheet shows recommended lots
- [ ] Expiry badges display correctly

---

## Common Issues & Solutions

### **Issue: Order not using lots**
**Solution:**
- Check if ingredient has active lots
- Verify lots are not expired
- Check `currentStock > 0` for lots

### **Issue: Wrong lot used (not FEFO)**
**Solution:**
- Verify expiry dates are set correctly
- Check purchase dates (used for tie-breaking)
- Ensure lots are sorted by expiry, then purchase date

### **Issue: Stock not syncing**
**Solution:**
- Check `syncIngredientStock()` is called after deduction
- Verify aggregate = sum of all lot stocks
- Manually sync if needed (future feature)

### **Issue: Expired lots being used**
**Solution:**
- Check `expiryDate > now` filter in `findLotsToUse()`
- Verify expiry dates are correct in database

### **Issue: Bake sheet not showing recommended lots**
**Solution:**
- Check `getRecommendedLots()` is called in `bakeSheet.service.ts`
- Verify lots exist for ingredients
- Check frontend receives `recommendedLots` data

---

## Test Data Examples

### **Sample Ingredients:**
```json
{
  "name": "Flour",
  "unit": "kg",
  "currentStock": 20,
  "minimumStock": 5,
  "defaultExpiryDays": 180
}
```

### **Sample Lots:**
```json
{
  "lotId": "LOT-0001",
  "ingredient": "ingredient_id",
  "quantity": 10,
  "unit": "kg",
  "expiryDate": "2024-01-20",
  "purchaseDate": "2024-01-10",
  "currentStock": 10,
  "expirySource": "database"
}
```

### **Sample Orders:**
```json
{
  "orderId": "O-0001",
  "items": [
    { "name": "Chiffon Cake", "quantity": 2, "price": 15.00 }
  ],
  "status": "New Order",
  "lotUsageMetadata": {
    "lotsUsed": [
      {
        "lotId": "lot_id",
        "lotNumber": "LOT-0001",
        "ingredientName": "Flour",
        "quantityUsed": 3,
        "unit": "kg",
        "expiryDate": "2024-01-20",
        "status": "partially_used"
      }
    ],
    "deductedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## Success Criteria

✅ **All tests pass if:**
1. Orders use FEFO lot deduction correctly
2. Lot usage tracked in order metadata
3. Active/Used lots tabs work correctly
4. Bake sheet shows recommended lots
5. Expiry checking works
6. Stock addition creates lots with correct expiry
7. Waste logging decrements stock
8. Insufficient stock handled gracefully
9. UI displays lot information correctly
10. Stock sync maintains consistency

---

## Next Steps After Testing

1. **Performance Testing:**
   - Test with 100+ lots
   - Test with 50+ concurrent orders
   - Measure response times

2. **Edge Cases:**
   - Test with no lots (fallback to aggregate)
   - Test with all lots expired
   - Test with negative stock (shouldn't happen)

3. **Integration Testing:**
   - Test with real WhatsApp numbers
   - Test webhook reliability
   - Test error handling

---

## Important Notes

### **Message Flow:**
- **All WhatsApp messages are sent to the STORE OWNER, NOT customers**
- Store owner forwards customer messages to the bot
- Bot responds to store owner with order details, stock status, and management info
- Store owner then communicates with customer separately

### **System Behavior:**
- **FEFO Priority:** Expiry date first, then purchase date
- **No Stock Locking:** Orders check independently (by design)
- **Fallback:** If no lots exist, uses aggregate stock deduction
- **Expired Lots:** Never used, but kept for history
- **Stock Sync:** Automatic after lot deduction

### **Communication Flow:**
```
Customer → Store Owner → Bot (WhatsApp) → Store Owner
                                    ↓
                            POS System (for details)
```

The bot provides quick summaries to the store owner. Full details are always available in the POS system.

---

**Happy Testing! 🧪**
