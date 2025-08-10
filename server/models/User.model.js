const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  cart: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 },
    },
  ],

  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],


  orders: [
  {
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true },
      },
    ],
    total: Number,
    paymentId: String,
    razorpayOrderId: String,
    createdAt: { type: Date, default: Date.now },
  },
],

});

// ✅ Hash password before saving (only if modified)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ✅ Compare raw password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
