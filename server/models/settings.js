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
    aboutTitle: {
      type: String,
      default: "About Our Brand",
    },
    aboutDescription: {
      type: String,
      default: "We are dedicated to providing the highest quality products and laundry services. Our garments are sourced with care and designed for modern life, and our garment care services use state-of-the-art eco-friendly technologies to keep your wardrobe fresh.",
    },
    aboutMission: {
      type: String,
      default: "To deliver exceptional apparel quality and convenient, smart fabric care solutions that enrich daily lives.",
    },
    aboutVision: {
      type: String,
      default: "To build a sustainable, trusted lifestyle brand bridging retail and convenience services.",
    },
    aboutImageUrl: {
      type: String,
      default: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80",
    },
    contactMapEmbed: {
      type: String,
      default: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.8258359287313!2d72.8253163153835!3d19.07139198708817!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c91130392c07%3A0x1102e50d53c7a3!2sBandra%20Kurla%20Complex%2C%20Bandra%20East%2C%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1655000000000!5m2!1sen!2sin",
    },
  },
  { timestamps: true }
);

export const Settings = mongoose.model("Settings", settingsSchema);
