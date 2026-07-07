import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    image: {
      type: String, // image URL
      required: true,
    },

    images: {
      type: [String], // multiple product images
      default: []
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
    },

    brand: {
      type: String,
      default: "Fabricare Signature",
    },

    discount: {
      type: Number, // percentage, e.g. 10 or 20
      default: 0,
    },

    material: {
      type: String,
      default: "100% Premium Cotton"
    },

    colors: {
      type: [String],
      default: ["Navy Blue", "Charcoal Gray", "Pure White"]
    },

    sizes: {
      type: [String],
      default: ["S", "M", "L", "XL"]
    },

    rating: {
      type: Number,
      default: 4.5,
    },

    reviews: [reviewSchema],

    isFeatured: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",   
      required: true,
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);