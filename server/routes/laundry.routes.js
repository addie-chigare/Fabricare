import express from "express";
import { auth, isAdmin } from "../middleware/auth.js";
import {
  getServices,
  getPricing,
  bookPickup,
  getOrders,
  getOrderById,
  getSupport,
  getAllOrders,
  updateOrderStatus,
  updatePricing,
  getStats
} from "../controllers/laundry.controller.js";

const router = express.Router();

// Public / Customer Routes
router.get("/laundry/services", getServices);
router.get("/laundry/pricing", getPricing);
router.get("/laundry/support", getSupport);

// Protected Customer Routes
router.post("/laundry/orders", auth, bookPickup);
router.get("/laundry/orders", auth, getOrders);
router.get("/laundry/orders/:id", auth, getOrderById);

// Admin Routes (Protected and Admin Only)
router.get("/admin/laundry/orders", auth, isAdmin, getAllOrders);
router.put("/admin/laundry/orders/:id/status", auth, isAdmin, updateOrderStatus);
router.put("/admin/laundry/pricing", auth, isAdmin, updatePricing);
router.get("/admin/laundry/stats", auth, isAdmin, getStats);

export default router;
