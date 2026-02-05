import { connectToDB } from "../mongoose";
import IngredientLot from "../models/ingredientLot.model";
import Ingredient from "../models/ingredient.model";
import { differenceInDays, format } from "date-fns";

export interface ExpiryCheckResult {
  message: string;
}

export class ExpiryCheckService {
  async processExpiryCommand(
    itemName?: string
  ): Promise<ExpiryCheckResult> {
    try {
      await connectToDB();

      if (itemName) {
        // Check specific item
        const ingredient = await Ingredient.findOne({
          name: { $regex: new RegExp(itemName, "i") },
        });

        if (!ingredient) {
          return {
            message: `❌ ${itemName} not found in ingredients.`,
          };
        }

        const lots = await IngredientLot.find({
          ingredient: ingredient._id,
          currentStock: { $gt: 0 }, // Only non-empty lots
        }).sort({ expiryDate: 1 });

        if (lots.length === 0) {
          return {
            message: `✅ ${itemName} - No active lots found.`,
          };
        }

        const expiringSoon = lots.filter((lot) => {
          const daysUntilExpiry = differenceInDays(
            new Date(lot.expiryDate),
            new Date()
          );
          return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
        });

        if (expiringSoon.length === 0) {
          return {
            message: `✅ ${itemName} - No items expiring in the next 7 days.`,
          };
        }

        const list = expiringSoon
          .map(
            (lot) =>
              `• ${lot.currentStock} ${lot.unit} - Expires: ${format(
                new Date(lot.expiryDate),
                "MMM dd, yyyy"
              )} (${differenceInDays(new Date(lot.expiryDate), new Date())} days)`
          )
          .join("\n");

        return {
          message: `⚠️ ${itemName} - Expiring Soon:\n${list}`,
        };
      } else {
        // Top 5 expiring soonest
        const allLots = await IngredientLot.find({
          currentStock: { $gt: 0 },
        })
          .populate("ingredient", "name")
          .sort({ expiryDate: 1 })
          .limit(5);

        if (allLots.length === 0) {
          return {
            message: `✅ No active ingredient lots found.`,
          };
        }

        const top5 = allLots
          .map((lot: any) => {
            const daysLeft = differenceInDays(
              new Date(lot.expiryDate),
              new Date()
            );
            return {
              ingredientName: lot.ingredient.name,
              quantity: lot.currentStock,
              unit: lot.unit,
              expiryDate: lot.expiryDate,
              daysLeft,
            };
          })
          .filter((item) => item.daysLeft <= 7 && item.daysLeft >= 0);

        if (top5.length === 0) {
          return {
            message: `✅ No ingredients expiring in the next 7 days.`,
          };
        }

        const list = top5
          .map(
            (item) =>
              `• ${item.ingredientName}: ${item.quantity} ${item.unit} - ${format(
                new Date(item.expiryDate),
                "MMM dd"
              )} (${item.daysLeft} days)`
          )
          .join("\n");

        return {
          message: `⚠️ Top 5 Expiring Ingredients:\n${list}`,
        };
      }
    } catch (error: any) {
      console.error("Error processing expiry command:", error);
      return {
        message: `❌ Error checking expiry: ${error.message}`,
      };
    }
  }
}
