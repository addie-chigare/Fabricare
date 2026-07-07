import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
{
  name:{
    type:String,
    required:true
  },

  email:{
    type:String,
    required:true,
    unique:true,
    lowercase:true
  },

  username:{
    type:String,
    required:true,
    unique:true
  },

  password:{
    type:String,
    required:true
  },

  role:{
    type:String,
    enum:["user","admin"],
    default:"user"
  },

  isBlocked:{
    type:Boolean,
    default:false
  },

  resetPasswordToken:{
    type:String,
    default:null
  },

  resetPasswordExpire:{
    type:Date,
    default:null
  },

  otpSentCount:{
    type:Number,
    default:0
  },

  lastOtpSentAt:{
    type:Date,
    default:null
  },

  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    }
  ]

},
{timestamps:true}
)

export const User = mongoose.model("User",userSchema)