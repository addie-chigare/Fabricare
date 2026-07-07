import express from "express";
import { login, register, forgotPassword, resetPassword, verifyRegistration, updateProfile, changePassword, toggleWishlist, getWishlistProducts } from "../controllers/user.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// 🔓 Public Routes
router.post("/register", register);
router.post("/verify-registration", verifyRegistration);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// 🔐 Protected Routes
router.get("/me", auth, (req, res) => {
  res.status(200).json({
    user: req.user,
  });
});
router.put("/profile", auth, updateProfile);
router.put("/change-password", auth, changePassword);
router.post("/wishlist/toggle", auth, toggleWishlist);
router.get("/wishlist", auth, getWishlistProducts);

export default router;