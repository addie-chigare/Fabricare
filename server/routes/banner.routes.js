import express from "express";
import upload from "../middleware/upload.js";
import { auth, isAdmin } from "../middleware/auth.js";
import { createBanner, getActiveBanners, deleteBanner } from "../controllers/banner.js";

const router = express.Router();

// 🔓 Public Route
router.get("/public", getActiveBanners);

// 🔐 Admin Routes
router.post("/create", auth, isAdmin, upload.single("image"), createBanner);
router.delete("/delete/:id", auth, isAdmin, deleteBanner);

export default router;
