const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  name: String,
  price: Number,
  image: String,
  quantity: Number,
});

const orderSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    cartItems: [cartItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
