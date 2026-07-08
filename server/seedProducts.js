import mongoose from "mongoose";
import { Product } from "./models/product.js";
import { Category } from "./models/category.js";
import { User } from "./models/user.js";

const MONGO_URI = "mongodb+srv://Aditya:Aditya12345@cluster0.xtlsnno.mongodb.net/ecomshop";

const seedProducts = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for product seeding...");

    // 1. Find or create a user for createdBy field
    let user = await User.findOne({ role: "admin" });
    if (!user) {
      user = await User.findOne({});
    }
    if (!user) {
      console.log("No user found in database. Please run migrations or register a user first.");
      process.exit(1);
    }
    console.log(`Using user ID: ${user._id} (${user.email}) for createdBy`);

    // 2. Ensure dynamic categories like Women's Wear exist
    const womenCategories = [
      { name: "Dresses", type: "women", slug: "women-dresses" },
      { name: "Tops & Shirts", type: "women", slug: "women-tops" },
      { name: "Sarees & Ethnic", type: "women", slug: "women-sarees" }
    ];

    for (const cat of womenCategories) {
      const exists = await Category.findOne({ slug: cat.slug });
      if (!exists) {
        await Category.create(cat);
        console.log(`Created dynamic category: ${cat.name} (${cat.type})`);
      }
    }

    // 3. Clear old products
    await Product.deleteMany({});
    console.log("Cleared old products.");

    // 4. Products Array to Seed
    const productsToSeed = [
      // === MEN'S SHIRTS ===
      {
        name: "Classic Oxford Cotton Shirt",
        description: "Tailored fit Classic Oxford Shirt crafted from 100% long-staple organic cotton. Features a clean button-down collar, structured cuffs, and a chest pocket.",
        price: 1899,
        category: "men-shirts",
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1621072156002-e2fcc104e761?w=500&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=500&auto=format&fit=crop&q=80"
        ],
        stock: 35,
        brand: "Fabricare Premium",
        discount: 15,
        material: "100% Organic Oxford Cotton",
        colors: ["Pure White", "Sky Blue", "Charcoal Gray"],
        sizes: ["S", "M", "L", "XL"],
        isFeatured: true,
        createdBy: user._id
      },
      {
        name: "Linen Lightweight Summer Shirt",
        description: "Stay cool and sharp with this breathable summer linen shirt. Naturally textured slub-weave linen blend with a relaxed open collar style.",
        price: 2199,
        category: "men-shirts",
        image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=500&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=500&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=80"
        ],
        stock: 20,
        brand: "Fabricare Breeze",
        discount: 10,
        material: "70% Linen, 30% Fine Cotton",
        colors: ["Olive Green", "Beige Sand", "Soft Lavender"],
        sizes: ["M", "L", "XL"],
        isFeatured: false,
        createdBy: user._id
      },

      // === MEN'S T-SHIRTS ===
      {
        name: "Minimalist Crewneck Tee",
        description: "Heavyweight 240 GSM organic cotton t-shirt with a structured crewneck band. Durable, pre-shrunk, and extremely soft for daily loungewear.",
        price: 899,
        category: "men-t-shirts",
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&auto=format&fit=crop&q=80"
        ],
        stock: 50,
        brand: "Fabricare Essentials",
        discount: 20,
        material: "100% Pima Cotton (240 GSM)",
        colors: ["Charcoal Gray", "Jet Black", "Navy Blue"],
        sizes: ["S", "M", "L", "XL", "XXL"],
        isFeatured: true,
        createdBy: user._id
      },

      // === MEN'S JEANS ===
      {
        name: "Vintage Slim Fit Selvedge Denim",
        description: "Slim-tapered indigo jeans crafted from Japanese selvedge denim. Raw structured fabric that breaks in beautifully over time with custom wear lines.",
        price: 3499,
        category: "men-jeans",
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&auto=format&fit=crop&q=80"
        ],
        stock: 25,
        brand: "Fabricare Denim Lab",
        discount: 10,
        material: "12oz Selvedge Denim (99% Cotton, 1% Spandex)",
        colors: ["Raw Indigo Blue", "Vintage Stone Wash"],
        sizes: ["30", "32", "34", "36"],
        isFeatured: true,
        createdBy: user._id
      },

      // === KIDS' T-SHIRTS ===
      {
        name: "Playful Dino Print Tee",
        description: "Cute dinosaur graphic printed on soft hypoallergenic organic cotton. Tagless neck design and flatlock stitching to protect delicate baby skin.",
        price: 599,
        category: "kids-t-shirts",
        image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=500&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=500&auto=format&fit=crop&q=80"
        ],
        stock: 40,
        brand: "Fabricare Kids",
        discount: 30,
        material: "100% Combed Organic Cotton",
        colors: ["Lemon Yellow", "Mint Green"],
        sizes: ["2-3 Y", "4-5 Y", "6-7 Y"],
        isFeatured: true,
        createdBy: user._id
      },

      // === KIDS' DRESSES ===
      {
        name: "Floral Summer Cotton Dress",
        description: "Breathable and airy tiered summer dress with a delicate hand-drawn floral print. Features adjustable tie straps and a flared gather hem.",
        price: 1299,
        category: "kids-dresses",
        image: "https://images.unsplash.com/photo-1622290319146-7b63df48a635?w=500&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1622290319146-7b63df48a635?w=500&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=500&auto=format&fit=crop&q=80"
        ],
        stock: 15,
        brand: "Fabricare Kids Elite",
        discount: 25,
        material: "Fine Voile Cotton Lining",
        colors: ["Blush Pink", "Lavender Violet"],
        sizes: ["3-4 Y", "5-6 Y", "7-8 Y"],
        isFeatured: true,
        createdBy: user._id
      },

      // === WOMEN'S DRESSES ===
      {
        name: "Luxe Midi A-Line Dress",
        description: "Elegant midi dress featuring a tailored waist, structured puff sleeves, and a flattering A-line wrap skirt. Perfect for weekend brunches or dinner dates.",
        price: 2899,
        category: "women-dresses",
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&auto=format&fit=crop&q=80"
        ],
        stock: 18,
        brand: "Fabricare Femme",
        discount: 20,
        material: "Modal Silk Blend",
        colors: ["Emerald Green", "Royal Crimson Red", "Classic Black"],
        sizes: ["XS", "S", "M", "L", "XL"],
        isFeatured: true,
        createdBy: user._id
      },

      // === WOMEN'S TOPS ===
      {
        name: "Elegant Satin Ruffled Blouse",
        description: "Luxurious satin blouse featuring delicate ruffled detailing along the open neck collar and balloon sleeves. Offers a subtle drape and high-gloss premium sheen.",
        price: 1499,
        category: "women-tops",
        image: "https://images.unsplash.com/photo-1548624149-f7b2e88a03b0?w=500&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1548624149-f7b2e88a03b0?w=500&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&auto=format&fit=crop&q=80"
        ],
        stock: 30,
        brand: "Fabricare Femme",
        discount: 10,
        material: "Premium Charmeuse Satin",
        colors: ["Champagne Gold", "Pearl Ivory White"],
        sizes: ["S", "M", "L"],
        isFeatured: false,
        createdBy: user._id
      }
    ];

    await Product.insertMany(productsToSeed);
    console.log("Successfully seeded bulk products for Men, Kids, and Women's Wear collections!");
    process.exit(0);
  } catch (err) {
    console.error("Product seeding failed:", err);
    process.exit(1);
  }
};

seedProducts();
