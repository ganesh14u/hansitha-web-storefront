const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const auth = require("../middleware/auth");
const User = require("../models/User.model.js");
const sendEmail = require("../utils/sendEmail.js");

const router = express.Router();

// 🔒 Sign token and send as cookie
const sendToken = (res, user) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const isProd = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "None" : "None", // Changed from "Lax" to "None" for local dev
    domain: isProd ? ".onrender.com" : undefined,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
  };
};

// ✅ GET /api/user/me - get current user
// Example Express route
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json({ user });
});


// ✅ POST /register
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name)
      return res.status(400).json({ message: "All fields required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });

    const user = await User.create({ email, password, name });
    const publicUser = sendToken(res, user);
    res.json({ success: true, user: publicUser });
  } catch (err) {
    console.error("🔴 Register error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
});

// ✅ POST /login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "All fields required" });

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(400).json({ message: "Invalid credentials" });

    const publicUser = sendToken(res, user);
    res.json({ success: true, user: publicUser });
  } catch (err) {
    console.error("🔴 Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

// ✅ POST /logout
router.post("/logout", (req, res) => {
  const isProd = process.env.NODE_ENV === "production";

  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "None",
    secure: isProd,
  });

  res.json({ success: true, message: "Logged out successfully" });
});

// ✅ POST /forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
    const html = `
      <p>Hello ${user.name || "User"},</p>
      <p>You requested a password reset.</p>
      <a href="${resetLink}" style="color:#6B46C1;">Reset Password</a>
    `;

    await sendEmail(user.email, "Reset Your Password", html);
    res.json({ success: true, message: "Email sent" });
  } catch (err) {
    console.error("🔴 Forgot password:", err);
    res.status(500).json({ message: "Failed to send email" });
  }
});

// ✅ POST /reset-password/:token
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("🔴 Reset password:", err);
    res.status(500).json({ message: "Password reset failed" });
  }
});

module.exports = router;
