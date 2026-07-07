import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      quantity: Number,
      size: { type: String, default: "" },
      color: { type: String, default: "" },
    },
  ],

  address: {
    fullName: String,
    phone: String,
    city: String,
    state: String,
    pincode: String,
    addressLine: String,
  },

  totalAmount: Number,

  // Payment Method
  paymentMethod: {
    type: String,
    enum: ["COD", "PayPal"],
    default: "COD",
  },

  // PayPal Transaction ID
  transactionId: {
    type: String,
    default: null
  },

  // Payment Status
  paymentStatus: {
    type: String,
    enum: ["Pending", "Completed", "Failed"],
    default: "Pending",
  },

  // Order Status
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
    default: "Pending",
  },

  isCancelled: {
    type: Boolean,
    default: false,
  },

  cancelledAt: Date,
  shippedAt: Date,
  deliveredAt: Date,

},
{ timestamps: true }
);

export default mongoose.model("Order", orderSchema);