const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User.model.js");
const sendEmail = require("../utils/sendEmail.js");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// -----------------------------
// 🔒 Token Generator
// -----------------------------
const generateToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

// -----------------------------
// ✅ GET /api/auth/me
// -----------------------------
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// -----------------------------
// ✅ POST /api/auth/register
// -----------------------------
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name)
      return res.status(400).json({ success: false, message: "All fields are required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ success: false, message: "Email already exists" });

    const user = await User.create({ email, password, name });
    const token = generateToken(user);

    // ✅ Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("🔴 Register error:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
});

// -----------------------------
// ✅ POST /api/auth/login
// -----------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = generateToken(user);

    // ✅ Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("🔴 Login error:", err.message);
    res.status(500).json({
      success: false,
      message: "Login failed due to server error",
    });
  }
});

// -----------------------------
// ✅ POST /api/auth/logout
// -----------------------------
router.post("/logout", (req, res) => {
  res.clearCookie("token"); // ✅ Clear the auth cookie
  res.json({ success: true, message: "Logged out successfully" });
});

// -----------------------------
// ✅ POST /api/auth/forgot-password
// -----------------------------
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
    const html = `
      <p>Hello ${user.name || "User"},</p>
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password (valid for 15 minutes):</p>
      <a href="${resetLink}" style="color:#6B46C1;">${resetLink}</a>
      <p>If you didn't request this, you can ignore this email.</p>
    `;

    await sendEmail(user.email, "Reset Your Password", html);

    res.json({ success: true, message: "Reset link sent to your email" });
  } catch (err) {
    console.error("🔴 Forgot Password error:", err.message);
    res.status(500).json({ success: false, message: "Failed to send reset link" });
  }
});

// -----------------------------
// ✅ POST /api/auth/reset-password/:token
// -----------------------------
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ success: false, message: "Invalid or expired token" });

    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    res.json({ success: true, message: "Password has been reset" });
  } catch (err) {
    console.error("🔴 Reset Password error:", err.message);
    res.status(500).json({ success: false, message: "Failed to reset password" });
  }
});

module.exports = router;
