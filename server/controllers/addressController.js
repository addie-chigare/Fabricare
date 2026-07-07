import Address from "../models/Address.js"

export const addAddress = async(req,res)=>{

try{

const {fullName,phone,addressLine,city,state,pincode,isDefault} = req.body

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