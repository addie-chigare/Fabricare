import mongoose from "mongoose";
import Cart from "./models/cart.model.js";
import { Product } from "./models/product.js";

const MONGO_URI = "mongodb+srv://Aditya:Aditya12345@cluster0.xtlsnno.mongodb.net/ecomshop";

const checkCart = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    const cartItems = await Cart.find().populate("product");
    console.log(`Found ${cartItems.length} total cart items.`);
    
    for (const item of cartItems) {
      if (!item.product) {
        console.log(`⚠️ Orphan Cart Item Found: ID ${item._id}, User ${item.user}, Product Reference: ${item.product}`);
      } else {
        console.log(`✅ Valid Cart Item: ID ${item._id}, Product: ${item.product.name}`);
      }
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkCart();
