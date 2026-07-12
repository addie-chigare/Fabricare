import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import { Product } from "../models/product.js";
import Address from "../models/Address.js";
import { User } from "../models/user.js";
import { sendSMS } from "../utils/smsHelper.js";
import { sendOrderNotificationEmail } from "../utils/emailService.js";

export const placeOrder = async (req, res) => {
  try {
    const { address, acceptedPolicy, paymentMethod, transactionId } = req.body;

    if (!acceptedPolicy) {
      return res.status(400).json({
        message: "Please accept cancellation policy",
      });
    }

    const cartItems = await Cart.find({ user: req.user.id }).populate(
      "product",
    );

    if (cartItems.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    // stock check
    for (const item of cartItems) {
      const product = await Product.findById(item.product._id);

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `${product.name} out of stock`,
        });
      }

      product.stock -= item.quantity;
      await product.save();
    }

    // ✅ Save address if not exists
    const existingAddress = await Address.findOne({
      user: req.user.id,
      addressLine: address.addressLine,
      pincode: address.pincode,
    });

    if (!existingAddress) {
      await Address.create({
        user: req.user.id,
        fullName: address.fullName,
        phone: address.phone,
        addressLine: address.addressLine,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      });
    }

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );

    const order = new Order({
      user: req.user.id,
      

      items: cartItems.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        size: item.size || "",
        color: item.color || "",
      })),

      address,

      totalAmount,

      paymentMethod: paymentMethod || "COD",

      transactionId: transactionId || null,

      paymentStatus: paymentMethod === "PayPal" ? "Completed" : "Pending",

      status: paymentMethod === "PayPal" ? "Confirmed" : "Pending",
    });

    await order.save();

    await Cart.deleteMany({ user: req.user.id });

    try {
      const populatedOrder = await Order.findById(order._id).populate("items.product");
      sendOrderNotificationEmail(req.user.email, req.user.name, populatedOrder, order.status);
    } catch (err) {
      console.error("Failed to send order placed email:", err.message);
    }

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // 🔐 only order owner can cancel
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    // ❌ already processed order cannot cancel
    if (order.status !== "Pending" && order.status !== "Confirmed") {
      return res.status(400).json({
        message: "Order cannot be cancelled",
      });
    }

    // 🔄 return stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);

      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    // ✅ update order
    order.status = "Cancelled";
    order.isCancelled = true;
    order.cancelledAt = new Date();

    // 💸 Refund payment if online (PayPal) and Completed
    if (order.paymentMethod === "PayPal" && order.paymentStatus === "Completed") {
      order.paymentStatus = "Refunded";
    }

    await order.save();

    try {
      const populatedOrder = await Order.findById(order._id).populate("items.product");
      sendOrderNotificationEmail(req.user.email, req.user.name, populatedOrder, "Cancelled");
    } catch (err) {
      console.error("Failed to send order cancellation email:", err.message);
    }

    res.json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//admin side

export const getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const orders = await Order.find()
      .populate("user", "username email")
      .populate("items.product", "name price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Admin only",
      });
    }

    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const currentStatus = order.status;
    if (currentStatus !== status) {
      if (currentStatus === "Delivered" || currentStatus === "Cancelled") {
        return res.status(400).json({ message: `Cannot change status of a ${currentStatus} order.` });
      }
      
      if (status === "Pending") {
        return res.status(400).json({ message: "Cannot revert order status back to Pending." });
      }

      if (currentStatus === "Confirmed" && status !== "Shipped" && status !== "Cancelled") {
        return res.status(400).json({ message: "Confirmed order can only transition to Shipped or Cancelled." });
      }

      if (currentStatus === "Shipped" && status !== "Delivered") {
        return res.status(400).json({ message: "Shipped order can only transition to Delivered." });
      }
    }

    order.status = status;

    // 📦 shipped date
    if (status === "Shipped") {
      order.shippedAt = new Date();
      if (order.address && order.address.phone) {
        try {
          const orderIdSuffix = order._id.toString().slice(-8).toUpperCase();
          const message = `Dear Customer, your order #${orderIdSuffix} has been shipped successfully! (tumchi order Shipped state madhe ata ahe)`;
          sendSMS(order.address.phone, message);
        } catch (err) {
          console.error("Error sending SMS on manual update to Shipped:", err.message);
        }
      }
    }

    // 🚚 delivered date
    if (status === "Delivered") {
      order.deliveredAt = new Date();

      // ⭐ COD payment received after delivery
      if (order.paymentMethod === "COD") {
        order.paymentStatus = "Completed";
      }
    }

    // ❌ cancelled date, return stock, and refund
    if (status === "Cancelled") {
      if (!order.isCancelled) {
        for (const item of order.items) {
          const product = await Product.findById(item.product);
          if (product) {
            product.stock += item.quantity;
            await product.save();
          }
        }
        order.isCancelled = true;
        order.cancelledAt = new Date();
      }

      // 💸 Refund payment if online (PayPal) and Completed
      if (order.paymentMethod === "PayPal" && order.paymentStatus === "Completed") {
        order.paymentStatus = "Refunded";
      }
    }

    await order.save();

    try {
      await order.populate("user", "name email");
      await order.populate("items.product");
      sendOrderNotificationEmail(order.user.email, order.user.name, order, status);
    } catch (err) {
      console.error("Failed to send order update email:", err.message);
    }

    res.json({
      message: "Order status updated",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admin only",
      });
    }

    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "username email")
      .populate("items.product", "name price");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const orders = await Order.find({ 
      status: { $ne: "Cancelled" },
      paymentStatus: { $nin: ["Failed", "Refunded"] }
    });

    const totalOrders = orders.length;

    const revenueData = await Order.aggregate([
      { 
        $match: { 
          status: { $ne: "Cancelled" },
          paymentStatus: { $nin: ["Failed", "Refunded"] }
        } 
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    const recentOrders = await Order.find()
      .populate("user", "username")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalOrders,
      totalRevenue,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getMonthlyRevenue = async (req, res) => {
  try {
    const data = await Order.aggregate([
      {
        $match: {
          status: { $ne: "Cancelled" },
          paymentStatus: { $nin: ["Failed", "Refunded"] }
        },
      },

      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
        },
      },

      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: "Pending" })
      .populate("user", "username")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTopProducts = async (req, res) => {
  try {
    const products = await Order.aggregate([
      { $unwind: "$items" },

      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
        },
      },

      { $sort: { totalSold: -1 } },

      { $limit: 5 },

      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },

      { $unwind: "$product" },

      {
        $project: {
          name: "$product.name",
          price: "$product.price",
          totalSold: 1,
        },
      },
    ]);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
