import mongoose from "mongoose";

const laundryOrderSchema = new mongoose.Schema(
  {
    order_number: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pickup_date: {
      type: Date,
      required: true,
    },
    pickup_time: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    contact_number: {
      type: String,
      required: true,
    },
    special_instructions: {
      type: String,
      default: "",
    },
    services: [
      {
        type: String,
        enum: ["wash", "dry_clean", "iron"],
      },
    ],
    total_amount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "picked_up",
        "washing",
        "ironing",
        "ready_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    timeline: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        description: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export const LaundryOrder = mongoose.model("LaundryOrder", laundryOrderSchema);
