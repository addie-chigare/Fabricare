import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import orderRoutes from "./routes/order.routes.js"
import { startOrderScheduler } from "./utils/orderScheduler.js";

import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import usersRoutes from "./routes/users.routes.js";
import addressRoutes from "./routes/addressRoutes.js";
import bannerRoutes from "./routes/banner.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import laundryRoutes from "./routes/laundry.routes.js";
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

connectDB();
startOrderScheduler();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders",orderRoutes)
app.use("/api/v1/admin", usersRoutes);
app.use("/api/v1/address", addressRoutes);
app.use("/api/v1/banners", bannerRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/settings", settingsRoutes);
app.use("/api/v1", laundryRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use((req, res) => {
  res.status(404).json({ message: "Route Not Found" });
});

app.use((err, req, res, next) => {
  res.status(500).json({
    message: err.message || "Internal Server Error",
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});