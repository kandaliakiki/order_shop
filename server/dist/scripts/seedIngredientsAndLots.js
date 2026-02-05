"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = require("../lib/mongoose");
const ingredient_model_1 = __importDefault(require("../lib/models/ingredient.model"));
const ingredientLot_model_1 = __importDefault(require("../lib/models/ingredientLot.model"));
const date_fns_1 = require("date-fns");
// Load environment variables
dotenv_1.default.config({ path: ".env.local" });
function seedIngredientsAndLots() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, mongoose_1.connectToDB)();
            console.log("✅ Connected to database");
            // Clear existing data (optional - comment out if you want to keep existing data)
            // await IngredientLot.deleteMany({});
            // await Ingredient.deleteMany({});
            // console.log("🗑️  Cleared existing data");
            // Ingredients to seed
            const ingredientsData = [
                {
                    name: "Egg",
                    unit: "pcs",
                    currentStock: 15,
                    minimumStock: 10,
                    imageUrl: "",
                },
                {
                    name: "Flour",
                    unit: "kg",
                    currentStock: 41,
                    minimumStock: 20,
                    imageUrl: "",
                },
                {
                    name: "Cheese",
                    unit: "g",
                    currentStock: 280,
                    minimumStock: 100,
                    imageUrl: "",
                },
                {
                    name: "Sugar",
                    unit: "kg",
                    currentStock: 25,
                    minimumStock: 10,
                    imageUrl: "",
                },
                {
                    name: "Butter",
                    unit: "kg",
                    currentStock: 8,
                    minimumStock: 5,
                    imageUrl: "",
                },
                {
                    name: "Milk",
                    unit: "L",
                    currentStock: 12,
                    minimumStock: 5,
                    imageUrl: "",
                },
                {
                    name: "Vanilla Extract",
                    unit: "ml",
                    currentStock: 500,
                    minimumStock: 200,
                    imageUrl: "",
                },
                {
                    name: "Baking Powder",
                    unit: "g",
                    currentStock: 450,
                    minimumStock: 200,
                    imageUrl: "",
                },
                {
                    name: "Salt",
                    unit: "g",
                    currentStock: 1000,
                    minimumStock: 500,
                    imageUrl: "",
                },
                {
                    name: "Chocolate Chips",
                    unit: "g",
                    currentStock: 1200,
                    minimumStock: 500,
                    imageUrl: "",
                },
            ];
            // Create or update ingredients
            const ingredients = [];
            for (const ingredientData of ingredientsData) {
                let ingredient = yield ingredient_model_1.default.findOne({ name: ingredientData.name });
                if (ingredient) {
                    // Update existing ingredient (preserve existing ingredientId)
                    ingredient.currentStock = ingredientData.currentStock;
                    ingredient.minimumStock = ingredientData.minimumStock;
                    ingredient.unit = ingredientData.unit;
                    ingredient.imageUrl = ingredientData.imageUrl || ingredient.imageUrl; // Keep existing image if new one is empty
                    yield ingredient.save();
                    console.log(`📝 Updated ingredient: ${ingredient.name} (${ingredient.ingredientId})`);
                }
                else {
                    // Create new ingredient
                    ingredient = yield ingredient_model_1.default.create(ingredientData);
                    console.log(`✅ Created ingredient: ${ingredient.name} (${ingredient.ingredientId})`);
                }
                ingredients.push(ingredient);
            }
            // Create lots for each ingredient
            const lotsData = [
                // Egg - 15 pieces total
                {
                    ingredientName: "Egg",
                    lots: [
                        {
                            quantity: 10,
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 20), // Expires in 20 days
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 10),
                            supplier: "Fresh Farm Supplies",
                            cost: 2.50,
                            currentStock: 10,
                        },
                        {
                            quantity: 5,
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 5), // Expiring soon!
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 25),
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
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 150), // 5 months
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 30),
                            supplier: "Bulk Wholesale",
                            cost: 15.00,
                            currentStock: 20,
                        },
                        {
                            quantity: 15,
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 120), // 4 months
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 60),
                            supplier: "Bulk Wholesale",
                            cost: 11.25,
                            currentStock: 15,
                        },
                        {
                            quantity: 6,
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 90), // 3 months
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 90),
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
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 8), // Expiring soon!
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 6),
                            supplier: "Dairy Delight",
                            cost: 4.50,
                            currentStock: 150,
                        },
                        {
                            quantity: 130,
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 12), // Expiring soon!
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 2),
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
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 300), // 10 months
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 60),
                            supplier: "Sweet Supplies Co",
                            cost: 12.00,
                            currentStock: 15,
                        },
                        {
                            quantity: 10,
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 365), // 1 year
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 0),
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
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 10), // Expiring soon!
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 4),
                            supplier: "Dairy Delight",
                            cost: 12.50,
                            currentStock: 5,
                        },
                        {
                            quantity: 3,
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 14),
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 0),
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
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 3), // Expiring very soon!
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 4),
                            supplier: "Fresh Dairy",
                            cost: 4.20,
                            currentStock: 6,
                        },
                        {
                            quantity: 6,
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 5), // Expiring soon!
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 2),
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
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 300), // 10 months
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 60),
                            supplier: "Flavor World",
                            cost: 25.00,
                            currentStock: 300,
                        },
                        {
                            quantity: 200,
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 365), // 1 year
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 0),
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
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 150), // 5 months
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 30),
                            supplier: "Baking Essentials",
                            cost: 3.50,
                            currentStock: 250,
                        },
                        {
                            quantity: 200,
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 180), // 6 months
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 0),
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
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 365), // 1 year
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 0),
                            supplier: "Basic Supplies",
                            cost: 1.50,
                            currentStock: 500,
                        },
                        {
                            quantity: 500,
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 365), // 1 year
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 90),
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
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 150), // 5 months
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 30),
                            supplier: "Sweet Treats Co",
                            cost: 8.40,
                            currentStock: 700,
                        },
                        {
                            quantity: 500,
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 180), // 6 months
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 0),
                            supplier: "Sweet Treats Co",
                            cost: 6.00,
                            currentStock: 500,
                        },
                    ],
                },
            ];
            // Create lots for each ingredient
            for (const lotGroup of lotsData) {
                const ingredient = ingredients.find((ing) => ing.name === lotGroup.ingredientName);
                if (!ingredient) {
                    console.log(`⚠️  Ingredient not found: ${lotGroup.ingredientName}`);
                    continue;
                }
                // Delete existing lots for this ingredient (optional - comment out to keep existing)
                yield ingredientLot_model_1.default.deleteMany({ ingredient: ingredient._id });
                console.log(`🗑️  Cleared existing lots for ${ingredient.name}`);
                // Create new lots
                for (const lotData of lotGroup.lots) {
                    const lot = yield ingredientLot_model_1.default.create({
                        ingredient: ingredient._id,
                        quantity: lotData.quantity,
                        unit: ingredient.unit,
                        expiryDate: lotData.expiryDate,
                        purchaseDate: lotData.purchaseDate,
                        supplier: lotData.supplier,
                        cost: lotData.cost,
                        currentStock: lotData.currentStock,
                    });
                    console.log(`  ✅ Created lot: ${lot.lotId} - ${lotData.currentStock}${ingredient.unit} (expires ${lotData.expiryDate.toLocaleDateString()})`);
                }
            }
            console.log("\n✅ Seeding completed successfully!");
            console.log("\n📊 Summary:");
            console.log(`   - Ingredients: ${ingredients.length}`);
            const totalLots = yield ingredientLot_model_1.default.countDocuments({});
            console.log(`   - Lots: ${totalLots}`);
            const expiringSoon = yield ingredientLot_model_1.default.countDocuments({
                expiryDate: {
                    $gte: new Date(),
                    $lte: (0, date_fns_1.addDays)(new Date(), 7),
                },
                currentStock: { $gt: 0 },
            });
            console.log(`   - Expiring soon (≤7 days): ${expiringSoon}`);
            const expired = yield ingredientLot_model_1.default.countDocuments({
                expiryDate: { $lt: new Date() },
                currentStock: { $gt: 0 },
            });
            console.log(`   - Expired: ${expired}`);
            process.exit(0);
        }
        catch (error) {
            console.error("❌ Error seeding data:", error);
            process.exit(1);
        }
    });
}
seedIngredientsAndLots();
