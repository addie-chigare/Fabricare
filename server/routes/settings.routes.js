import express from "express";
import { auth, isAdmin } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import { getSettings, updateSettings } from "../controllers/settings.js";

const router = express.Router();

router.get("/", getSettings);
router.put("/admin/update", auth, isAdmin, upload.single("logo"), updateSettings);

export default router;
