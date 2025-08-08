const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

// GET all orders (newest first)
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// Razorpay webhook - only create order after payment success
router.post("/webhook", express.json({ type: "*/*" }), async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (signature !== expectedSignature) {
    console.error("❌ Invalid Razorpay signature");
    return res.status(400).json({ message: "Invalid signature" });
  }

  const event = req.body.event;

  if (event === "payment.captured") {
    try {
      const paymentEntity = req.body.payload.payment.entity;
      const notes = paymentEntity.notes || {};

      // Parse required details from notes (adjust based on how you saved notes)
      const name = notes.name || "Unknown Customer";
      const email = notes.email || "";
      const phone = notes.phone || "";
      const address = notes.address ? JSON.parse(notes.address) : {};
      const products = notes.cartItems ? JSON.parse(notes.cartItems) : [];
      const totalAmount = Number(notes.totalAmount) || paymentEntity.amount / 100;

      // Step 1: Update stock for each product
      const updatedStocks = [];
      for (const item of products) {
        const product = await Product.findById(item.id);

        if (!product) {
          console.error(`Product ${item.id} not found`);
          continue;
        }

        if (product.stock < item.quantity) {
          console.error(`Insufficient stock for ${product.name}`);
          continue;
        }

        product.stock -= item.quantity;
        await product.save();

        updatedStocks.push({ productId: product._id, stock: product.stock });
      }

      // Step 2: Save order with status "paid"
      const newOrder = new Order({
        name,
        email,
        phone,
        amount: totalAmount,
        status: "paid",
        products,
        createdAt: new Date(paymentEntity.created_at * 1000), // timestamp from Razorpay is in seconds
      });

      const savedOrder = await newOrder.save();

      // Step 3: Emit socket event to admins if socket.io is setup
      const io = req.app.get("io");
      if (io) {
        io.emit("newOrder", {
          _id: savedOrder._id,
          name: savedOrder.name,
          email: savedOrder.email,
          amount: savedOrder.amount,
          createdAt: savedOrder.createdAt,
        });
      }

      console.log("✅ Order created after payment:", savedOrder._id);
      return res.status(200).json({ success: true, updatedStock: updatedStocks });
    } catch (error) {
      console.error("Error creating order from webhook:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  // For other events, just acknowledge
  res.status(200).json({ message: "Webhook received but no order created" });
});

module.exports = router;
