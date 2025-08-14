// Core Dependencies
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
const { v2: cloudinary } = require("cloudinary");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");

// Env Setup
dotenv.config();
const app = express();
app.set("trust proxy", 1);
const server = http.createServer(app);

// ✅ Allowed Origins Setup
const allowedOrigins = [
  "http://localhost:8080",
  "https://hansithacreations.com",
  "https://hansithacreations.netlify.app",
  "https://hansitha-web-storefront.onrender.com",
  "https://hansithacreations.liveblog365.com",
];

// ✅ Socket.IO CORS Config
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});
global.io = io;

// ✅ Express Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

// Multer Config
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Database Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "web-store",
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --------------------- SOCKET.IO ---------------------
io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// --------------------- ORDER SCHEMA -------------------
const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: Number,
  image: String,
});

const OrderSchema = new mongoose.Schema({
  email: { type: String, required: true },
  products: [ProductSchema],
  totalAmount: Number,
  createdAt: { type: Date, default: Date.now },
  deliveryStatus: { type: String, default: "Processing" }, // Added deliveryStatus
});

const Order = mongoose.model("Order", OrderSchema);

// --------------------- ROUTES -------------------------

// Get orders (optionally filter by email)
app.get("/api/orders", async (req, res) => {
  try {
    const email = req.query.email;
    const orders = email ? await Order.find({ email }) : await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders", error: err });
  }
});

// Update delivery status
app.put("/api/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryStatus } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { deliveryStatus },
      { new: true }
    );

    if (!updatedOrder)
      return res.status(404).json({ message: "Order not found" });

    // Emit update event
    io.emit("orderStatusUpdated", updatedOrder);

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: "Failed to update status", error: err });
  }
});

// Create order
app.post("/api/orders", async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();

    // Emit creation event
    io.emit("orderStatusUpdated", newOrder);

    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ message: "Failed to create order", error: err });
  }
});

// ------------------- OTHER ROUTES ---------------------
// Keep your existing routes intact
const authRoutes = require("./routes/auth.js");
const userRoutes = require("./routes/user.routes.js");
const categoryRoutes = require("./routes/categories");
const checkoutRoutes = require("./routes/checkoutRoutes");
const webhookRoutes = require("./routes/webhook");
const productRoutes = require("./routes/productRoutes");
const otpRoutes = require("./routes/otpRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/payment");

app.use("/api/payment", paymentRoutes);
app.use("/api", webhookRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/auth", otpRoutes);
app.use("/api/orders", orderRoutes);

// ------------------- CAROUSEL & ANNOUNCEMENT ---------------------
// Keep your carousel, announcement, newsletter routes as-is

// Health check
app.get("/", (req, res) => res.status(200).send("Backend is live"));

// ------------------- START SERVER ---------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
