const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const Razorpay = require("razorpay");
const Order = require("../models/Order");
require("dotenv").config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

// Create Razorpay Payment Link and save order with address/products
router.post("/payment-link", async (req, res) => {
  const { amount, cartItems, customer, address } = req.body;

  try {
    const order = new Order({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      amount,
      products: cartItems,
      address,
      status: "pending",
    });

    await order.save();

    const paymentLink = await razorpay.paymentLink.create({
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      reference_id: order._id.toString(),
      description: `Payment for Order ${order._id}`,
      customer: {
        name: customer.name,
        email: customer.email,
        contact: customer.phone,
      },
      notify: {
        sms: true,
        email: true,
      },
      callback_url: `${process.env.BASE_URL}/order-confirmation`,
      callback_method: "get",
    });

    res.json({ paymentLink });
  } catch (err) {
    console.error("Payment link error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Razorpay webhook to update order status on payment success
router.post("/webhook", express.json({ type: "*/*" }), async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];

  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (signature !== expectedSignature) {
    console.error("❌ Invalid Razorpay webhook signature");
    return res.status(400).json({ message: "Invalid signature" });
  }

  const event = req.body.event;

  if (event === "payment_link.paid") {
    try {
      const paymentLinkEntity = req.body.payload.payment_link.entity;
      const referenceId = paymentLinkEntity.reference_id; // This is order._id

      if (!referenceId) {
        console.error("No reference_id found in payment link");
        return res.status(400).json({ message: "Missing reference_id" });
      }

      // Update order status to 'paid'
      const updatedOrder = await Order.findByIdAndUpdate(
        referenceId,
        { status: "paid" },
        { new: true }
      );

      if (!updatedOrder) {
        console.error(`Order not found with id ${referenceId}`);
        return res.status(404).json({ message: "Order not found" });
      }

      console.log(`✅ Order ${referenceId} marked as paid`);

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ message: "Server error" });
    }
  } else {
    // Acknowledge other webhook events
    res.status(200).json({ message: "Event received" });
  }
});

module.exports = router;
