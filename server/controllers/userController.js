import { User } from "../models/user.js"
import Order from "../models/order.model.js"

// 🔹 Get all users
export const getAllUsers = async(req,res)=>{
try{

const users = await User
.find({ role: { $ne: "admin" } })
.select("-password")

res.json(users)

}catch(error){
res.status(500).json({message:error.message})
}
}

// 🔹 Delete user
export const deleteUser = async(req,res)=>{
try{

await User.findByIdAndDelete(req.params.id)

res.json({
message:"User deleted"
})

}catch(error){
res.status(500).json({message:error.message})
}
}

// 🔹 Block / Unblock user
export const toggleBlockUser = async(req,res)=>{
try{

const user = await User.findById(req.params.id)

if(!user){
return res.status(404).json({
message:"User not found"
})
}

user.isBlocked = !user.isBlocked

await user.save()

res.json({
message:user.isBlocked
?"User blocked"
:"User unblocked",
user
})

}catch(error){
res.status(500).json({message:error.message})
}
}

// 🔹 Get user orders
export const getUserOrders = async(req,res)=>{
try{

const orders = await Order
.find({user:req.params.id})
.populate("user", "username email")
.populate("items.product","name price")

res.json(orders)

}catch(error){
res.status(500).json({message:error.message})
}
}