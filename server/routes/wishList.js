const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Wishlist = require("../models/Wishlist");

// 🟢 GET /api/wishlist - Fetch current user's wishlist
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlist = await Wishlist.findOne({ user: userId }).populate("products");

    if (!wishlist) {
      return res.status(200).json({ wishlist: [] });
    }

    res.status(200).json({ wishlist: wishlist.products }); // now contains full product objects
  } catch (error) {
    console.error("GET /wishlist error:", error);
    res.status(500).json({ message: "Failed to load wishlist" });
  }
});



// 🔁 POST /api/wishlist/toggle - Toggle product in wishlist
router.post("/toggle", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [productId] });
    } else {
      const index = wishlist.products.indexOf(productId);
      if (index === -1) {
        wishlist.products.push(productId);
      } else {
        wishlist.products.splice(index, 1);
      }
    }

    await wishlist.save();
    res.json({ wishlist: wishlist.products });
  } catch (err) {
    console.error("Toggle wishlist failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
