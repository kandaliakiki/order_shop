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
const product_model_1 = __importDefault(require("../lib/models/product.model"));
const category_model_1 = __importDefault(require("../lib/models/category.model"));
const date_fns_1 = require("date-fns");
// Load environment variables
dotenv_1.default.config({ path: ".env.local" });
// Products data from VPS export
const productsData = [
    {
        _id: "66f28c62c2e4552cf2ae01f6",
        name: "Sweet Cake",
        price: 4,
        category: "66f24673eabc97cbe01f1828",
        imageUrl: "https://drive.google.com/uc?export=view&id=1cyJYWkOn01qpcsULOR6UpXrfqEJOKNAh",
        productId: "P-0002",
    },
    {
        _id: "6814ee99f2607e8207a56e46",
        name: "Cheesecake",
        price: 8,
        category: "66f24673eabc97cbe01f1828",
        imageUrl: "https://drive.google.com/uc?export=view&id=1Kz61X7GemgkQkT2tas-l0WNRIopGHK6c",
        productId: "P-0006",
    },
    {
        _id: "6815bb095c22177101d0b5a1",
        name: "Wheat Flour",
        price: 2,
        category: "68065d542ee547dc5f675965",
        imageUrl: "https://drive.google.com/uc?export=view&id=1aHWMjp1hcc9PuN8at-QDoR7V6YT9NzDw",
        productId: "P-0007",
        // This one will have no ingredients
    },
    {
        _id: "6815bbcd5c22177101d0b5d2",
        name: "Chiffon",
        price: 10,
        category: "66f24673eabc97cbe01f1828",
        imageUrl: "https://drive.google.com/uc?export=view&id=19l1gAgWccmIKRAyp7987kqlTjzW2XuSh",
        productId: "P-0008",
    },
    {
        _id: "681b1e67e7435e7133b6eaad",
        name: "White Bread",
        price: 4,
        category: "66f24658eabc97cbe01f181e",
        imageUrl: "https://drive.google.com/uc?export=view&id=1-ty4fcNw4oZaq3aksPS3V75EPwjJSaTt",
        productId: "P-0009",
    },
    {
        _id: "682d72d3435d008dd843d069",
        name: "Chocolate Chip Cookie",
        price: 3,
        category: "682d7228435d008dd843c934",
        imageUrl: "https://drive.google.com/uc?export=view&id=1FT4BgGlrVgshrON_iseEEq0uvs6xPBnl",
        productId: "P-0012",
    },
];
function seedDataVPS() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, mongoose_1.connectToDB)();
            console.log("✅ Connected to database\n");
            // Step 1: Seed Ingredients
            console.log("📦 Seeding ingredients...\n");
            const ingredientsData = [
                {
                    name: "Egg",
                    unit: "pcs",
                    currentStock: 15,
                    minimumStock: 10,
                    imageUrl: "",
                    defaultExpiryDays: 30,
                },
                {
                    name: "Flour",
                    unit: "kg",
                    currentStock: 41,
                    minimumStock: 20,
                    imageUrl: "",
                    defaultExpiryDays: 180,
                },
                {
                    name: "Cheese",
                    unit: "g",
                    currentStock: 280,
                    minimumStock: 100,
                    imageUrl: "",
                    defaultExpiryDays: 14,
                },
                {
                    name: "Sugar",
                    unit: "kg",
                    currentStock: 25,
                    minimumStock: 10,
                    imageUrl: "",
                    defaultExpiryDays: 365,
                },
                {
                    name: "Butter",
                    unit: "kg",
                    currentStock: 8,
                    minimumStock: 5,
                    imageUrl: "",
                    defaultExpiryDays: 14,
                },
                {
                    name: "Milk",
                    unit: "L",
                    currentStock: 12,
                    minimumStock: 5,
                    imageUrl: "",
                    defaultExpiryDays: 7,
                },
                {
                    name: "Vanilla Extract",
                    unit: "ml",
                    currentStock: 500,
                    minimumStock: 200,
                    imageUrl: "",
                    defaultExpiryDays: 365,
                },
                {
                    name: "Baking Powder",
                    unit: "g",
                    currentStock: 450,
                    minimumStock: 200,
                    imageUrl: "",
                    defaultExpiryDays: 180,
                },
                {
                    name: "Salt",
                    unit: "g",
                    currentStock: 1000,
                    minimumStock: 500,
                    imageUrl: "",
                    defaultExpiryDays: 365,
                },
                {
                    name: "Chocolate Chips",
                    unit: "g",
                    currentStock: 1200,
                    minimumStock: 500,
                    imageUrl: "",
                    defaultExpiryDays: 180,
                },
            ];
            const ingredients = [];
            for (const ingredientData of ingredientsData) {
                let ingredient = yield ingredient_model_1.default.findOne({ name: ingredientData.name });
                if (ingredient) {
                    ingredient.currentStock = ingredientData.currentStock;
                    ingredient.minimumStock = ingredientData.minimumStock;
                    ingredient.unit = ingredientData.unit;
                    ingredient.defaultExpiryDays = ingredientData.defaultExpiryDays;
                    ingredient.imageUrl = ingredientData.imageUrl || ingredient.imageUrl;
                    yield ingredient.save();
                    console.log(`📝 Updated ingredient: ${ingredient.name} (${ingredient.ingredientId})`);
                }
                else {
                    ingredient = yield ingredient_model_1.default.create(ingredientData);
                    console.log(`✅ Created ingredient: ${ingredient.name} (${ingredient.ingredientId})`);
                }
                ingredients.push(ingredient);
            }
            // Step 2: Seed Ingredient Lots
            console.log("\n📦 Seeding ingredient lots...\n");
            const lotsData = [
                {
                    ingredientName: "Egg",
                    lots: [
                        {
                            quantity: 10,
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 20),
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 10),
                            supplier: "Fresh Farm Supplies",
                            cost: 2.50,
                            currentStock: 10,
                        },
                        {
                            quantity: 5,
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 5),
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 25),
                            supplier: "Local Market",
                            cost: 1.25,
                            currentStock: 5,
                        },
                    ],
                },
                {
                    ingredientName: "Flour",
                    lots: [
                        {
                            quantity: 20,
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 150),
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 30),
                            supplier: "Bulk Wholesale",
                            cost: 15.00,
                            currentStock: 20,
                        },
                        {
                            quantity: 15,
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 120),
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 60),
                            supplier: "Bulk Wholesale",
                            cost: 11.25,
                            currentStock: 15,
                        },
                        {
                            quantity: 6,
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 90),
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 90),
                            supplier: "Local Market",
                            cost: 4.50,
                            currentStock: 6,
                        },
                    ],
                },
                {
                    ingredientName: "Cheese",
                    lots: [
                        {
                            quantity: 150,
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 8),
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 6),
                            supplier: "Dairy Delight",
                            cost: 4.50,
                            currentStock: 150,
                        },
                        {
                            quantity: 130,
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 12),
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 2),
                            supplier: "Dairy Delight",
                            cost: 3.90,
                            currentStock: 130,
                        },
                    ],
                },
                {
                    ingredientName: "Sugar",
                    lots: [
                        {
                            quantity: 15,
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 300),
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 60),
                            supplier: "Sweet Supplies Co",
                            cost: 12.00,
                            currentStock: 15,
                        },
                        {
                            quantity: 10,
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 365),
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 0),
                            supplier: "Sweet Supplies Co",
                            cost: 8.00,
                            currentStock: 10,
                        },
                    ],
                },
                {
                    ingredientName: "Butter",
                    lots: [
                        {
                            quantity: 5,
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 10),
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
                {
                    ingredientName: "Milk",
                    lots: [
                        {
                            quantity: 6,
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 3),
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 4),
                            supplier: "Fresh Dairy",
                            cost: 4.20,
                            currentStock: 6,
                        },
                        {
                            quantity: 6,
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 5),
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 2),
                            supplier: "Fresh Dairy",
                            cost: 4.20,
                            currentStock: 6,
                        },
                    ],
                },
                {
                    ingredientName: "Vanilla Extract",
                    lots: [
                        {
                            quantity: 300,
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 300),
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 60),
                            supplier: "Flavor World",
                            cost: 25.00,
                            currentStock: 300,
                        },
                        {
                            quantity: 200,
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 365),
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 0),
                            supplier: "Flavor World",
                            cost: 16.67,
                            currentStock: 200,
                        },
                    ],
                },
                {
                    ingredientName: "Baking Powder",
                    lots: [
                        {
                            quantity: 250,
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 150),
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 30),
                            supplier: "Baking Essentials",
                            cost: 3.50,
                            currentStock: 250,
                        },
                        {
                            quantity: 200,
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 180),
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 0),
                            supplier: "Baking Essentials",
                            cost: 2.80,
                            currentStock: 200,
                        },
                    ],
                },
                {
                    ingredientName: "Salt",
                    lots: [
                        {
                            quantity: 500,
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 365),
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 0),
                            supplier: "Basic Supplies",
                            cost: 1.50,
                            currentStock: 500,
                        },
                        {
                            quantity: 500,
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 365),
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 90),
                            supplier: "Basic Supplies",
                            cost: 1.50,
                            currentStock: 500,
                        },
                    ],
                },
                {
                    ingredientName: "Chocolate Chips",
                    lots: [
                        {
                            quantity: 700,
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 150),
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 30),
                            supplier: "Sweet Treats Co",
                            cost: 8.40,
                            currentStock: 700,
                        },
                        {
                            quantity: 500,
                            expiryDate: (0, date_fns_1.addDays)(new Date(), 180),
                            purchaseDate: (0, date_fns_1.subDays)(new Date(), 0),
                            supplier: "Sweet Treats Co",
                            cost: 6.00,
                            currentStock: 500,
                        },
                    ],
                },
            ];
            let totalLotsCreated = 0;
            for (const lotGroup of lotsData) {
                const ingredient = ingredients.find((ing) => ing.name === lotGroup.ingredientName);
                if (!ingredient) {
                    console.log(`⚠️  Ingredient not found: ${lotGroup.ingredientName}, skipping...`);
                    continue;
                }
                // Delete existing lots for this ingredient
                yield ingredientLot_model_1.default.deleteMany({ ingredient: ingredient._id });
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
                        expirySource: "user",
                    });
                    console.log(`  ✅ Created lot: ${lot.lotId} - ${lotData.currentStock}${ingredient.unit}`);
                    totalLotsCreated++;
                }
            }
            // Step 3: Sync ingredient stock totals
            console.log("\n📊 Syncing ingredient stock with lots...");
            for (const ingredient of ingredients) {
                const lots = yield ingredientLot_model_1.default.find({ ingredient: ingredient._id });
                const totalStock = lots.reduce((sum, lot) => sum + lot.currentStock, 0);
                ingredient.currentStock = totalStock;
                yield ingredient.save();
                console.log(`  ✅ ${ingredient.name}: ${totalStock} ${ingredient.unit} (from ${lots.length} lot(s))`);
            }
            // Step 4: Seed Products
            console.log("\n🍰 Seeding products...\n");
            const createdProducts = [];
            for (const productData of productsData) {
                // Find or create category
                let category = yield category_model_1.default.findById(productData.category);
                if (!category) {
                    // Create a default category if it doesn't exist
                    category = yield category_model_1.default.create({
                        name: "Uncategorized",
                        imageUrl: "",
                    });
                    console.log(`⚠️  Category ${productData.category} not found, created default category`);
                }
                // Check if product exists
                let product = yield product_model_1.default.findOne({ productId: productData.productId });
                if (product) {
                    // Update existing product
                    product.name = productData.name;
                    product.price = productData.price;
                    product.category = category._id;
                    product.imageUrl = productData.imageUrl;
                    yield product.save();
                    console.log(`📝 Updated product: ${product.name} (${product.productId})`);
                }
                else {
                    // Create new product
                    product = yield product_model_1.default.create({
                        name: productData.name,
                        price: productData.price,
                        category: category._id,
                        imageUrl: productData.imageUrl,
                        productId: productData.productId,
                        ingredients: [], // Will be populated below
                    });
                    console.log(`✅ Created product: ${product.name} (${product.productId})`);
                }
                createdProducts.push(product);
            }
            // Step 5: Assign ingredients to products (except Wheat Flour)
            console.log("\n🔗 Assigning ingredients to products...\n");
            // Helper function to find ingredient by name
            const findIngredient = (name) => {
                return ingredients.find((ing) => ing.name.toLowerCase() === name.toLowerCase());
            };
            // Product recipes
            const productRecipes = {
                "Sweet Cake": [
                    { ingredientName: "Flour", quantity: 0.5 },
                    { ingredientName: "Sugar", quantity: 0.3 },
                    { ingredientName: "Egg", quantity: 2 },
                    { ingredientName: "Butter", quantity: 0.2 },
                    { ingredientName: "Milk", quantity: 0.2 },
                    { ingredientName: "Vanilla Extract", quantity: 5 },
                    { ingredientName: "Baking Powder", quantity: 10 },
                ],
                "Cheesecake": [
                    { ingredientName: "Cheese", quantity: 200 },
                    { ingredientName: "Sugar", quantity: 0.2 },
                    { ingredientName: "Egg", quantity: 3 },
                    { ingredientName: "Butter", quantity: 0.1 },
                    { ingredientName: "Vanilla Extract", quantity: 5 },
                ],
                "Chiffon": [
                    { ingredientName: "Flour", quantity: 0.3 },
                    { ingredientName: "Sugar", quantity: 0.4 },
                    { ingredientName: "Egg", quantity: 4 },
                    { ingredientName: "Milk", quantity: 0.15 },
                    { ingredientName: "Vanilla Extract", quantity: 3 },
                    { ingredientName: "Baking Powder", quantity: 8 },
                ],
                "White Bread": [
                    { ingredientName: "Flour", quantity: 0.5 },
                    { ingredientName: "Salt", quantity: 5 },
                    { ingredientName: "Milk", quantity: 0.3 },
                    { ingredientName: "Butter", quantity: 0.05 },
                ],
                "Chocolate Chip Cookie": [
                    { ingredientName: "Flour", quantity: 0.2 },
                    { ingredientName: "Sugar", quantity: 0.15 },
                    { ingredientName: "Butter", quantity: 0.1 },
                    { ingredientName: "Egg", quantity: 1 },
                    { ingredientName: "Chocolate Chips", quantity: 50 },
                    { ingredientName: "Vanilla Extract", quantity: 2 },
                    { ingredientName: "Baking Powder", quantity: 3 },
                ],
                // Wheat Flour - no ingredients (intentionally left empty)
            };
            for (const product of createdProducts) {
                if (product.name === "Wheat Flour") {
                    console.log(`⏭️  Skipping ingredients for ${product.name} (intentionally left empty)`);
                    continue;
                }
                const recipe = productRecipes[product.name];
                if (!recipe) {
                    console.log(`⚠️  No recipe found for ${product.name}`);
                    continue;
                }
                const productIngredients = [];
                for (const recipeItem of recipe) {
                    const ingredient = findIngredient(recipeItem.ingredientName);
                    if (!ingredient) {
                        console.log(`⚠️  Ingredient ${recipeItem.ingredientName} not found for ${product.name}`);
                        continue;
                    }
                    productIngredients.push({
                        ingredient: ingredient._id,
                        quantity: recipeItem.quantity,
                        unit: ingredient.unit,
                    });
                }
                product.ingredients = productIngredients;
                yield product.save();
                console.log(`✅ Assigned ${productIngredients.length} ingredients to ${product.name}`);
            }
            console.log("\n✅ VPS data seeding completed successfully!");
            console.log("\n📊 Summary:");
            console.log(`   - Ingredients: ${ingredients.length}`);
            console.log(`   - Ingredient lots: ${totalLotsCreated}`);
            console.log(`   - Products: ${createdProducts.length}`);
            const productsWithIngredients = createdProducts.filter(p => p.ingredients && p.ingredients.length > 0).length;
            const productsWithoutIngredients = createdProducts.length - productsWithIngredients;
            console.log(`   - Products with ingredients: ${productsWithIngredients}`);
            console.log(`   - Products without ingredients: ${productsWithoutIngredients}`);
            process.exit(0);
        }
        catch (error) {
            console.error("❌ Error seeding VPS data:", error);
            process.exit(1);
        }
    });
}
seedDataVPS();
