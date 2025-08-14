const express = require("express");
const Razorpay = require("razorpay");
const router = express.Router();
const Order = require("../models/Order");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post("/payment-link", async (req, res) => {
  const { totalAmount, cartItems, userName, userEmail, userPhone, shippingAddress } = req.body;

  try {
    // Create Razorpay payment link
    const paymentLink = await razorpay.paymentLink.create({
      amount: Math.round(totalAmount * 100), // paise
      currency: "INR",
      description: `Payment for ${userName}`,
      customer: {
        name: userName,
        email: userEmail,
        contact: userPhone,
      },
      notify: { sms: true, email: true },
      notes: {
        name: userName,
        email: userEmail,
        phone: userPhone,
        address: JSON.stringify(shippingAddress),
        cartItems: JSON.stringify(cartItems),
        totalAmount: totalAmount.toString(),
      },
      callback_url: `${process.env.FRONTEND_URL}/order-confirmation`,
      callback_method: "get",
    });

    res.json({ paymentLink }); // do NOT save order here
  } catch (err) {
    console.error("Payment link error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});


module.exports = router;
