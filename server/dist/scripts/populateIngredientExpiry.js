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
// Load environment variables
dotenv_1.default.config({ path: ".env.local" });
function populateIngredientExpiry() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, mongoose_1.connectToDB)();
            console.log("✅ Connected to database");
            // Ingredient expiry mapping based on typical shelf life
            // Leaving Butter as "Not set" for testing purposes
            const ingredientExpiryMap = {
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
                const ingredient = yield ingredient_model_1.default.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
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
                yield ingredient.save();
                console.log(`✅ Updated "${name}": ${expiryDays} days`);
                updatedCount++;
            }
            console.log("\n📊 Summary:");
            console.log(`✅ Updated: ${updatedCount} ingredients`);
            console.log(`⏭️  Skipped: ${skippedCount} ingredients`);
            console.log("\n✨ Done!");
            process.exit(0);
        }
        catch (error) {
            console.error("❌ Error populating ingredient expiry:", error);
            process.exit(1);
        }
    });
}
populateIngredientExpiry();
