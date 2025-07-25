// routes/user.routes.js

const express = require("express");
const express = require("express");

const User = require("../models/User.model.js");

const router = express.Router();

// Cart
router.post("/cart", async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const user = await User.findById(req.body.userId);
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

// Wishlist toggle
router.post("/wishlist", async (req, res) => {
  try {
    const { productId, userId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const user = await User.findById(userId);
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

// Get user's wishlist
router.get("/wishlist", async (req, res) => {
  try {
    const user = await User.findById(req.query.userId).populate("wishlist");
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    console.error("Get wishlist error", err);
    res.status(500).json({ success: false, message: "Server error fetching wishlist" });
  }
});

// Place order
router.post("/order", async (req, res) => {
  try {
    const { products, total, userId } = req.body;
    if (!products || typeof total !== "number")
      return res.status(400).json({ message: "Missing products or total" });

    const user = await User.findById(userId);
    user.orders.push({ products, total });
    await user.save();
    res.json(user.orders);
  } catch (err) {
    res.status(500).json({ message: "Error placing order", error: err });
  }
});

module.exports = router;
