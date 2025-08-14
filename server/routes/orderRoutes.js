// routes/orders.js
const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");
const router = express.Router();

const Order = require("../models/Order");
const Product = require("../models/Product");

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

/**
 * GET /api/orders
 * Returns all orders (newest first)
 */
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

/**
 * ✅ PUT /api/orders/:id/status
 * Updates only the deliveryStatus
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Processing", "Shipping", "Delivered"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Optional: validate ObjectId-like strings to avoid cast errors (if you store Mongo _id)
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ message: "Invalid order id format" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { deliveryStatus: status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // (Optional) emit via socket.io if available
    const io = req.app.get("io");
    if (io) {
      io.emit("orderStatusUpdated", {
        _id: updatedOrder._id,
        deliveryStatus: updatedOrder.deliveryStatus,
      });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/orders/webhook
 * Razorpay webhook — create order after successful payment
 */
router.post("/webhook", express.json({ type: "*/*" }), async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
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
      const paymentEntity = req.body.payload?.payment?.entity || {};
      const notes = paymentEntity.notes || {};

      // Parse cart + address (your checkout should save these to payment.notes)
      const name = notes.name || "Unknown Customer";
      const email = notes.email || "";
      const phone = notes.phone || "";
      const address = notes.address ? JSON.parse(notes.address) : {};
      const products = notes.cartItems ? JSON.parse(notes.cartItems) : [];
      const totalAmount =
        Number(notes.totalAmount) || Number(paymentEntity.amount) / 100 || 0;

      // Step 1: Update stock for each product
      const updatedStocks = [];
      for (const item of products) {
        try {
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
        } catch (err) {
          console.error("Stock update error:", err);
        }
      }

      // Step 2: Save order
      const newOrder = new Order({
        name,
        email,
        phone,
        amount: totalAmount,
        paymentStatus: "paid",          // ✅ payment status
        deliveryStatus: "Processing",    // ✅ default delivery stage
        products,
        address,                         // ✅ persist shipping address
        createdAt: paymentEntity.created_at
          ? new Date(paymentEntity.created_at * 1000)
          : new Date(),
      });

      const savedOrder = await newOrder.save();

      // Step 3: Notify admins via socket.io (if present)
      const io = req.app.get("io");
      if (io) {
        io.emit("newOrder", {
          _id: savedOrder._id,
          name: savedOrder.name,
          email: savedOrder.email,
          amount: savedOrder.amount,
          createdAt: savedOrder.createdAt,
          deliveryStatus: savedOrder.deliveryStatus,
        });
      }

      console.log("✅ Order created after payment:", savedOrder._id);
      return res.status(200).json({ success: true, updatedStock: updatedStocks });
    }

    // Other events: acknowledge
    return res.status(200).json({ message: "Webhook received" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
