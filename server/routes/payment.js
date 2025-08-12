const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const Order = require("../models/Order");
require("dotenv").config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payment/payment-link
router.post("/payment-link", async (req, res) => {
  const { totalAmount, cartItems, userName, userEmail, userPhone, shippingAddress } = req.body;

  try {
    // Save order with status "pending" and full info
    const order = new Order({
      name: userName,
      email: userEmail,
      phone: userPhone,
      amount: totalAmount,
      products: cartItems,
      address: shippingAddress,  // <-- store address as object here
      status: "pending",
    });

    await order.save();

    // Create Razorpay payment link, add all data into notes (strings where needed)
    const paymentLink = await razorpay.paymentLink.create({
      amount: Math.round(totalAmount * 100), // paise
      currency: "INR",
      reference_id: order._id.toString(),
      description: `Payment for Order ${order._id}`,
      customer: {
        name: userName,
        email: userEmail,
        contact: userPhone,
      },
      notify: {
        sms: true,
        email: true,
      },
      notes: {
        name: userName,
        email: userEmail,
        phone: userPhone,
        address: JSON.stringify(shippingAddress),   // stringify address object
        cartItems: JSON.stringify(cartItems),       // stringify products array
        totalAmount: totalAmount.toString(),
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
