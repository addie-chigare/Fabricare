import jwt from "jsonwebtoken";
import { User } from "../models/user.js";

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1️⃣ Header check
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    // 2️⃣ Proper Bearer format check
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admin only.",
    });
  }
  next();
};
