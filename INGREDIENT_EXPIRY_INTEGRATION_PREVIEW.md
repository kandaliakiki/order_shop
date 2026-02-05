# Ingredient Expiry Integration Preview

## Overview
Integrate lot-based expiry tracking into the ingredients section to display expiry information, warnings, and lot details.

---

## 1. Backend Changes

### 1.1 Update Ingredient Action (`server/lib/actions/ingredient.action.ts`)

**Add expiry aggregation logic to `fetchIngredients()`:**

```typescript
import IngredientLot from "../models/ingredientLot.model";
import { differenceInDays } from "date-fns";

export const fetchIngredients = async () => {
  await connectToDB();

  try {
    const ingredients = await Ingredient.find({}).sort({ name: 1 });
    
    // Enhance each ingredient with expiry information
    const ingredientsWithExpiry = await Promise.all(
      ingredients.map(async (ingredient) => {
        // Find all active lots for this ingredient
        const lots = await IngredientLot.find({
          ingredient: ingredient._id,
          currentStock: { $gt: 0 }, // Only non-empty lots
        })
          .sort({ expiryDate: 1 }) // Sort by expiry date (soonest first)
          .limit(1); // Get the soonest expiring lot

        const ingredientObj = ingredient.toObject();
        
        if (lots.length > 0) {
          const soonestLot = lots[0];
          const daysUntilExpiry = differenceInDays(
            new Date(soonestLot.expiryDate),
            new Date()
          );

          ingredientObj.expiryInfo = {
            soonestExpiryDate: soonestLot.expiryDate,
            daysUntilExpiry: daysUntilExpiry,
            lotId: soonestLot.lotId,
            quantity: soonestLot.currentStock,
            hasExpiringLots: daysUntilExpiry <= 7 && daysUntilExpiry >= 0,
            hasExpiredLots: daysUntilExpiry < 0,
            totalActiveLots: await IngredientLot.countDocuments({
              ingredient: ingredient._id,
              currentStock: { $gt: 0 },
            }),
          };
        } else {
          ingredientObj.expiryInfo = {
            soonestExpiryDate: null,
            daysUntilExpiry: null,
            lotId: null,
            quantity: 0,
            hasExpiringLots: false,
            hasExpiredLots: false,
            totalActiveLots: 0,
          };
        }

        return ingredientObj;
      })
    );

    return ingredientsWithExpiry;
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    throw error;
  }
};
```

### 1.2 New Endpoint: Get Ingredient Lots (`server/server.ts`)

**Add endpoint to fetch all lots for a specific ingredient:**

```typescript
// Get all lots for a specific ingredient
app.get("/api/ingredient/:id/lots", async (req: Request, res: Response) => {
  try {
    await connectToDB();
    const { id } = req.params;

    const lots = await IngredientLot.find({
      ingredient: id,
      currentStock: { $gt: 0 }, // Only active lots
    })
      .populate("ingredient", "name unit")
      .sort({ expiryDate: 1 }); // Sort by expiry date

    // Calculate days until expiry for each lot
    const lotsWithDays = lots.map((lot: any) => {
      const daysUntilExpiry = differenceInDays(
        new Date(lot.expiryDate),
        new Date()
      );
      return {
        ...lot.toObject(),
        daysUntilExpiry,
        isExpiringSoon: daysUntilExpiry <= 7 && daysUntilExpiry >= 0,
        isExpired: daysUntilExpiry < 0,
      };
    });

    res.status(200).json(lotsWithDays);
  } catch (error) {
    console.error("Error fetching ingredient lots:", error);
    res.status(500).json({ error: "Failed to fetch ingredient lots" });
  }
});
```

---

## 2. Frontend Changes

### 2.1 Update Ingredient Interface (`client/components/ingredient_component/IngredientContext.tsx`)

**Extend the `Ingredient` interface to include expiry information:**

```typescript
export interface IngredientExpiryInfo {
  soonestExpiryDate: string | null;
  daysUntilExpiry: number | null;
  lotId: string | null;
  quantity: number;
  hasExpiringLots: boolean;
  hasExpiredLots: boolean;
  totalActiveLots: number;
}

export interface Ingredient {
  _id: string;
  ingredientId: string;
  name: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  imageUrl: string;
  createdAt?: string;
  updatedAt?: string;
  expiryInfo?: IngredientExpiryInfo; // NEW: Expiry information
}
```

**Add function to fetch ingredient lots:**

```typescript
interface IngredientContextType {
  // ... existing properties
  fetchIngredientLots: (ingredientId: string) => Promise<IngredientLot[]>;
}

// Inside IngredientProvider:
const fetchIngredientLots = async (ingredientId: string) => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;
  try {
    const response = await fetch(`${backendUrl}/api/ingredient/${ingredientId}/lots`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch ingredient lots:", error);
    return [];
  }
};
```

### 2.2 Create Expiry Status Component (`client/components/ingredient_component/IngredientExpiryStatus.tsx`)

**New component to display expiry status with color coding:**

```typescript
import React from "react";
import { AlertTriangle, CheckCircle, XCircle, Calendar } from "lucide-react";
import { IngredientExpiryInfo } from "./IngredientContext";
import { format } from "date-fns";

interface IngredientExpiryStatusProps {
  expiryInfo?: IngredientExpiryInfo;
}

const IngredientExpiryStatus = ({ expiryInfo }: IngredientExpiryStatusProps) => {
  if (!expiryInfo || expiryInfo.totalActiveLots === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <CheckCircle className="h-4 w-4" />
        <span>No active lots</span>
      </div>
    );
  }

  if (expiryInfo.hasExpiredLots) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
        <XCircle className="h-4 w-4" />
        <span>Expired</span>
      </div>
    );
  }

  if (expiryInfo.hasExpiringLots && expiryInfo.daysUntilExpiry !== null) {
    const isUrgent = expiryInfo.daysUntilExpiry <= 3;
    return (
      <div
        className={`flex items-center gap-2 text-sm font-medium ${
          isUrgent ? "text-red-600" : "text-orange-600"
        }`}
      >
        <AlertTriangle className="h-4 w-4" />
        <span>
          Expires in {expiryInfo.daysUntilExpiry}{" "}
          {expiryInfo.daysUntilExpiry === 1 ? "day" : "days"}
        </span>
        {expiryInfo.soonestExpiryDate && (
          <span className="text-xs text-gray-500">
            ({format(new Date(expiryInfo.soonestExpiryDate), "MMM dd, yyyy")})
          </span>
        )}
      </div>
    );
  }

  if (expiryInfo.daysUntilExpiry !== null && expiryInfo.daysUntilExpiry > 7) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span>
          {expiryInfo.daysUntilExpiry} days remaining
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <Calendar className="h-4 w-4" />
      <span>No expiry data</span>
    </div>
  );
};

export default IngredientExpiryStatus;
```

### 2.3 Create Ingredient Lots Modal (`client/components/ingredient_component/IngredientLotsModal.tsx`)

**Modal to display all lots for an ingredient:**

```typescript
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { Ingredient } from "./IngredientContext";
import { useIngredients } from "./IngredientContext";

interface IngredientLot {
  _id: string;
  lotId: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  purchaseDate?: string;
  supplier?: string;
  cost?: number;
  currentStock: number;
  daysUntilExpiry: number;
  isExpiringSoon: boolean;
  isExpired: boolean;
}

interface IngredientLotsModalProps {
  ingredient: Ingredient | null;
  isOpen: boolean;
  onClose: () => void;
}

const IngredientLotsModal = ({
  ingredient,
  isOpen,
  onClose,
}: IngredientLotsModalProps) => {
  const { fetchIngredientLots } = useIngredients();
  const [lots, setLots] = useState<IngredientLot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && ingredient) {
      setLoading(true);
      fetchIngredientLots(ingredient._id)
        .then((data) => setLots(data))
        .catch((error) => console.error("Failed to fetch lots:", error))
        .finally(() => setLoading(false));
    }
  }, [isOpen, ingredient, fetchIngredientLots]);

  const getExpiryBadge = (lot: IngredientLot) => {
    if (lot.isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (lot.isExpiringSoon) {
      return (
        <Badge variant="outline" className="border-orange-500 text-orange-600">
          Expiring Soon
        </Badge>
      );
    }
    return <Badge variant="outline" className="border-green-500 text-green-600">Good</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Ingredient Lots: {ingredient?.name}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">Loading lots...</div>
        ) : lots.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No active lots found for this ingredient.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lot ID</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Days Left</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lots.map((lot) => (
                <TableRow key={lot._id}>
                  <TableCell className="font-medium">{lot.lotId}</TableCell>
                  <TableCell>
                    {lot.currentStock} {lot.unit}
                  </TableCell>
                  <TableCell>
                    {format(new Date(lot.expiryDate), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        lot.daysUntilExpiry < 0
                          ? "text-red-600 font-medium"
                          : lot.daysUntilExpiry <= 3
                          ? "text-orange-600 font-medium"
                          : "text-gray-600"
                      }
                    >
                      {lot.daysUntilExpiry < 0
                        ? `Expired ${Math.abs(lot.daysUntilExpiry)} days ago`
                        : `${lot.daysUntilExpiry} days`}
                    </span>
                  </TableCell>
                  <TableCell>
                    {lot.purchaseDate
                      ? format(new Date(lot.purchaseDate), "MMM dd, yyyy")
                      : "N/A"}
                  </TableCell>
                  <TableCell>{lot.supplier || "N/A"}</TableCell>
                  <TableCell>
                    {lot.cost ? `$${lot.cost.toFixed(2)}` : "N/A"}
                  </TableCell>
                  <TableCell>{getExpiryBadge(lot)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default IngredientLotsModal;
```

### 2.4 Update IngredientCard Component

**Add expiry status and "View Lots" button:**

```typescript
// Add to IngredientCard.tsx
import IngredientExpiryStatus from "./IngredientExpiryStatus";
import IngredientLotsModal from "./IngredientLotsModal";
import { useState } from "react";
import { Package } from "lucide-react";

const IngredientCard = ({ ingredient }: IngredientCardProps) => {
  const [showLotsModal, setShowLotsModal] = useState(false);
  // ... existing code

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      {/* ... existing header and image code ... */}

      <div className="space-y-2">
        {/* ... existing stock info ... */}
        
        {/* NEW: Expiry Status */}
        <div className="pt-2 border-t">
          <IngredientExpiryStatus expiryInfo={ingredient.expiryInfo} />
        </div>

        {/* NEW: View Lots Button */}
        {ingredient.expiryInfo && ingredient.expiryInfo.totalActiveLots > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={() => setShowLotsModal(true)}
          >
            <Package className="h-4 w-4 mr-2" />
            View Lots ({ingredient.expiryInfo.totalActiveLots})
          </Button>
        )}
      </div>

      {/* NEW: Lots Modal */}
      <IngredientLotsModal
        ingredient={ingredient}
        isOpen={showLotsModal}
        onClose={() => setShowLotsModal(false)}
      />
    </div>
  );
};
```

### 2.5 Update IngredientList Table View

**Add "Expiry" column to the table:**

```typescript
// Update IngredientList.tsx
import IngredientExpiryStatus from "./IngredientExpiryStatus";
import IngredientLotsModal from "./IngredientLotsModal";

const IngredientList = ({ isGridView }: IngredientListProps) => {
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [showLotsModal, setShowLotsModal] = useState(false);

  // ... existing code

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Minimum Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expiry</TableHead> {/* NEW */}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIngredients.map((ingredient) => (
              <TableRow key={ingredient._id}>
                {/* ... existing cells ... */}
                <TableCell>
                  <IngredientExpiryStatus expiryInfo={ingredient.expiryInfo} />
                  {ingredient.expiryInfo && ingredient.expiryInfo.totalActiveLots > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 text-xs"
                      onClick={() => {
                        setSelectedIngredient(ingredient);
                        setShowLotsModal(true);
                      }}
                    >
                      View Lots
                    </Button>
                  )}
                </TableCell>
                {/* ... existing actions cell ... */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* NEW: Lots Modal */}
      <IngredientLotsModal
        ingredient={selectedIngredient}
        isOpen={showLotsModal}
        onClose={() => {
          setShowLotsModal(false);
          setSelectedIngredient(null);
        }}
      />
    </>
  );
};
```

---

## 3. Visual Design & UX

### 3.1 Color Coding
- **Red**: Expired or expiring within 3 days (urgent)
- **Orange**: Expiring within 4-7 days (warning)
- **Green**: More than 7 days remaining (good)
- **Gray**: No active lots or no expiry data

### 3.2 Badge Indicators
- **Expired**: Red badge with "Expired" text
- **Expiring Soon**: Orange badge with days remaining
- **Good**: Green badge with days remaining
- **No Lots**: Gray text with "No active lots"

### 3.3 Information Display
- **Card View**: Show expiry status below stock status, with "View Lots" button if lots exist
- **Table View**: New "Expiry" column showing status, with clickable "View Lots" link
- **Lots Modal**: Detailed table showing all lots with expiry dates, quantities, and status

---

## 4. Summary of Changes

### Backend:
1. ✅ Update `fetchIngredients()` to aggregate expiry data from `IngredientLot`
2. ✅ Add new endpoint `/api/ingredient/:id/lots` to fetch all lots for an ingredient

### Frontend:
1. ✅ Extend `Ingredient` interface with `expiryInfo` field
2. ✅ Create `IngredientExpiryStatus` component for visual expiry indicators
3. ✅ Create `IngredientLotsModal` component to display all lots
4. ✅ Update `IngredientCard` to show expiry status and lots button
5. ✅ Update `IngredientList` table to include expiry column
6. ✅ Add `fetchIngredientLots` function to context

### Benefits:
- ✅ Users can see expiry warnings at a glance
- ✅ Color-coded indicators for quick visual scanning
- ✅ Detailed lot information available on demand
- ✅ Helps prevent food waste by highlighting expiring ingredients
- ✅ Integrates seamlessly with existing lot-based tracking system

---

## 5. Optional Enhancements (Future)

1. **Filter by Expiry**: Add filter to show only expiring/expired ingredients
2. **Sort by Expiry**: Add sort option to order by soonest expiring
3. **Bulk Actions**: Select multiple expiring ingredients for batch operations
4. **Notifications**: Alert users when viewing ingredients that are expiring soon
5. **Export**: Export expiry report for inventory management
