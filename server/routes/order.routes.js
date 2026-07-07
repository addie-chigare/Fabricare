import express from "express";
import { auth, isAdmin } from "../middleware/auth.js";

import {
  placeOrder,
  getMyOrders,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
  getMonthlyRevenue,
  getPendingOrders,
  getTopProducts
} from "../controllers/orderController.js";

const router = express.Router();

// 🔹 USER
router.post("/place", auth, placeOrder);

router.get("/my", auth, getMyOrders);

router.put("/cancel/:id", auth, cancelOrder);


// 🔹 ADMIN ORDERS
router.get("/admin", auth, isAdmin, getAllOrders);

router.put("/admin/status/:id", auth, isAdmin, updateOrderStatus);


// 🔹 DASHBOARD
router.get("/dashboard/stats", auth, isAdmin, getDashboardStats);

router.get("/dashboard/revenue", auth, isAdmin, getMonthlyRevenue);

router.get("/dashboard/pending", auth, isAdmin, getPendingOrders);

router.get("/dashboard/top-products", auth, isAdmin, getTopProducts);


export default router;