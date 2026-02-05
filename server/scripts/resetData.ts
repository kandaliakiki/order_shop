import dotenv from "dotenv";
import { connectToDB } from "../lib/mongoose";
import IngredientLot from "../lib/models/ingredientLot.model";
import Ingredient from "../lib/models/ingredient.model";
import Order from "../lib/models/order.model";
import CommandLog from "../lib/models/commandLog.model";
import BakeSheet from "../lib/models/bakeSheet.model";
import WasteLog from "../lib/models/wasteLog.model";
import WhatsAppMessage from "../lib/models/whatsappMessage.model";
import { addDays, subDays } from "date-fns";

// Load environment variables
dotenv.config({ path: ".env.local" });

async function resetData() {
  try {
    await connectToDB();
    console.log("✅ Connected to database");

    console.log("\n🗑️  Starting data reset...\n");

    // Step 1: Reset ingredient stock to 0 (before deleting lots)
    console.log("Resetting ingredient stock...");
    const ingredients = await Ingredient.find({});
    for (const ingredient of ingredients) {
      ingredient.currentStock = 0;
      await ingredient.save();
    }
    console.log(`  ✅ Reset stock for ${ingredients.length} ingredients to 0\n`);

    // Step 2: Delete all data from specified collections
    console.log("Deleting all data...");
    
    const bakeSheetResult = await BakeSheet.deleteMany({});
    console.log(`  ✅ Deleted ${bakeSheetResult.deletedCount} bake sheets`);

    const commandLogResult = await CommandLog.deleteMany({});
    console.log(`  ✅ Deleted ${commandLogResult.deletedCount} command logs`);

    const ingredientLotResult = await IngredientLot.deleteMany({});
    console.log(`  ✅ Deleted ${ingredientLotResult.deletedCount} ingredient lots`);

    const orderResult = await Order.deleteMany({});
    console.log(`  ✅ Deleted ${orderResult.deletedCount} orders`);

    const wasteLogResult = await WasteLog.deleteMany({});
    console.log(`  ✅ Deleted ${wasteLogResult.deletedCount} waste logs`);

    const whatsappMessageResult = await WhatsAppMessage.deleteMany({});
    console.log(`  ✅ Deleted ${whatsappMessageResult.deletedCount} WhatsApp messages`);

    console.log("\n✅ All data deleted successfully!\n");

    // Step 3: Repopulate ingredient lots
    console.log("📦 Repopulating ingredient lots...\n");
    
    if (ingredients.length === 0) {
      console.log("⚠️  No ingredients found. Please seed ingredients first using: npm run seed");
      process.exit(0);
    }

    // Lots data (same as seedIngredientsAndLots.ts)
    const lotsData = [
      // Egg - 15 pieces total
      {
        ingredientName: "Egg",
        lots: [
          {
            quantity: 10,
            expiryDate: addDays(new Date(), 20), // Expires in 20 days
            purchaseDate: subDays(new Date(), 10),
            supplier: "Fresh Farm Supplies",
            cost: 2.50,
            currentStock: 10,
          },
          {
            quantity: 5,
            expiryDate: addDays(new Date(), 5), // Expiring soon!
            purchaseDate: subDays(new Date(), 25),
            supplier: "Local Market",
            cost: 1.25,
            currentStock: 5,
          },
        ],
      },
      // Flour - 41 kg total
      {
        ingredientName: "Flour",
        lots: [
          {
            quantity: 20,
            expiryDate: addDays(new Date(), 150), // 5 months
            purchaseDate: subDays(new Date(), 30),
            supplier: "Bulk Wholesale",
            cost: 15.00,
            currentStock: 20,
          },
          {
            quantity: 15,
            expiryDate: addDays(new Date(), 120), // 4 months
            purchaseDate: subDays(new Date(), 60),
            supplier: "Bulk Wholesale",
            cost: 11.25,
            currentStock: 15,
          },
          {
            quantity: 6,
            expiryDate: addDays(new Date(), 90), // 3 months
            purchaseDate: subDays(new Date(), 90),
            supplier: "Local Market",
            cost: 4.50,
            currentStock: 6,
          },
        ],
      },
      // Cheese - 280g total
      {
        ingredientName: "Cheese",
        lots: [
          {
            quantity: 150,
            expiryDate: addDays(new Date(), 8), // Expiring soon!
            purchaseDate: subDays(new Date(), 6),
            supplier: "Dairy Delight",
            cost: 4.50,
            currentStock: 150,
          },
          {
            quantity: 130,
            expiryDate: addDays(new Date(), 12), // Expiring soon!
            purchaseDate: subDays(new Date(), 2),
            supplier: "Dairy Delight",
            cost: 3.90,
            currentStock: 130,
          },
        ],
      },
      // Sugar - 25 kg total
      {
        ingredientName: "Sugar",
        lots: [
          {
            quantity: 15,
            expiryDate: addDays(new Date(), 300), // 10 months
            purchaseDate: subDays(new Date(), 60),
            supplier: "Sweet Supplies Co",
            cost: 12.00,
            currentStock: 15,
          },
          {
            quantity: 10,
            expiryDate: addDays(new Date(), 365), // 1 year
            purchaseDate: subDays(new Date(), 0),
            supplier: "Sweet Supplies Co",
            cost: 8.00,
            currentStock: 10,
          },
        ],
      },
      // Butter - 8 kg total
      {
        ingredientName: "Butter",
        lots: [
          {
            quantity: 5,
            expiryDate: addDays(new Date(), 10), // Expiring soon!
            purchaseDate: subDays(new Date(), 4),
            supplier: "Dairy Delight",
            cost: 12.50,
            currentStock: 5,
          },
          {
            quantity: 3,
            expiryDate: addDays(new Date(), 14),
            purchaseDate: subDays(new Date(), 0),
            supplier: "Dairy Delight",
            cost: 7.50,
            currentStock: 3,
          },
        ],
      },
      // Milk - 12 L total
      {
        ingredientName: "Milk",
        lots: [
          {
            quantity: 6,
            expiryDate: addDays(new Date(), 3), // Expiring very soon!
            purchaseDate: subDays(new Date(), 4),
            supplier: "Fresh Dairy",
            cost: 4.20,
            currentStock: 6,
          },
          {
            quantity: 6,
            expiryDate: addDays(new Date(), 5), // Expiring soon!
            purchaseDate: subDays(new Date(), 2),
            supplier: "Fresh Dairy",
            cost: 4.20,
            currentStock: 6,
          },
        ],
      },
      // Vanilla Extract - 500 ml total
      {
        ingredientName: "Vanilla Extract",
        lots: [
          {
            quantity: 300,
            expiryDate: addDays(new Date(), 300), // 10 months
            purchaseDate: subDays(new Date(), 60),
            supplier: "Flavor World",
            cost: 25.00,
            currentStock: 300,
          },
          {
            quantity: 200,
            expiryDate: addDays(new Date(), 365), // 1 year
            purchaseDate: subDays(new Date(), 0),
            supplier: "Flavor World",
            cost: 16.67,
            currentStock: 200,
          },
        ],
      },
      // Baking Powder - 450g total
      {
        ingredientName: "Baking Powder",
        lots: [
          {
            quantity: 250,
            expiryDate: addDays(new Date(), 150), // 5 months
            purchaseDate: subDays(new Date(), 30),
            supplier: "Baking Essentials",
            cost: 3.50,
            currentStock: 250,
          },
          {
            quantity: 200,
            expiryDate: addDays(new Date(), 180), // 6 months
            purchaseDate: subDays(new Date(), 0),
            supplier: "Baking Essentials",
            cost: 2.80,
            currentStock: 200,
          },
        ],
      },
      // Salt - 1000g total
      {
        ingredientName: "Salt",
        lots: [
          {
            quantity: 500,
            expiryDate: addDays(new Date(), 365), // 1 year
            purchaseDate: subDays(new Date(), 0),
            supplier: "Basic Supplies",
            cost: 1.50,
            currentStock: 500,
          },
          {
            quantity: 500,
            expiryDate: addDays(new Date(), 365), // 1 year
            purchaseDate: subDays(new Date(), 90),
            supplier: "Basic Supplies",
            cost: 1.50,
            currentStock: 500,
          },
        ],
      },
      // Chocolate Chips - 1200g total
      {
        ingredientName: "Chocolate Chips",
        lots: [
          {
            quantity: 700,
            expiryDate: addDays(new Date(), 150), // 5 months
            purchaseDate: subDays(new Date(), 30),
            supplier: "Sweet Treats Co",
            cost: 8.40,
            currentStock: 700,
          },
          {
            quantity: 500,
            expiryDate: addDays(new Date(), 180), // 6 months
            purchaseDate: subDays(new Date(), 0),
            supplier: "Sweet Treats Co",
            cost: 6.00,
            currentStock: 500,
          },
        ],
      },
    ];

    // Create lots for each ingredient
    let totalLotsCreated = 0;
    for (const lotGroup of lotsData) {
      const ingredient = ingredients.find((ing) => ing.name === lotGroup.ingredientName);
      if (!ingredient) {
        console.log(`⚠️  Ingredient not found: ${lotGroup.ingredientName}, skipping...`);
        continue;
      }

      // Create new lots
      for (const lotData of lotGroup.lots) {
        const lot = await IngredientLot.create({
          ingredient: ingredient._id,
          quantity: lotData.quantity,
          unit: ingredient.unit,
          expiryDate: lotData.expiryDate,
          purchaseDate: lotData.purchaseDate,
          supplier: lotData.supplier,
          cost: lotData.cost,
          currentStock: lotData.currentStock,
          expirySource: "user",
        });
        console.log(`  ✅ Created lot: ${lot.lotId} - ${lotData.currentStock}${ingredient.unit} (expires ${lotData.expiryDate.toLocaleDateString()})`);
        totalLotsCreated++;
      }
    }

    // Step 4: Update ingredient stock totals based on created lots
    console.log("\n📊 Syncing ingredient stock with lots...");
    for (const ingredient of ingredients) {
      const lots = await IngredientLot.find({ ingredient: ingredient._id });
      const totalStock = lots.reduce((sum, lot) => sum + lot.currentStock, 0);
      ingredient.currentStock = totalStock;
      await ingredient.save();
      console.log(`  ✅ ${ingredient.name}: ${totalStock} ${ingredient.unit} (from ${lots.length} lot(s))`);
    }

    console.log("\n✅ Data reset and repopulation completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Ingredient lots created: ${totalLotsCreated}`);
    
    const expiringSoon = await IngredientLot.countDocuments({
      expiryDate: {
        $gte: new Date(),
        $lte: addDays(new Date(), 7),
      },
      currentStock: { $gt: 0 },
    });
    console.log(`   - Expiring soon (≤7 days): ${expiringSoon}`);
    
    const expired = await IngredientLot.countDocuments({
      expiryDate: { $lt: new Date() },
      currentStock: { $gt: 0 },
    });
    console.log(`   - Expired: ${expired}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error resetting data:", error);
    process.exit(1);
  }
}

resetData();
