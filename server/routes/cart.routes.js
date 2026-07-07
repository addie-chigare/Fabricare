import express from "express";
import { auth } from "../middleware/auth.js";

import {
 addToCart,
 getUserCart,
 updateCart,
 removeCartItem
} from "../controllers/cartController.js";

const router = express.Router();

router.post("/add", auth, addToCart);

router.get("/", auth, getUserCart);

router.put("/:id", auth, updateCart);

router.delete("/:id", auth, removeCartItem);

export default router;