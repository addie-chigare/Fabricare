import mongoose from "mongoose";
import { User } from "./models/user.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Aditya:Aditya12345@cluster0.xtlsnno.mongodb.net/ecomshop";

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for admin seeding...");

    const email = "admin@fabricare.com";
    const password = "adminpassword";
    const username = "admin";
    const name = "System Administrator";

    // Check if a user with username "admin" already exists (but with a different email)
    const existingByUsername = await User.findOne({ username });
    if (existingByUsername && existingByUsername.email !== email) {
      console.log(`User with username '${username}' already exists with email: ${existingByUsername.email}. Deleting it to avoid conflicts.`);
      await User.deleteOne({ _id: existingByUsername._id });
    }

    // Check if a user with email "admin@fabricare.com" already exists
    const existingByEmail = await User.findOne({ email });
    if (existingByEmail) {
      console.log(`User with email '${email}' exists. Updating credentials.`);
      const hashedPassword = await bcrypt.hash(password, 10);
      existingByEmail.username = username;
      existingByEmail.password = hashedPassword;
      existingByEmail.role = "admin";
      existingByEmail.isBlocked = false;
      await existingByEmail.save();
      console.log(`Admin user updated successfully.`);
    } else {
      console.log(`Creating new admin user.`);
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({
        name,
        email,
        username,
        password: hashedPassword,
        role: "admin",
        isBlocked: false,
      });
      console.log(`Admin user created successfully.`);
    }

    process.exit(0);
  } catch (err) {
    console.error("Seeding admin error:", err);
    process.exit(1);
  }
};

seedAdmin();
