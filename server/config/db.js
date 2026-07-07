import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      "mongodb+srv://Aditya:Aditya12345@cluster0.xtlsnno.mongodb.net/ecomshop",
    );

    console.log(`MongoDB Connected sucessfully.....`);
  } catch (error) {
    console.error("Database connection failed ❌");
    console.error(error.message);
    process.exit(1);
  }
};

export default connectDB;
