import express from "express"
import { auth } from "../middleware/auth.js"
import {
  addAddress,
  getMyAddresses,
  deleteAddress,
  setDefaultAddress
} from "../controllers/addressController.js"

const router = express.Router()

router.post("/add", auth, addAddress)
router.get("/my", auth, getMyAddresses)
router.delete("/delete/:id", auth, deleteAddress)
router.put("/default/:id", auth, setDefaultAddress)

export default router