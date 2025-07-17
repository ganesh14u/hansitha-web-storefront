const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  address: String,
  cart: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
    }
  ],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  orders: [
    {
      products: [
        {
          productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
          quantity: Number,
        }
      ],
      total: Number,
      createdAt: { type: Date, default: Date.now },
    }
  ]
}, { timestamps: true });

// 🔐 Compare password method
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
