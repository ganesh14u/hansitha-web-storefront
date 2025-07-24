const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

// ✅ POST /api/orders - create a new order & update stock with transaction
router.post('/', async (req, res) => {
  const session = await Product.startSession();
  session.startTransaction();

  try {
    const { email, address, cartItems, totalAmount } = req.body;
    const updatedStocks = [];

    // ✅ Step 1: Reduce stock in a transaction
    for (const item of cartItems) {
      const product = await Product.findById(item._id).session(session);

      if (!product) {
        throw new Error(`Product with ID ${item._id} not found`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      product.stock -= item.quantity;
      await product.save({ session });

      updatedStocks.push({ productId: product._id, stock: product.stock });
    }

    // ✅ Step 2: Create order in the same transaction
    const newOrder = new Order({
      email,
      address,
      cartItems,
      totalAmount,
    });

    const savedOrder = await newOrder.save({ session });

    // ✅ Step 3: Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // ✅ Step 4: Emit socket event
    const io = req.app.get('io');
    io.emit('newOrder', {
      _id: savedOrder._id,
      email: savedOrder.email,
      totalAmount: savedOrder.totalAmount,
      createdAt: savedOrder.createdAt,
    });

    // ✅ Step 5: Respond with order + updated stock
    res.status(201).json({
      order: savedOrder,
      updatedStock: updatedStocks, // for syncing with frontend
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Order transaction failed:', error.message);
    res.status(500).json({ message: error.message || 'Failed to place order' });
  }
});
