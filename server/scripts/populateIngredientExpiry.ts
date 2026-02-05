import dotenv from "dotenv";
import { connectToDB } from "../lib/mongoose";
import Ingredient from "../lib/models/ingredient.model";

// Load environment variables
dotenv.config({ path: ".env.local" });

async function populateIngredientExpiry() {
  try {
    await connectToDB();
    console.log("✅ Connected to database");

    // Ingredient expiry mapping based on typical shelf life
    // Leaving Butter as "Not set" for testing purposes
    const ingredientExpiryMap: Record<string, number> = {
      "Baking Powder": 60, // Already set, but will update to ensure consistency
      "Butter": 1, // Leave NOT SET for testing
      "Cheese": 30, // Dairy, refrigerated
      "Chocolate Chips": 180, // Dry goods, sealed
      "Egg": 30, // Refrigerated
      "Flour": 180, // Dry goods, sealed
      "Milk": 7, // Dairy, short shelf life
      "Salt": 365, // Preservative, very long shelf life
      "Sugar": 365, // Dry goods, very long shelf life
      "Vanilla Extract": 365, // Alcohol-based, very long shelf life
    };

    let updatedCount = 0;
    let skippedCount = 0;

    for (const [name, expiryDays] of Object.entries(ingredientExpiryMap)) {
      const ingredient = await Ingredient.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });

      if (!ingredient) {
        console.log(`⚠️  Ingredient "${name}" not found, skipping...`);
        skippedCount++;
        continue;
      }

      if (expiryDays === undefined) {
        // Leave as is (not set) for testing
        console.log(`⏭️  Skipping "${name}" - leaving as "Not set" for testing`);
        skippedCount++;
        continue;
      }

      // Update the ingredient
      ingredient.defaultExpiryDays = expiryDays;
      await ingredient.save();

      console.log(`✅ Updated "${name}": ${expiryDays} days`);
      updatedCount++;
    }

    console.log("\n📊 Summary:");
    console.log(`✅ Updated: ${updatedCount} ingredients`);
    console.log(`⏭️  Skipped: ${skippedCount} ingredients`);
    console.log("\n✨ Done!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error populating ingredient expiry:", error);
    process.exit(1);
  }
}

populateIngredientExpiry();
