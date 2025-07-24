// routes/user.routes.js

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth.js");
const User = require("../models/User.model.js");

const router = express.Router();

// ✅ Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Login successful", userId: user._id, email: user.email, name: user.name });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// ✅ Get current user info
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("wishlist")
      .populate("cart.product");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user", error: err });
  }
});

// ✅ Cart
router.post("/cart", auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const index = user.cart.findIndex((item) => item.product.toString() === productId);
    if (index !== -1) user.cart[index].quantity += quantity;
    else user.cart.push({ product: productId, quantity });

    await user.save();
    res.json({ cart: user.cart });
  } catch (err) {
    console.error("Cart error:", err);
    res.status(500).json({ message: "Failed to update cart" });
  }
});

// ✅ Wishlist toggle
router.post("/wishlist", auth, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if product exists in wishlist
    const exists = user.wishlist.some(id => id.toString() === productId);
    
    if (exists) {
      // Remove from wishlist
      user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    } else {
      // Add to wishlist
      user.wishlist.push(productId);
    }

    await user.save();
    
    // Return updated wishlist
    res.json({
      success: true,
      wishlist: user.wishlist,
      action: exists ? 'removed' : 'added'
    });
  } catch (err) {
    console.error("Wishlist error", err);
    res.status(500).json({ success: false, message: "Server error updating wishlist" });
  }
});

// ✅ Get user's wishlist
router.get("/wishlist", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("wishlist");
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    console.error("Get wishlist error", err);
    res.status(500).json({ success: false, message: "Server error fetching wishlist" });
  }
});

// ✅ Place order
router.post("/order", auth, async (req, res) => {
  try {
    const { products, total } = req.body;
    if (!products || typeof total !== "number")
      return res.status(400).json({ message: "Missing products or total" });

    const user = await User.findById(req.user.id);
    user.orders.push({ products, total });
    await user.save();
    res.json(user.orders);
  } catch (err) {
    res.status(500).json({ message: "Error placing order", error: err });
  }
});

router.patch("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect current password" });
    }

    user.password = newPassword; // ✅ Let pre-save hook hash it
    await user.save();           // ✅ Triggers pre-save hook

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("Change Password error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// ✅ Delete account
router.delete("/delete-account", auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.clearCookie("token");
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting account", error: err });
  }
});

module.exports = router;
