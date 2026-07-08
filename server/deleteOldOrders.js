import mongoose from "mongoose";
import Order from "./models/order.model.js";

const MONGO_URI = "mongodb+srv://Aditya:Aditya12345@cluster0.xtlsnno.mongodb.net/ecomshop";

const deleteOldOrders = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for cleaning old orders...");

    const res = await Order.deleteMany({});
    console.log(`Successfully deleted ${res.deletedCount} old orders from the database!`);
    process.exit(0);
  } catch (err) {
    console.error("Cleanup error:", err);
    process.exit(1);
  }
};

deleteOldOrders();
