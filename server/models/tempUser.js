import mongoose from "mongoose";

const tempUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
    otp: {
      type: String,
      required: true,
    },
    otpExpire: {
      type: Date,
      required: true,
    },
    otpSentCount: {
      type: Number,
      default: 1,
    },
    lastOtpSentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// TTL index to automatically delete documents when the time reaches otpExpire
tempUserSchema.index({ otpExpire: 1 }, { expireAfterSeconds: 0 });

export const TempUser = mongoose.model("TempUser", tempUserSchema);
