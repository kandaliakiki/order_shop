import { connectToDB } from "../mongoose";
import IngredientLot from "../models/ingredientLot.model";
import Ingredient from "../models/ingredient.model";
import { differenceInDays } from "date-fns";

export const fetchExpiringIngredients = async (days: number = 7, limit: number = 5) => {
  await connectToDB();

  try {
    const allLots = await IngredientLot.find({
      currentStock: { $gt: 0 },
    })
      .populate("ingredient", "name unit currentStock")
      .sort({ expiryDate: 1 })
      .limit(limit * 10); // Get more to filter

    const now = new Date();
    const expiring = allLots
      .map((lot: any) => {
        const daysLeft = differenceInDays(new Date(lot.expiryDate), now);
        return {
          lotId: lot.lotId,
          ingredientId: lot.ingredient._id,
          ingredientName: lot.ingredient.name,
          quantity: lot.currentStock,
          unit: lot.unit,
          expiryDate: lot.expiryDate,
          daysLeft,
        };
      })
      .filter((item) => item.daysLeft <= days && item.daysLeft >= 0)
      .slice(0, limit);

    return expiring;
  } catch (error) {
    console.error("Error fetching expiring ingredients:", error);
    throw error;
  }
};

export const fetchIngredientLotsByIngredient = async (ingredientId: string) => {
  await connectToDB();

  try {
    return await IngredientLot.find({
      ingredient: ingredientId,
      currentStock: { $gt: 0 },
    })
      .sort({ expiryDate: 1 });
  } catch (error) {
    console.error("Error fetching ingredient lots:", error);
    throw error;
  }
};
