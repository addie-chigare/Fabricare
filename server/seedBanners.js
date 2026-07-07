import mongoose from "mongoose";
import { Banner } from "./models/banner.js";
import { User } from "./models/user.js";

const MONGO_URI = "mongodb+srv://Aditya:Aditya12345@cluster0.xtlsnno.mongodb.net/ecomshop";

const seedBanners = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // Find an admin user to assign as creator
    let admin = await User.findOne({ role: "admin" });
    if (!admin) {
      admin = await User.findOne();
    }
    
    if (!admin) {
      console.log("No users found. Please register a user first before running this seed script.");
      process.exit(1);
    }

    // Clear existing banners
    await Banner.deleteMany({});
    console.log("Cleared old banners.");

    const sampleBanners = [
      {
        title: "Premium Fabricare Outfits",
        subtitle: "Experience premium comfort and styling. Up to 30% OFF.",
        imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        link: "/products",
        isActive: true,
        createdBy: admin._id
      },
      {
        title: "Men's Streetwear Collection",
        subtitle: "Shop the latest trends in jackets, denim, and premium activewear.",
        imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        link: "/products",
        isActive: true,
        createdBy: admin._id
      },
      {
        title: "Eco-Friendly Dry Cleaning",
        subtitle: "Professional laundry services starting at just ₹49/kg. Delivery in 24h.",
        imageUrl: "https://images.unsplash.com/photo-1545173168-9f1947eebd01?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        link: "/#laundry-section",
        isActive: true,
        createdBy: admin._id
      }
    ];

    await Banner.insertMany(sampleBanners);
    console.log("Successfully seeded 3 dynamic banners!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seedBanners();
