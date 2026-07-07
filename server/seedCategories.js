import mongoose from "mongoose";
import { Category } from "./models/category.js";

const MONGO_URI = "mongodb+srv://Aditya:Aditya12345@cluster0.xtlsnno.mongodb.net/ecomshop";

const seedCategories = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for category seeding...");

    // Clear existing categories
    await Category.deleteMany({});
    console.log("Cleared old categories.");

    const categories = [
      // Men's categories
      { name: "Shirts", type: "men", slug: "men-shirts" },
      { name: "T-Shirts", type: "men", slug: "men-t-shirts" },
      { name: "Jeans", type: "men", slug: "men-jeans" },
      { name: "Trousers", type: "men", slug: "men-trousers" },
      { name: "Jackets", type: "men", slug: "men-jackets" },
      { name: "Hoodies", type: "men", slug: "men-hoodies" },
      { name: "Shorts", type: "men", slug: "men-shorts" },
      { name: "Ethnic Wear", type: "men", slug: "men-ethnic-wear" },
      { name: "Footwear", type: "men", slug: "men-footwear" },
      { name: "Accessories", type: "men", slug: "men-accessories" },

      // Kids' categories
      { name: "Shirts", type: "kids", slug: "kids-shirts" },
      { name: "T-Shirts", type: "kids", slug: "kids-t-shirts" },
      { name: "Jeans", type: "kids", slug: "kids-jeans" },
      { name: "Shorts", type: "kids", slug: "kids-shorts" },
      { name: "Dresses", type: "kids", slug: "kids-dresses" },
      { name: "School Wear", type: "kids", slug: "kids-school-wear" },
      { name: "Jackets", type: "kids", slug: "kids-jackets" },
      { name: "Night Wear", type: "kids", slug: "kids-night-wear" },
      { name: "Footwear", type: "kids", slug: "kids-footwear" },
      { name: "Accessories", type: "kids", slug: "kids-accessories" },
    ];

    await Category.insertMany(categories);
    console.log("Successfully seeded categories!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seedCategories();
