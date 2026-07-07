
import express from "express";
import upload from "../middleware/upload.js";
import { auth, isAdmin } from "../middleware/auth.js";

import {
  createProduct,
  getAllProducts,
  getAllPublicProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  addProductReview,
  deleteProductReview
} from "../controllers/product.js";

const router = express.Router();

// 🔍 Search products
router.get("/search", searchProducts);

// Public products
router.get("/public", getAllPublicProducts);

// Admin - all products
router.get("/all", auth, isAdmin, getAllProducts);

// Single product
router.get("/:id", getSingleProduct);

// Create product
router.post(
  "/create",
  auth,
  isAdmin,
  upload.single("image"),
  createProduct
);

// Update product
router.put(
  "/update/:id",
  auth,
  isAdmin,
  upload.single("image"),
  updateProduct
);

// Delete product
router.delete(
  "/delete/:id",
  auth,
  isAdmin,
  deleteProduct
);

// Customer Reviews
router.post(
  "/:id/review",
  auth,
  addProductReview
);

router.delete(
  "/:id/review/:reviewId",
  auth,
  isAdmin,
  deleteProductReview
);

export default router;