import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    logo: {
      type: String,
      default: "/logo.png",
    },
    brandName: {
      type: String,
      default: "Fabricare",
    },
    footerAbout: {
      type: String,
      default: "Your ultimate destination for premium clothing and professional laundry services.",
    },
    footerEmail: {
      type: String,
      default: "hello@fabricare.com",
    },
    footerPhone: {
      type: String,
      default: "+1 (555) 000-1234",
    },
    footerAddress: {
      type: String,
      default: "123 Fabricare Towers, Fashion District, Mumbai, India",
    },
    laundryWashFoldPrice: {
      type: Number,
      default: 49,
    },
    laundryDryCleanPrice: {
      type: Number,
      default: 99,
    },
    laundrySteamIronPrice: {
      type: Number,
      default: 19,
    },
  },
  { timestamps: true }
);

export const Settings = mongoose.model("Settings", settingsSchema);
