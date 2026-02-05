# Ingredient Lots Improvements Preview

## Overview
Enhancements for ingredient lots management: default expiry dates, manual lot creation, lot deletion, and sorting.

## 🗄️ Database-First Approach: No Hardcoded Defaults

**Important Change:** All expiry defaults are stored in the **database** (`ingredient.defaultExpiryDays`), not in hardcoded code files.

### What's Removed:
- ❌ **Hardcoded `ingredientDefaults.ts` file** (or only kept for seeding purposes)
- ❌ **`getDefaultExpiryDays()` function** from production code (only used in seed script if needed)

### What's Used Instead:
- ✅ **Database field:** `ingredient.defaultExpiryDays` (stored per ingredient)
- ✅ **AI Prediction:** If ingredient doesn't have `defaultExpiryDays` set, use AI to predict
- ✅ **Safe Fallback:** If AI fails, use 30 days as safe default

### Priority Order:
1. User-specified expiry (WhatsApp) → Use directly, **NO AI**
2. `ingredient.defaultExpiryDays` (from database) → Use it, **NO AI**
3. AI Prediction (if database field not set) → Call AI, use for lot only
4. Safe default (30 days) → Fallback if AI fails

### About Seeding:
- **`ingredientDefaults.ts` and `getDefaultExpiryDays()`** can be kept **only for seeding purposes** (to populate initial data)
- **NOT used in production code** - all expiry defaults come from database
- When seeding, set `defaultExpiryDays` on ingredients directly, then remove/ignore the hardcoded defaults

---

## 1. Default Expiry Date for Ingredients

### Problem
Currently, default expiry dates are only used when adding stock via WhatsApp. When creating ingredients manually, there's no way to set a default expiry.

### Solution
Add a `defaultExpiryDays` field to the Ingredient model.

### 1.1 Backend Changes

**Update Ingredient Model:**
```typescript
// server/lib/models/ingredient.model.ts
export interface IngredientData {
  name: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  defaultExpiryDays?: number; // NEW: Default expiry in days
  imageUrl?: string;
}
```

**Update Ingredient Form (Frontend):**
```typescript
// client/components/ingredient_component/IngredientForm.tsx
const formSchema = z.object({
  name: z.string().min(3).max(50),
  unit: z.string().min(1),
  currentStock: z.coerce.number().min(0),
  minimumStock: z.coerce.number().min(0),
  defaultExpiryDays: z.coerce.number().min(1).optional(), // NEW
  imageUrl: z.string().optional(),
});

// In the form, add a new field:
<FormField
  control={form.control}
  name="defaultExpiryDays"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Default Expiry (Days)</FormLabel>
      <FormControl>
        <Input
          type="number"
          placeholder="e.g., 30 for eggs, 180 for flour"
          {...field}
          className="no-focus"
        />
      </FormControl>
      <FormDescription>
        Default number of days until expiry when adding stock. 
        Leave empty to use system defaults.
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Note:** No auto-fill from system defaults. Users should set `defaultExpiryDays` when creating ingredients. The system will use AI prediction if `defaultExpiryDays` is not set when creating lots.

**Update StockAdditionService - Expiry Date Calculation Logic:**

**Priority Order (from highest to lowest):**
1. **User-specified expiry** (from WhatsApp: "expires in 7 days") → **Use it directly, NO AI call**
2. **Ingredient.defaultExpiryDays** (if set and > 0) → **Use it, NO AI call**
3. **AI Prediction** (if ingredient.defaultExpiryDays is not set or 0) → **Call AI to predict, use for this lot only**
4. **Safe default** (fallback if AI fails) → **Use 30 days as safe default**

```typescript
// When creating lot, calculate expiry date with priority logic
private async calculateExpiryDate(
  ingredient: any, // Ingredient document
  customExpiryDays?: number, // User-specified from WhatsApp (e.g., "expires in 7 days")
  aiService?: AIService
): Promise<Date> {
  // PRIORITY 1: User-specified expiry (from WhatsApp)
  // If user says "expires in 7 days", use it directly - NO AI CALL
  if (customExpiryDays) {
    return addDays(new Date(), customExpiryDays);
  }

  // PRIORITY 2: Ingredient's defaultExpiryDays (if set and > 0)
  // If ingredient has defaultExpiryDays set, use it - NO AI CALL
  if (ingredient.defaultExpiryDays && ingredient.defaultExpiryDays > 0) {
    return addDays(new Date(), ingredient.defaultExpiryDays);
  }

  // PRIORITY 3: AI Prediction (only if ingredient.defaultExpiryDays is NOT set or is 0)
  // Call AI to predict expiry days - ONLY for this lot, DON'T update ingredient
  if (aiService) {
    try {
      const predictedDays = await aiService.predictExpiryDays(ingredient.name);
      // Use AI prediction for this lot only (don't save to ingredient.defaultExpiryDays)
      return addDays(new Date(), predictedDays);
    } catch (error) {
      console.error("AI prediction failed, using safe default:", error);
      // Fallback to safe default (30 days) if AI fails
      return addDays(new Date(), 30);
    }
  }

  // PRIORITY 4: System defaults (fallback) - Only used if AI fails
  // If AI fails, use a safe default (30 days)
  return addDays(new Date(), 30);
}
```

**Important Notes:**
- ✅ **If user specifies expiry in WhatsApp** (e.g., "/stock 10kg flour expires in 7 days"), it uses that value directly - **NO AI CALL**
- ✅ **If ingredient has defaultExpiryDays set** (from database), it uses that value - **NO AI CALL**
- ✅ **AI is only called** when ingredient.defaultExpiryDays is NOT set (or is 0)
- ✅ **AI prediction is only used for the lot**, it does NOT update ingredient.defaultExpiryDays
- ✅ **Safe default (30 days)** is used as final fallback if AI fails
- ✅ **All expiry defaults are stored in database** (`ingredient.defaultExpiryDays`), not in code
- ✅ **Hardcoded `ingredientDefaults.ts` is removed** - defaults come from database only

**Add AI Prediction Method:**
```typescript
// server/lib/services/ai.service.ts
async predictExpiryDays(ingredientName: string): Promise<number> {
  await this.checkGeminiRateLimit();

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
    const result = await this.geminiModel.generateContent(prompt);
    const response = result.response.text();
    // Extract number from response
    const days = parseInt(response.match(/\d+/)?.[0] || "30");
    return Math.max(1, days); // Ensure at least 1 day
  } else {
    const response = await this.openai.chat.completions.create({
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
    const days = parseInt(response.choices[0]?.message?.content?.match(/\d+/)?.[0] || "30");
    return Math.max(1, days);
  }
}
```

**When is AI Called?**
- ✅ **AI is called** when:
  - Creating lot via WhatsApp AND ingredient.defaultExpiryDays is NOT set (or is 0) AND user didn't specify expiry
  - Creating lot manually AND ingredient.defaultExpiryDays is NOT set (or is 0) AND user didn't specify expiry date

- ❌ **AI is NOT called** when:
  - User specifies expiry in WhatsApp (e.g., "expires in 7 days")
  - Ingredient has defaultExpiryDays set (and > 0)
  - User manually sets expiry date in the form

---

## 2. Manual Lot Creation from Lots Page

### Problem
Currently, lots can only be created via WhatsApp. Users need a way to add lots manually from the UI.

### Solution
Add an "Add Lot" button and modal form on the lots page.

### 2.1 Frontend Changes

**Add Lot Modal Component:**
```typescript
// client/components/lots_component/AddLotModal.tsx
interface AddLotModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredients: Ingredient[];
  onSuccess: () => void;
}

const AddLotModal = ({ isOpen, onClose, ingredients, onSuccess }: AddLotModalProps) => {
  const form = useForm({
    defaultValues: {
      ingredientId: "",
      quantity: 0,
      expiryDate: "",
      purchaseDate: "",
      supplier: "",
      cost: 0,
    }
  });

  const selectedIngredient = ingredients.find(
    ing => ing._id === form.watch("ingredientId")
  );

  // Auto-calculate expiry date based on ingredient's defaultExpiryDays
  useEffect(() => {
    if (selectedIngredient?.defaultExpiryDays) {
      const expiryDate = addDays(new Date(), selectedIngredient.defaultExpiryDays);
      form.setValue("expiryDate", format(expiryDate, "yyyy-MM-dd"));
    }
  }, [selectedIngredient]);

  const onSubmit = async (data) => {
    // Call API to create lot
    await fetch(`${backendUrl}/api/lots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ingredient: data.ingredientId,
        quantity: data.quantity,
        unit: selectedIngredient.unit,
        expiryDate: data.expiryDate,
        purchaseDate: data.purchaseDate || new Date(),
        supplier: data.supplier,
        cost: data.cost,
        currentStock: data.quantity, // New lot, full quantity
      }),
    });
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Lot</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Ingredient selection */}
            {/* Quantity input */}
            {/* Expiry date picker */}
            {/* Purchase date picker */}
            {/* Supplier input */}
            {/* Cost input */}
            <Button type="submit">Create Lot</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
```

**Update Lots Page:**
```typescript
// client/app/(root)/lots/page.tsx
const [showAddLotModal, setShowAddLotModal] = useState(false);

// Add button in header
<div className="flex items-center justify-between">
  <h1 className="text-2xl font-bold">Ingredient Lots</h1>
  <div className="flex gap-2">
    <Button onClick={() => setShowAddLotModal(true)}>
      <Plus className="h-4 w-4 mr-2" />
      Add Lot
    </Button>
    {/* ... existing filter buttons ... */}
  </div>
</div>

<AddLotModal
  isOpen={showAddLotModal}
  onClose={() => setShowAddLotModal(false)}
  ingredients={ingredients}
  onSuccess={() => {
    // Refresh lots data
    fetchIngredients();
  }}
/>
```

### 2.2 Backend Changes

**New API Endpoint for Lot Creation:**
```typescript
// server/server.ts
app.post("/api/lots", async (req: Request, res: Response) => {
  try {
    await connectToDB();
    const { ingredient, quantity, unit, expiryDate, purchaseDate, supplier, cost, currentStock } = req.body;

    const ingredientDoc = await Ingredient.findById(ingredient);
    if (!ingredientDoc) {
      return res.status(404).json({ error: "Ingredient not found" });
    }

    // If expiryDate not provided, calculate it
    let finalExpiryDate: Date;
    if (expiryDate) {
      finalExpiryDate = new Date(expiryDate);
    } else {
      // Use ingredient's defaultExpiryDays if available
      if (ingredientDoc.defaultExpiryDays && ingredientDoc.defaultExpiryDays > 0) {
        finalExpiryDate = addDays(new Date(), ingredientDoc.defaultExpiryDays);
      } else {
        // Use AI to predict expiry days (only for this lot, don't update ingredient)
        const { AIService } = await import("./lib/services/ai.service");
        const aiService = new AIService();
        const predictedDays = await aiService.predictExpiryDays(ingredientDoc.name);
        finalExpiryDate = addDays(new Date(), predictedDays);
      }
    }

    // Create lot
    const lot = await IngredientLot.create({
      ingredient,
      quantity,
      unit: unit || ingredientDoc.unit,
      expiryDate: finalExpiryDate,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      supplier,
      cost,
      currentStock: currentStock || quantity,
    });

    // Update ingredient total stock
    ingredientDoc.currentStock += (currentStock || quantity);
    await ingredientDoc.save();

    res.status(201).json(lot);
  } catch (error) {
    console.error("Error creating lot:", error);
    res.status(500).json({ error: "Failed to create lot" });
  }
});
```

**New API Endpoint for AI Expiry Prediction:**
```typescript
// server/server.ts
app.post("/api/ai/predict-expiry", async (req: Request, res: Response) => {
  try {
    const { ingredientName } = req.body;
    if (!ingredientName) {
      return res.status(400).json({ error: "Ingredient name is required" });
    }

    const { AIService } = await import("./lib/services/ai.service");
    const aiService = new AIService();
    const days = await aiService.predictExpiryDays(ingredientName);

    res.status(200).json({ days });
  } catch (error) {
    console.error("Error predicting expiry:", error);
    res.status(500).json({ error: "Failed to predict expiry" });
  }
});
```

---

## 3. Lot Deletion and Cleanup

### Problem
Lots accumulate over time. Need a way to:
- Delete individual lots
- Clean up expired/empty lots
- Prevent clutter

### Solution
Add delete functionality with smart cleanup options.

### 3.1 Frontend Changes

**Add Delete Button to Table:**
```typescript
// In lots page table, add Actions column
<TableHead>Actions</TableHead>

// In table row
<TableCell>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="sm">
        <MoreVertical className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem onClick={() => handleDeleteLot(lot._id)}>
        <Trash className="h-4 w-4 mr-2" />
        Delete Lot
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</TableCell>
```

**Bulk Cleanup Options:**
```typescript
// Add cleanup buttons in header
<div className="flex gap-2">
  <Button 
    variant="outline" 
    onClick={handleCleanupExpired}
    className="text-red-600"
  >
    <Trash className="h-4 w-4 mr-2" />
    Remove Expired
  </Button>
  <Button 
    variant="outline" 
    onClick={handleCleanupEmpty}
  >
    <Trash className="h-4 w-4 mr-2" />
    Remove Empty Lots
  </Button>
</div>
```

### 3.2 Backend Changes

**Delete Lot Endpoint:**
```typescript
// server/server.ts
app.delete("/api/lots/:id", async (req: Request, res: Response) => {
  try {
    await connectToDB();
    const { id } = req.params;

    const lot = await IngredientLot.findById(id).populate("ingredient");
    if (!lot) {
      return res.status(404).json({ error: "Lot not found" });
    }

    // Update ingredient stock (subtract the lot's current stock)
    if (lot.ingredient) {
      lot.ingredient.currentStock = Math.max(0, 
        lot.ingredient.currentStock - lot.currentStock
      );
      await lot.ingredient.save();
    }

    // Delete lot
    await IngredientLot.findByIdAndDelete(id);

    res.status(200).json({ message: "Lot deleted successfully" });
  } catch (error) {
    console.error("Error deleting lot:", error);
    res.status(500).json({ error: "Failed to delete lot" });
  }
});

// Bulk cleanup endpoints
app.delete("/api/lots/cleanup/expired", async (req: Request, res: Response) => {
  // Delete all expired lots with currentStock > 0
});

app.delete("/api/lots/cleanup/empty", async (req: Request, res: Response) => {
  // Delete all lots with currentStock = 0
});
```

**Important:** When deleting a lot, we need to:
1. Subtract the lot's `currentStock` from the ingredient's `currentStock`
2. Then delete the lot

---

## 4. Sorting Functionality

### Problem
Lots page can get cluttered. Need to sort by:
- Ingredient name
- Expiry date (soonest first / latest first)
- Purchase date
- Lot ID

### Solution
Add sorting controls to the lots page.

### 4.1 Frontend Changes

**Add Sort Controls:**
```typescript
// client/app/(root)/lots/page.tsx
const [sortBy, setSortBy] = useState<"name" | "expiry" | "purchase" | "lotId">("expiry");
const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

// Sort function
const sortedLots = useMemo(() => {
  const lots = showAll ? allLots : lots;
  return [...lots].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case "name":
        comparison = (a.ingredient?.name || "").localeCompare(b.ingredient?.name || "");
        break;
      case "expiry":
        comparison = new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        break;
      case "purchase":
        const aDate = a.purchaseDate ? new Date(a.purchaseDate).getTime() : 0;
        const bDate = b.purchaseDate ? new Date(b.purchaseDate).getTime() : 0;
        comparison = aDate - bDate;
        break;
      case "lotId":
        comparison = a.lotId.localeCompare(b.lotId);
        break;
    }
    
    return sortOrder === "asc" ? comparison : -comparison;
  });
}, [allLots, lots, showAll, sortBy, sortOrder]);

// UI Controls
<div className="flex items-center gap-2">
  <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Sort by" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="expiry">Expiry Date</SelectItem>
      <SelectItem value="name">Ingredient Name</SelectItem>
      <SelectItem value="purchase">Purchase Date</SelectItem>
      <SelectItem value="lotId">Lot ID</SelectItem>
    </SelectContent>
  </Select>
  
  <Button
    variant="outline"
    size="sm"
    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
  >
    {sortOrder === "asc" ? <ArrowUp /> : <ArrowDown />}
  </Button>
</div>
```

**Default Sort:**
- Default: Sort by expiry date (ascending - soonest first)
- This shows expiring items at the top

---

## 5. Summary of Changes

### Backend:
1. ✅ Add `defaultExpiryDays` field to Ingredient model
2. ✅ Update ingredient creation/update endpoints to handle `defaultExpiryDays`
3. ✅ Update `StockAdditionService` to use ingredient's `defaultExpiryDays`
4. ✅ Add `POST /api/lots` endpoint for manual lot creation
5. ✅ Add `DELETE /api/lots/:id` endpoint for lot deletion
6. ✅ Add bulk cleanup endpoints (optional)

### Frontend:
1. ✅ Add `defaultExpiryDays` field to ingredient form
2. ✅ No auto-suggest (user manually sets expiry defaults in database)
3. ✅ Create `AddLotModal` component
4. ✅ Add "Add Lot" button to lots page
5. ✅ Add delete functionality (individual + bulk cleanup)
6. ✅ Add sorting controls (by name, expiry, purchase date, lot ID)
7. ✅ Default sort by expiry date (soonest first)

### Benefits:
- ✅ Better ingredient management (default expiry per ingredient, stored in database)
- ✅ Manual lot creation (not just WhatsApp)
- ✅ Cleanup options (prevent clutter)
- ✅ Better organization (sorting)
- ✅ Database-first approach (no hardcoded defaults)
- ✅ AI prediction for new ingredients without defaults

---

## 6. UI/UX Improvements

### Default Expiry Field:
- Shows placeholder with example (e.g., "30 for eggs, 180 for flour")
- Optional field (can leave empty - AI will predict when creating lots)
- Stored in database (`ingredient.defaultExpiryDays`)
- No hardcoded defaults - all come from database

### Add Lot Modal:
- Ingredient dropdown (required)
- Quantity input (required)
- Expiry date picker (auto-filled from ingredient's defaultExpiryDays)
- Purchase date picker (defaults to today)
- Supplier input (optional)
- Cost input (optional)

### Sorting:
- Dropdown to select sort field
- Toggle button to switch ascending/descending
- Visual indicator (arrow icon)
- Default: Expiry date (ascending) - shows expiring soon items first

### Cleanup:
- "Remove Expired" button - deletes all expired lots
- "Remove Empty Lots" button - deletes all lots with currentStock = 0
- Confirmation dialog before bulk deletion
- Success notification after cleanup

---

## 7. Data Flow

### Creating Lot Manually:
1. User clicks "Add Lot" button
2. Modal opens with form
3. User selects ingredient → expiry date auto-fills
4. User fills in quantity, supplier, cost (optional)
5. Submit → API creates lot
6. Ingredient's `currentStock` is updated automatically
7. Lots list refreshes

### Deleting Lot:
1. User clicks delete on a lot
2. Confirmation dialog appears
3. On confirm → API deletes lot
4. Ingredient's `currentStock` is decreased by lot's `currentStock`
5. Lots list refreshes

### Sorting:
1. User selects sort field from dropdown
2. User toggles ascending/descending
3. Lots list re-renders with new sort order
4. Sort preference could be saved to localStorage (optional)

---

## 7. Data Flow Examples

### Example 1: WhatsApp with User-Specified Expiry
```
User: "/stock 5 eggs expires in 7 days"
  ↓
AI parses: { ingredientName: "eggs", quantity: 5, expiryDays: 7 }
  ↓
calculateExpiryDate(ingredient, 7) // customExpiryDays = 7
  ↓
Priority 1: customExpiryDays exists → Use 7 days ✅
  ↓
Result: Expiry date = Today + 7 days
  ↓
NO AI CALL for expiry prediction ✅
```

### Example 2: WhatsApp without Expiry, Ingredient has defaultExpiryDays
```
User: "/stock 10kg flour"
  ↓
AI parses: { ingredientName: "flour", quantity: 10, expiryDays: null }
  ↓
Ingredient found: { name: "Flour", defaultExpiryDays: 180 }
  ↓
calculateExpiryDate(ingredient, null)
  ↓
Priority 1: customExpiryDays? NO
Priority 2: ingredient.defaultExpiryDays = 180 → Use 180 days ✅
  ↓
Result: Expiry date = Today + 180 days
  ↓
NO AI CALL for expiry prediction ✅
```

### Example 3: WhatsApp without Expiry, Ingredient has NO defaultExpiryDays
```
User: "/stock 5kg special-flour"
  ↓
AI parses: { ingredientName: "special-flour", quantity: 5, expiryDays: null }
  ↓
Ingredient found: { name: "Special Flour", defaultExpiryDays: null }
  ↓
calculateExpiryDate(ingredient, null)
  ↓
Priority 1: customExpiryDays? NO
Priority 2: ingredient.defaultExpiryDays? NO
Priority 3: Call AI to predict ✅
  ↓
AI predicts: 180 days (based on "flour" type)
  ↓
Result: Expiry date = Today + 180 days
  ↓
AI prediction used for this lot only
Ingredient.defaultExpiryDays remains null (not updated)
```

## 8. Optional Enhancements

1. **Filter by Status:** Add filter for "Expiring Soon", "Expired", "Good"
2. **Search:** Add search box to filter lots by ingredient name or lot ID
3. **Bulk Actions:** Select multiple lots and delete/edit them
4. **Export:** Export lots data to CSV/Excel
5. **Pagination:** If lots list gets very long, add pagination
6. **Lot History:** Show when lot was created, last modified, etc.
7. **Edit Lot:** Allow editing lot details (expiry date, supplier, cost)

---

## 9. ✅ CONFIRMATION: User-Specified Expiry = NO AI CALL

### **Confirmed Logic Flow:**

**Priority Order (when creating lots):**
1. **User-specified expiry** (from WhatsApp: "expires in 7 days")
   - ✅ **Use it directly**
   - ❌ **NO AI CALL**

2. **Ingredient.defaultExpiryDays** (if set and > 0)
   - ✅ **Use it**
   - ❌ **NO AI CALL**

3. **AI Prediction** (only if ingredient.defaultExpiryDays is NOT set or is 0)
   - ✅ **Call AI to predict**
   - ✅ **Use prediction for this lot only** (don't update ingredient)

4. **System defaults** (fallback if AI fails)
   - ✅ **Use from ingredientDefaults.ts**
   - ❌ **NO AI CALL**

### **Examples:**

**Example 1: User specifies expiry in WhatsApp**
```
User: "/stock 10kg flour expires in 7 days"
  ↓
AI parses: { expiryDays: 7 }  // User specified
  ↓
calculateExpiryDate(ingredient, 7)
  ↓
Priority 1: customExpiryDays = 7 → Use 7 days ✅
  ↓
Result: Expiry = Today + 7 days
  ↓
❌ NO AI CALL for expiry prediction
```

**Example 2: No expiry specified, ingredient has defaultExpiryDays**
```
User: "/stock 10kg flour"
  ↓
AI parses: { expiryDays: null }  // Not specified
  ↓
Ingredient: { defaultExpiryDays: 180 }
  ↓
calculateExpiryDate(ingredient, null)
  ↓
Priority 1: customExpiryDays? NO
Priority 2: defaultExpiryDays = 180 → Use 180 days ✅
  ↓
Result: Expiry = Today + 180 days
  ↓
❌ NO AI CALL for expiry prediction
```

**Example 3: No expiry specified, ingredient has NO defaultExpiryDays**
```
User: "/stock 5kg special-flour"
  ↓
AI parses: { expiryDays: null }  // Not specified
  ↓
Ingredient: { defaultExpiryDays: null }  // Not set
  ↓
calculateExpiryDate(ingredient, null)
  ↓
Priority 1: customExpiryDays? NO
Priority 2: defaultExpiryDays? NO
Priority 3: Call AI to predict ✅
  ↓
AI predicts: 180 days
  ↓
Result: Expiry = Today + 180 days
  ↓
✅ AI CALLED (only because defaultExpiryDays not set)
✅ Prediction used for lot only (ingredient.defaultExpiryDays stays null)
```

### **Key Confirmation:**
- ✅ **If user specifies expiry in WhatsApp, AI is NEVER called**
- ✅ **If ingredient has defaultExpiryDays, AI is NEVER called**
- ✅ **AI is ONLY called when ingredient.defaultExpiryDays is NOT set (or 0)**
- ✅ **AI prediction is used for the lot only, does NOT update ingredient.defaultExpiryDays**

## 10. Questions to Consider

1. **Should we allow editing lots?** (expiry date, supplier, cost)
2. **Should we show lot history?** (when created, last modified)
3. **Should we add pagination?** (if lots list gets very long)
4. **Should we add search?** (filter by ingredient name or lot ID)
5. **Should we save sort preference?** (localStorage)

Let me know which features you want to prioritize!
