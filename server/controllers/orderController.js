const Order = require("../models/Order");
const User = require("../models/User");
const mongoose = require("mongoose");

const placeOrder = async (req, res) => {
  const {
    name,
    email,
    phone,
    amount,
    products,
    userId,
    razorpayPaymentId,
    razorpayOrderId,
  } = req.body;

  try {
    // 1. Save in Order collection
    const newOrder = await Order.create({
      name,
      email,
      phone,
      amount,
      status: "paid",
      products,
    });

    // 2. Save summary in user's orders[]
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      const user = await User.findById(userId);
      if (user) {
        user.orders.push({
          products: products.map((p) => ({
            product: mongoose.Types.ObjectId(p.id),
            quantity: p.quantity,
          })),
          total: amount,
          paymentId: razorpayPaymentId || "",
          razorpayOrderId: razorpayOrderId || "",
        });

        // Optional: clear user's cart after order
        user.cart = [];

        await user.save();
        console.log("✅ Order also saved in user.orders");
      } else {
        console.warn("⚠️ User not found with ID:", userId);
      }
    } else {
      console.warn("⚠️ Invalid userId provided:", userId);
    }

    res.status(201).json({ success: true, order: newOrder });
  } catch (error) {
    console.error("❌ Failed to place order:", error);
    res.status(500).json({ success: false, error: "Failed to place order" });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, error: "Invalid order ID" });
    }

    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("❌ Failed to fetch order:", error);
    res.status(500).json({ success: false, error: "Failed to fetch order" });
  }
};

const getCurrentOrderId = async (req, res) => {
  try {
    // Get the most recent order for the user based on email
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    const order = await Order.findOne({ email })
      .sort({ createdAt: -1 })
      .select('_id');

    if (!order) {
      return res.status(404).json({ success: false, error: "No order found" });
    }

    res.status(200).json({ success: true, orderId: order._id });
  } catch (error) {
    console.error("❌ Failed to fetch current order:", error);
    res.status(500).json({ success: false, error: "Failed to fetch current order" });
  }
};

module.exports = { placeOrder, getOrderById, getCurrentOrderId };
