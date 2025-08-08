// routes/payment.js or routes/checkout.js
const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const Order = require("../models/Order"); // Make sure path is correct

require("dotenv").config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post("/payment-link", async (req, res) => {
  const { amount, cartItems, customer } = req.body;

  try {
    // Save order to MongoDB with status "pending"
    const order = new Order({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      amount,
      cartItems,
      status: "pending",
    });

    await order.save(); // Save to DB

    // Create Razorpay Payment Link with reference_id set to order._id
    const paymentLink = await razorpay.paymentLink.create({
      amount: Math.round(amount * 100), // amount in paise (integer)
      currency: "INR",
      reference_id: order._id.toString(), // <-- This is your internal order ID
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
      callback_url: `${process.env.BASE_URL}/order-confirmation`, // Frontend URL that handles confirmation
      callback_method: "get",
    });

    res.json({ paymentLink }); // Send full paymentLink object or just paymentLink.short_url if you prefer
  } catch (err) {
    console.error("Payment link error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
