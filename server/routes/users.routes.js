import express from "express"
import { auth, isAdmin } from "../middleware/auth.js"

import {
getAllUsers,
deleteUser,
toggleBlockUser,
getUserOrders
} from "../controllers/userController.js"

const router = express.Router()

// 🔥 ADMIN USERS
router.get("/users",auth,isAdmin,getAllUsers)

router.delete("/users/:id",auth,isAdmin,deleteUser)

router.put("/users/block/:id",auth,isAdmin,toggleBlockUser)

router.get("/users/orders/:id",auth,isAdmin,getUserOrders)

export default router