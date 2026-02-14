/**
 * Reset product data only: categories + products (Atas Artisan Bakery menu, IDR).
 * For WhatsApp ordering and order management. Does not touch ingredients, lots, stock, orders, or other data.
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectToDB } from "../lib/mongoose";
import Category from "../lib/models/category.model";
import Product from "../lib/models/product.model";

dotenv.config({ path: ".env.local" });

const CATEGORY_DEFAULT_IMAGE = "/assets/bakeries.svg";

const categoriesData: { name: string; imageUrl: string }[] = [
  { name: "Sourdough Breads", imageUrl: CATEGORY_DEFAULT_IMAGE },
  { name: "Viennoiseries", imageUrl: CATEGORY_DEFAULT_IMAGE },
  { name: "Breads & Buns", imageUrl: CATEGORY_DEFAULT_IMAGE },
  { name: "Buns", imageUrl: CATEGORY_DEFAULT_IMAGE },
  { name: "Cheesecakes", imageUrl: CATEGORY_DEFAULT_IMAGE },
  { name: "Cakes", imageUrl: CATEGORY_DEFAULT_IMAGE },
  { name: "Brownies", imageUrl: CATEGORY_DEFAULT_IMAGE },
];

const productsData: { name: string; price: number; categoryName: string }[] = [
  { name: "Classic Sourdough", price: 21000, categoryName: "Sourdough Breads" },
  { name: "Rye Sourdough", price: 25000, categoryName: "Sourdough Breads" },
  { name: "Multigrain Sourdough", price: 25000, categoryName: "Sourdough Breads" },
  { name: "Wholewheat Sourdough", price: 23000, categoryName: "Sourdough Breads" },
  { name: "Wholewheat Seeds Sourdough", price: 24000, categoryName: "Sourdough Breads" },
  { name: "Pumpkin Sourdough", price: 25000, categoryName: "Sourdough Breads" },
  { name: "Butter Sourdough", price: 25000, categoryName: "Sourdough Breads" },
  { name: "Coffee & Chocolate Sourdough", price: 25000, categoryName: "Sourdough Breads" },
  { name: "Mix Berry Sourdough", price: 25000, categoryName: "Sourdough Breads" },
  { name: "Butter Croissant", price: 10000, categoryName: "Viennoiseries" },
  { name: "Pain au Chocolate", price: 9000, categoryName: "Viennoiseries" },
  { name: "Almond Croissant", price: 12000, categoryName: "Viennoiseries" },
  { name: "Salted Caramel Croissant", price: 20000, categoryName: "Viennoiseries" },
  { name: "Chocolate Croissant", price: 20000, categoryName: "Viennoiseries" },
  { name: "Nutella Croissant", price: 20000, categoryName: "Viennoiseries" },
  { name: "Lemon Croissant", price: 20000, categoryName: "Viennoiseries" },
  { name: "Raspberry Croissant", price: 20000, categoryName: "Viennoiseries" },
  { name: "Pain aux Raisin", price: 8000, categoryName: "Viennoiseries" },
  { name: "Cinnamon Roll", price: 10000, categoryName: "Viennoiseries" },
  { name: "White Toast", price: 50000, categoryName: "Breads & Buns" },
  { name: "White Toast Multigrain", price: 33000, categoryName: "Breads & Buns" },
  { name: "Brown Toast", price: 45000, categoryName: "Breads & Buns" },
  { name: "Brioche Toast", price: 70000, categoryName: "Breads & Buns" },
  { name: "Brioche Sliders", price: 50000, categoryName: "Breads & Buns" },
  { name: "Croissant Loaf", price: 40000, categoryName: "Breads & Buns" },
  { name: "Focaccia", price: 35000, categoryName: "Breads & Buns" },
  { name: "Sourdough Baguette", price: 6000, categoryName: "Breads & Buns" },
  { name: "Wholewheat Baguette", price: 7000, categoryName: "Breads & Buns" },
  { name: "Ciabatta Sourdough", price: 7000, categoryName: "Breads & Buns" },
  { name: "Pita Bread", price: 5000, categoryName: "Breads & Buns" },
  { name: "Brioche Bun", price: 6000, categoryName: "Buns" },
  { name: "Potato Bun", price: 5000, categoryName: "Buns" },
  { name: "Vegan Bun", price: 5000, categoryName: "Buns" },
  { name: "Seed Bagel", price: 5000, categoryName: "Buns" },
  { name: "Milk Bun", price: 4000, categoryName: "Buns" },
  { name: "Sourdough Bun", price: 4000, categoryName: "Buns" },
  { name: "Milk Hot Dog Bun", price: 5000, categoryName: "Buns" },
  { name: "English Muffin", price: 3000, categoryName: "Buns" },
  { name: "Sesame Milk Bun", price: 4000, categoryName: "Buns" },
  { name: "Pretzel Bun", price: 5000, categoryName: "Buns" },
  { name: "Bagel", price: 5000, categoryName: "Buns" },
  { name: "Basque Cheesecake", price: 260000, categoryName: "Cheesecakes" },
  { name: "Basque Cheesecake Mix Berry", price: 280000, categoryName: "Cheesecakes" },
  { name: "Classic Newyork Cheesecake", price: 200000, categoryName: "Cheesecakes" },
  { name: "Salted Caramel Newyork Cheesecake", price: 240000, categoryName: "Cheesecakes" },
  { name: "Chocolate Newyork Cheesecake", price: 240000, categoryName: "Cheesecakes" },
  { name: "Nutella Newyork Cheesecake", price: 240000, categoryName: "Cheesecakes" },
  { name: "Oreo Newyork Cheesecake", price: 240000, categoryName: "Cheesecakes" },
  { name: "Strawberry Newyork Cheesecake", price: 240000, categoryName: "Cheesecakes" },
  { name: "Mango Passion Newyork Cheesecake", price: 240000, categoryName: "Cheesecakes" },
  { name: "Mix Berry Newyork Cheesecake", price: 240000, categoryName: "Cheesecakes" },
  { name: "Raspberry Newyork Cheesecake", price: 240000, categoryName: "Cheesecakes" },
  { name: "Lemon Newyork Cheesecake", price: 240000, categoryName: "Cheesecakes" },
  { name: "Banana Cake", price: 50000, categoryName: "Cakes" },
  { name: "Carrot Cake", price: 60000, categoryName: "Cakes" },
  { name: "Chocolate Cake", price: 70000, categoryName: "Cakes" },
  { name: "Mix Berry Cake", price: 60000, categoryName: "Cakes" },
  { name: "Lemon Cake", price: 60000, categoryName: "Cakes" },
  { name: "Classic Brownie", price: 150000, categoryName: "Brownies" },
  { name: "Salted Caramel Brownie", price: 170000, categoryName: "Brownies" },
];

async function resetData() {
  try {
    await connectToDB();
    console.log("✅ Connected to database\n");

    console.log("🗑️  Resetting product data (categories + products)...\n");

    const productResult = await Product.deleteMany({});
    console.log(`  ✅ Deleted ${productResult.deletedCount} products`);

    const categoryResult = await Category.deleteMany({});
    console.log(`  ✅ Deleted ${categoryResult.deletedCount} categories`);

    console.log("\n📦 Seeding categories and products (Atas Artisan Bakery, IDR)...\n");
    const categoryIds = new Map<string, mongoose.Types.ObjectId>();
    for (const cat of categoriesData) {
      const created = await Category.create({
        name: cat.name,
        imageUrl: cat.imageUrl || CATEGORY_DEFAULT_IMAGE,
      });
      categoryIds.set(cat.name, created._id as mongoose.Types.ObjectId);
      console.log(`  ✅ Category: ${cat.name}`);
    }
    let productsCreated = 0;
    for (const p of productsData) {
      const categoryId = categoryIds.get(p.categoryName);
      if (!categoryId) {
        console.warn(`  ⚠️  Category not found: ${p.categoryName}, skip ${p.name}`);
        continue;
      }
      await Product.create({
        name: p.name,
        price: p.price,
        category: categoryId,
        ingredients: [],
      });
      productsCreated++;
    }
    console.log(`  ✅ Created ${productsCreated} products`);

    console.log("\n✅ Product data reset complete.");
    console.log(`   Categories: ${categoriesData.length}`);
    console.log(`   Products: ${productsCreated} (Atas Artisan Bakery menu, IDR)\n`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error resetting data:", error);
    process.exit(1);
  }
}

resetData();
