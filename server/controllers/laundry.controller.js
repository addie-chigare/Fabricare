import { LaundryOrder } from "../models/LaundryOrder.js";
import { Settings } from "../models/settings.js";
import { sendLaundryNotificationEmail } from "../utils/emailService.js";

// Service map for mapping string service IDs to full service detail objects
const serviceMap = {
  wash: {
    id: "wash",
    name: "Wash & Fold",
    description: "Everyday cotton wear, bedsheets, and towels, gently washed and perfectly folded.",
    icon: "💧",
    features: ["Eco-friendly detergents", "Separate washing", "Neatly folded"]
  },
  dry_clean: {
    id: "dry_clean",
    name: "Dry Cleaning",
    description: "Suits, jackets, silk sarees, and delicate designer dresses treated with solvent care.",
    icon: "👔",
    features: ["Special fabric care", "Stain pre-treatment", "Hanger delivery"]
  },
  iron: {
    id: "iron",
    name: "Premium Steam Ironing",
    description: "Crease-free premium steam press to give your clothes a sharp, professional look.",
    icon: "✨",
    features: ["Crease-free finish", "Steam pressing", "Collar support"]
  }
};

const formatOrder = (order) => {
  const mappedServices = (order.services || []).map(s => serviceMap[s] || { id: s, name: s });
  return {
    id: order._id,
    _id: order._id,
    order_number: order.order_number,
    created_at: order.createdAt,
    status: order.status,
    pickup_date: order.pickup_date,
    pickup_time: order.pickup_time,
    address: order.address,
    contact_number: order.contact_number,
    special_instructions: order.special_instructions,
    services: mappedServices,
    total_amount: order.total_amount,
    timeline: order.timeline,
    user: order.user
  };
};

// Customer Controller Endpoints

export const getServices = async (req, res) => {
  try {
    const services = Object.values(serviceMap);
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPricing = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    const pricing = [
      {
        id: "wash_fold",
        service_type: "Wash & Fold",
        item_name: "Everyday Clothes",
        price: settings.laundryWashFoldPrice || 49,
        delivery_time: "24 Hours"
      },
      {
        id: "dry_cleaning",
        service_type: "Dry Cleaning",
        item_name: "Premium Wear",
        price: settings.laundryDryCleanPrice || 99,
        delivery_time: "48 Hours"
      },
      {
        id: "steam_ironing",
        service_type: "Premium Steam Ironing",
        item_name: "Crease-free Press",
        price: settings.laundrySteamIronPrice || 19,
        delivery_time: "24 Hours"
      }
    ];

    res.status(200).json(pricing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const bookPickup = async (req, res) => {
  try {
    const {
      pickup_date,
      pickup_time,
      address,
      contact_number,
      special_instructions,
      services
    } = req.body;

    if (!pickup_date || !pickup_time || !address || !contact_number || !services || services.length === 0) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = { laundryWashFoldPrice: 49, laundryDryCleanPrice: 99, laundrySteamIronPrice: 19 };
    }

    // Calculate base total amount
    let total_amount = 0;
    if (services.includes("wash")) total_amount += settings.laundryWashFoldPrice || 49;
    if (services.includes("dry_clean")) total_amount += settings.laundryDryCleanPrice || 99;
    if (services.includes("iron")) total_amount += settings.laundrySteamIronPrice || 19;

    const order_number = `LDY-${Math.floor(100000 + Math.random() * 900000)}`;

    const order = new LaundryOrder({
      order_number,
      user: req.user._id,
      pickup_date,
      pickup_time,
      address,
      contact_number,
      special_instructions,
      services,
      total_amount,
      timeline: [
        {
          date: new Date(),
          description: "Pickup scheduled and order pending confirmation"
        }
      ]
    });

    await order.save();

    try {
      sendLaundryNotificationEmail(req.user.email, req.user.name, order, "pending");
    } catch (err) {
      console.error("Failed to send laundry booked email:", err.message);
    }

    res.status(201).json(formatOrder(order));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await LaundryOrder.find({ user: req.user._id }).sort({ createdAt: -1 });
    const formatted = orders.map(order => formatOrder(order));
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await LaundryOrder.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(formatOrder(order));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSupport = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    res.status(200).json({
      phone: settings.footerPhone || "+91 98765 43210",
      email: settings.footerEmail || "support@fabricare.com",
      address: settings.footerAddress || "123 Fabricare Towers, Mumbai, India",
      faqs: [
        {
          question: "What are your pickup timings?",
          answer: "We offer pickup slots from 9 AM to 7 PM, Monday to Saturday."
        },
        {
          question: "How long does laundry take?",
          answer: "Standard service takes 24-48 hours. Express service is available for 12-hour delivery."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept Cash on Delivery, PayPal, and UPI."
        },
        {
          question: "Can I cancel my order?",
          answer: "Yes, you can cancel orders within 1 hour of booking or before pickup."
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin Controller Endpoints

export const getAllOrders = async (req, res) => {
  try {
    const orders = await LaundryOrder.find().populate("user", "name email").sort({ createdAt: -1 });
    const formatted = orders.map(order => formatOrder(order));
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, total_amount, timelineDescription } = req.body;
    const order = await LaundryOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (status) {
      order.status = status;
      const desc = timelineDescription || `Order status updated to ${status.replace("_", " ")}`;
      order.timeline.push({
        date: new Date(),
        description: desc
      });
    }

    if (total_amount !== undefined) {
      order.total_amount = Number(total_amount);
    }

    await order.save();

    try {
      await order.populate("user", "name email");
      sendLaundryNotificationEmail(order.user.email, order.user.name, order, status);
    } catch (err) {
      console.error("Failed to send laundry status update email:", err.message);
    }

    res.status(200).json(formatOrder(order));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePricing = async (req, res) => {
  try {
    const { laundryWashFoldPrice, laundryDryCleanPrice, laundrySteamIronPrice } = req.body;
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    if (laundryWashFoldPrice !== undefined) settings.laundryWashFoldPrice = Number(laundryWashFoldPrice);
    if (laundryDryCleanPrice !== undefined) settings.laundryDryCleanPrice = Number(laundryDryCleanPrice);
    if (laundrySteamIronPrice !== undefined) settings.laundrySteamIronPrice = Number(laundrySteamIronPrice);

    await settings.save();
    res.status(200).json({ message: "Pricing updated successfully", settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const totalOrders = await LaundryOrder.countDocuments();
    const pendingOrders = await LaundryOrder.countDocuments({ status: "pending" });
    const completedOrders = await LaundryOrder.find({ status: "delivered" });
    const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

    res.status(200).json({
      totalOrders,
      pendingOrders,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
