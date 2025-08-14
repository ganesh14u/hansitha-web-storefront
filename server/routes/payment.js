const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const crypto = require("crypto");

router.post("/razorpay-webhook", express.json({ type: "application/json" }), async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (digest !== req.headers["x-razorpay-signature"]) {
    return res.status(400).send("Invalid signature");
  }

  const event = req.body.event;

  if (event === "payment_link.paid") {
    const paymentData = req.body.payload.payment_link.entity;

    // Save order after payment success
    const order = new Order({
      name: paymentData.notes.name,
      email: paymentData.notes.email,
      phone: paymentData.notes.phone,
      products: JSON.parse(paymentData.notes.cartItems),
      address: JSON.parse(paymentData.notes.address),
      amount: parseFloat(paymentData.notes.totalAmount),
      status: "Paid",
      razorpay_payment_link_id: paymentData.id,
    });

    await order.save();
  }

  res.status(200).send("OK");
});

module.exports = router;
