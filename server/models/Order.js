// models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // Customer
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },

    // Amount (₹)
    amount: { type: Number, required: true },

    // ✅ Split payment vs delivery statuses
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
      index: true,
    },
    deliveryStatus: {
      type: String,
      enum: ["Processing", "Shipping", "Delivered"],
      default: "Processing",
      index: true,
    },

    // Cart items
    products: [
      {
        id: { type: String, required: true }, // Product _id as string
        name: { type: String, required: true },
        image: String,
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],

    // Shipping address
    address: {
      address1: String,
      address2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
  },
  { timestamps: true } // provides createdAt/updatedAt
);

module.exports = mongoose.model("Order", orderSchema);
