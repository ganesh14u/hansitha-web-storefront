const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const Order = require("../models/Order");
require("dotenv").config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payment/payment-link - Create order & Razorpay payment link
router.post("/payment-link", async (req, res) => {
  const { amount, cartItems, customer, address } = req.body; // include address here

  try {
    // Save order with status "pending"
    const order = new Order({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      amount,
      products: cartItems,
      address,      // save address
      status: "pending",
    });

    await order.save();

    // Create Razorpay payment link with reference_id = order._id
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

    res.json({ paymentLink }); // send full paymentLink object
  } catch (err) {
    console.error("Payment link error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
