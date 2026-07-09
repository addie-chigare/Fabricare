import mongoose from "mongoose";
import Cart from "./models/cart.model.js";
import { Product } from "./models/product.js";

const MONGO_URI = "mongodb+srv://Aditya:Aditya12345@cluster0.xtlsnno.mongodb.net/ecomshop";

const cleanOrphans = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    const cartItems = await Cart.find().populate("product");
    const orphans = cartItems.filter((item) => !item.product);
    
    if (orphans.length > 0) {
      const orphanIds = orphans.map((o) => o._id);
      const res = await Cart.deleteMany({ _id: { $in: orphanIds } });
      console.log(`Successfully deleted ${res.deletedCount} orphan cart items!`);
    } else {
      console.log("No orphan cart items found.");
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

cleanOrphans();
