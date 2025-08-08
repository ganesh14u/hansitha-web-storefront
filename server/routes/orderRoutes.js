const Order = require("../models/Order");
const User = require("../models/User");
const mongoose = require("mongoose");

// Place a new order (you can adjust this to your needs)
const placeOrder = async (req, res) => {
  try {
    const { userId, products, totalAmount, customerEmail } = req.body;

    if (!userId || !products || !totalAmount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newOrder = new Order({
      userId,
      products,
      totalAmount,
      customerEmail,
      createdAt: new Date(),
      status: "pending", // or "paid" depending on flow
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({ success: true, order: savedOrder });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Failed to place order" });
  }
};

// Get order details by ID (make sure to authorize user)
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId; // assume set by auth middleware

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Failed to fetch order" });
  }
};

// Get current (latest) order ID for logged-in user
const getCurrentOrderId = async (req, res) => {
  try {
    const userId = req.userId; // assume set by auth middleware

    const latestOrder = await Order.findOne({ userId }).sort({ createdAt: -1 }).select("_id");

    if (!latestOrder) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.json({ orderId: latestOrder._id });
  } catch (error) {
    console.error("Error fetching current order ID:", error);
    res.status(500).json({ message: "Failed to fetch current order ID" });
  }
};

module.exports = {
  placeOrder,
  getOrderById,
  getCurrentOrderId,
};
