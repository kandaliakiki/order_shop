import { connectToDB } from "../mongoose";
import BakeSheet, { BakeSheetData } from "../models/bakeSheet.model";
import Order from "../models/order.model";
import Product from "../models/product.model";
import Ingredient from "../models/ingredient.model";
import { LotDeductionService } from "../services/lotDeduction.service";
import { format } from "date-fns";

export const fetchBakeSheets = async (date?: string) => {
  await connectToDB();

  try {
    const query: any = {};
    if (date) {
      // Support both single date and date range format
      query.$or = [
        { date: date },
        { "dateRange.start": date },
        { "dateRange.end": date },
      ];
    }

    return await BakeSheet.find(query)
      .populate("items.productId", "name price")
      .sort({ createdAt: -1 });
  } catch (error) {
    console.error("Error fetching bake sheets:", error);
    throw error;
  }
};

export const fetchBakeSheetById = async (sheetId: string) => {
  await connectToDB();

  try {
    return await BakeSheet.findOne({ sheetId })
      .populate("items.productId", "name price");
  } catch (error) {
    console.error("Error fetching bake sheet by ID:", error);
    throw error;
  }
};

export const createBakeSheet = async (bakeSheetData: Omit<BakeSheetData, "sheetId" | "createdAt">) => {
  await connectToDB();

  try {
    const bakeSheet = new BakeSheet(bakeSheetData);
    await bakeSheet.save();
    return bakeSheet;
  } catch (error) {
    console.error("Error creating bake sheet:", error);
    throw error;
  }
};

export const updateBakeSheetStatus = async (sheetId: string, status: "draft" | "confirmed" | "completed") => {
  await connectToDB();

  try {
    return await BakeSheet.findOneAndUpdate(
      { sheetId },
      { status },
      { new: true }
    );
  } catch (error) {
    console.error("Error updating bake sheet status:", error);
    throw error;
  }
};

/**
 * Generate bake sheet from orders (simple fetch, no document storage)
 * Queries orders by pickupDate and calculates ingredients needed
 */
export const generateBakeSheetFromOrders = async (
  startDate?: string, // YYYY-MM-DD format, defaults to today
  endDate?: string // YYYY-MM-DD format, defaults to startDate
): Promise<{
  date: string;
  dateRange: {
    start: string;
    end: string;
  };
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
  }>;
  ingredientRequirements: Array<{
    ingredientId: string;
    quantity: number;
    unit: string;
  }>;
  stockChecks: Array<{
    name: string;
    needed: number;
    available: number;
    unit: string;
    sufficient: boolean;
    recommendedLots?: Array<{
      lotId: string;
      lotNumber: string;
      currentStock: number;
      expiryDate: Date;
      purchaseDate?: Date;
      isExpiringSoon: boolean;
      isExpired: boolean;
    }>;
    totalAvailable: number;
  }>;
  totalOrders: number;
  dailyBreakdown?: Array<{
    date: string;
    orders: number;
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
    }>;
    ingredientRequirements?: Array<{
      ingredientId: string;
      ingredientName: string;
      quantity: number;
      unit: string;
    }>;
  }>;
}> => {
  await connectToDB();

  // 1. Parse date range (default to today)
  const startDateStr = startDate || format(new Date(), "yyyy-MM-dd");
  const endDateStr = endDate || startDateStr;
  
  const startDateObj = new Date(startDateStr);
  startDateObj.setHours(0, 0, 0, 0);
  const endDateObj = new Date(endDateStr);
  endDateObj.setHours(23, 59, 59, 999);

  // 2. Query orders by PICKUP DATE (not createdAt)
  // Exclude Cancelled and Completed orders (Option B)
  // For orders without pickupDate, fallback to createdAt
  const orders = await Order.find({
    $and: [
      {
        $or: [
          { pickupDate: { $gte: startDateObj, $lte: endDateObj } },
          // Fallback: if pickupDate not set, use createdAt (for existing orders)
          { 
            $or: [
              { pickupDate: { $exists: false } },
              { pickupDate: null }
            ],
            createdAt: { $gte: startDateObj, $lte: endDateObj }
          },
        ],
      },
      { status: { $nin: ["Cancelled", "Completed"] } }, // Exclude cancelled and completed
    ],
  }).sort({ pickupDate: 1, createdAt: 1 });

  // 3. Aggregate products (overall + per day)
  const productAggregation: Record<string, number> = {};
  const dailyProductAggregation: Record<string, Record<string, number>> = {};
  const ordersByDate: Record<string, typeof orders> = {};

  // Group orders by date
  orders.forEach((order) => {
    // Use pickupDate if available, otherwise use createdAt
    const orderDate = order.pickupDate 
      ? format(new Date(order.pickupDate), "yyyy-MM-dd")
      : format(new Date(order.createdAt), "yyyy-MM-dd");
    
    if (!ordersByDate[orderDate]) {
      ordersByDate[orderDate] = [];
    }
    ordersByDate[orderDate].push(order);
  });

  // Aggregate products per day and overall
  Object.entries(ordersByDate).forEach(([date, dateOrders]) => {
    dailyProductAggregation[date] = {};
    
    dateOrders.forEach((order) => {
      order.items.forEach((item) => {
        // Overall aggregation
        if (productAggregation[item.name]) {
          productAggregation[item.name] += item.quantity;
        } else {
          productAggregation[item.name] = item.quantity;
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

  // 4. Calculate ingredient requirements
  const products = await Product.find({}).populate(
    "ingredients.ingredient",
    "name unit currentStock"
  );

  const ingredientRequirements: Record<
    string,
    { quantity: number; unit: string }
  > = {};

  for (const [productName, totalQuantity] of Object.entries(productAggregation)) {
    const product = products.find(
      (p) => p.name.toLowerCase() === productName.toLowerCase()
    );
    if (product && product.ingredients) {
      product.ingredients.forEach((ing: any) => {
        const ingredient = ing.ingredient;
        if (ingredient) {
          const totalNeeded = ing.quantity * totalQuantity;
          const key = `${ingredient._id}_${ing.unit}`;
          if (ingredientRequirements[key]) {
            ingredientRequirements[key].quantity += totalNeeded;
          } else {
            ingredientRequirements[key] = {
              quantity: totalNeeded,
              unit: ing.unit,
            };
          }
        }
      });
    }
  }

  // 5. Check stock and get recommended lots (FEFO)
  const lotDeductionService = new LotDeductionService();
  const stockChecks: Array<{
    name: string;
    needed: number;
    available: number;
    unit: string;
    sufficient: boolean;
    recommendedLots?: Array<{
      lotId: string;
      lotNumber: string;
      currentStock: number;
      expiryDate: Date;
      purchaseDate?: Date;
      isExpiringSoon: boolean;
      isExpired: boolean;
    }>;
    totalAvailable: number;
  }> = [];

  for (const [key, req] of Object.entries(ingredientRequirements)) {
    const [ingredientId, unit] = key.split("_");
    const ingredient = await Ingredient.findById(ingredientId);
    if (ingredient) {
      const lotRecommendations =
        await lotDeductionService.getRecommendedLots(ingredientId, req.quantity);

      stockChecks.push({
        name: ingredient.name,
        needed: req.quantity,
        available: ingredient.currentStock,
        unit: req.unit,
        sufficient: ingredient.currentStock >= req.quantity,
        recommendedLots: lotRecommendations.lots,
        totalAvailable: lotRecommendations.totalAvailable,
      });
    }
  }

  // 6. Format items
  const items = Object.entries(productAggregation).map(([name, qty]) => {
    const product = products.find(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );
    return {
      productId: product?._id?.toString() || "",
      productName: name,
      quantity: qty,
    };
  });

  // 7. Calculate daily ingredient requirements
  const dailyIngredientRequirements: Record<string, Record<string, { quantity: number; unit: string }>> = {};
  
  // Calculate ingredients needed per day
  Object.entries(dailyProductAggregation).forEach(([date, dateProducts]) => {
    dailyIngredientRequirements[date] = {};
    
    Object.entries(dateProducts).forEach(([productName, quantity]) => {
      const product = products.find(
        (p) => p.name.toLowerCase() === productName.toLowerCase()
      );
      if (product && product.ingredients) {
        product.ingredients.forEach((ing: any) => {
          const ingredient = ing.ingredient;
          if (ingredient) {
            const needed = ing.quantity * quantity;
            const key = `${ingredient._id}_${ing.unit}`;
            if (dailyIngredientRequirements[date][key]) {
              dailyIngredientRequirements[date][key].quantity += needed;
            } else {
              dailyIngredientRequirements[date][key] = {
                quantity: needed,
                unit: ing.unit,
              };
            }
          }
        });
      }
    });
  });

  // 8. Format daily breakdown
  const dailyBreakdown = await Promise.all(
    Object.entries(dailyProductAggregation)
      .sort() // Sort by date
      .map(async ([date, dateProducts]) => {
        const dateOrders = ordersByDate[date] || [];
        const dateIngredientReqs = dailyIngredientRequirements[date] || {};
        
        // Get ingredient names for the daily breakdown
        const ingredientReqs = await Promise.all(
          Object.entries(dateIngredientReqs).map(async ([key, req]) => {
            const [ingredientId, unit] = key.split("_");
            const ingredient = await Ingredient.findById(ingredientId);
            return {
              ingredientId,
              ingredientName: ingredient?.name || "Unknown",
              quantity: req.quantity,
              unit: req.unit,
            };
          })
        );
        
        return {
          date,
          orders: dateOrders.length,
          items: Object.entries(dateProducts).map(([name, qty]) => {
            const product = products.find(
              (p) => p.name.toLowerCase() === name.toLowerCase()
            );
            return {
              productId: product?._id?.toString() || "",
              productName: name,
              quantity: qty,
            };
          }),
          ingredientRequirements: ingredientReqs,
        };
      })
  );

  return {
    date: startDateStr === endDateStr ? startDateStr : `${startDateStr}_to_${endDateStr}`,
    dateRange: {
      start: startDateStr,
      end: endDateStr,
    },
    items,
    ingredientRequirements: Object.entries(ingredientRequirements).map(
      ([key, req]) => {
        const [ingredientId, unit] = key.split("_");
        return { ingredientId, ...req };
      }
    ),
    stockChecks,
    totalOrders: orders.length,
    // Return dailyBreakdown if date range is selected (not single day) and there are orders
    dailyBreakdown: startDateStr !== endDateStr && dailyBreakdown.length > 0 ? dailyBreakdown : undefined,
  };
};
