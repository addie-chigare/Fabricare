import express from "express";
import { auth, isAdmin } from "../middleware/auth.js";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.js";

const router = express.Router();

// Public routes
router.get("/", getCategories);

// Admin routes
router.post("/admin/create", auth, isAdmin, createCategory);
router.put("/admin/update/:id", auth, isAdmin, updateCategory);
router.delete("/admin/delete/:id", auth, isAdmin, deleteCategory);

export default router;
