import Address from "../models/Address.js"

export const addAddress = async(req,res)=>{

try{

const {fullName,phone,addressLine,city,state,pincode,isDefault} = req.body

if (!fullName || !phone || !addressLine || !city || !state || !pincode) {
  return res.status(400).json({ message: "Please fill all fields" });
}

const nameRegex = /^[a-zA-Z\s]{2,50}$/;
if (!nameRegex.test(fullName)) {
  return res.status(400).json({ message: "Full Name must contain only letters and spaces, between 2 and 50 characters." });
}

const phoneRegex = /^\d{10,15}$/;
if (!phoneRegex.test(phone)) {
  return res.status(400).json({ message: "Phone number must be between 10 and 15 digits." });
}

const pincodeRegex = /^[a-zA-Z0-9\s-]{5,10}$/;
if (!pincodeRegex.test(pincode)) {
  return res.status(400).json({ message: "Pincode must be between 5 and 10 alphanumeric characters." });
}

const cityRegex = /^[a-zA-Z\s-]{2,50}$/;
if (!cityRegex.test(city)) {
  return res.status(400).json({ message: "City name must be between 2 and 50 characters." });
}

const stateRegex = /^[a-zA-Z\s-]{2,50}$/;
if (!stateRegex.test(state)) {
  return res.status(400).json({ message: "State name must be between 2 and 50 characters." });
}

if (addressLine.trim().length < 5 || addressLine.trim().length > 150) {
  return res.status(400).json({ message: "Address details must be between 5 and 150 characters." });
}

if(isDefault){
await Address.updateMany(
{user:req.user.id},
{$set:{isDefault:false}}
)
}

const address = await Address.create({
user:req.user.id,
fullName,
phone,
addressLine,
city,
state,
pincode,
isDefault
})

res.json(address)

}catch(err){
res.status(500).json({message:err.message})
}

}

export const getMyAddresses = async(req,res)=>{

try{

const addresses = await Address.find({
user:req.user.id
})

res.json(addresses)

}catch(err){
res.status(500).json({message:err.message})
}

}

export const deleteAddress = async(req,res)=>{

try{

await Address.findByIdAndDelete(req.params.id)

res.json({message:"Address Deleted"})

}catch(err){
res.status(500).json({message:err.message})
}

}

export const setDefaultAddress = async(req,res)=>{

try{

await Address.updateMany(
{user:req.user.id},
{$set:{isDefault:false}}
)

await Address.findByIdAndUpdate(
req.params.id,
{isDefault:true}
)

res.json({message:"Default Address Updated"})

}catch(err){
res.status(500).json({message:err.message})
}

}

export const updateAddress = async(req,res)=>{

try{

const {fullName,phone,addressLine,city,state,pincode,isDefault} = req.body

if (!fullName || !phone || !addressLine || !city || !state || !pincode) {
  return res.status(400).json({ message: "Please fill all fields" });
}

const nameRegex = /^[a-zA-Z\s]{2,50}$/;
if (!nameRegex.test(fullName)) {
  return res.status(400).json({ message: "Full Name must contain only letters and spaces, between 2 and 50 characters." });
}

const phoneRegex = /^\d{10,15}$/;
if (!phoneRegex.test(phone)) {
  return res.status(400).json({ message: "Phone number must be between 10 and 15 digits." });
}

const pincodeRegex = /^[a-zA-Z0-9\s-]{5,10}$/;
if (!pincodeRegex.test(pincode)) {
  return res.status(400).json({ message: "Pincode must be between 5 and 10 alphanumeric characters." });
}

const cityRegex = /^[a-zA-Z\s-]{2,50}$/;
if (!cityRegex.test(city)) {
  return res.status(400).json({ message: "City name must be between 2 and 50 characters." });
}

const stateRegex = /^[a-zA-Z\s-]{2,50}$/;
if (!stateRegex.test(state)) {
  return res.status(400).json({ message: "State name must be between 2 and 50 characters." });
}

if (addressLine.trim().length < 5 || addressLine.trim().length > 150) {
  return res.status(400).json({ message: "Address details must be between 5 and 150 characters." });
}

if(isDefault){
await Address.updateMany(
{user:req.user.id},
{$set:{isDefault:false}}
)
}

const address = await Address.findByIdAndUpdate(
req.params.id,
{
fullName,
phone,
addressLine,
city,
state,
pincode,
isDefault
},
{new:true}
)

res.json(address)

}catch(err){
res.status(500).json({message:err.message})
}

}