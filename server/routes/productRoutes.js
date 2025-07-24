const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// ✅ Create Product
router.post('/', async (req, res) => {
  try {
    const {
      name,
      price,
      image,
      featured,
      category,
      stock,
      description,
      extraImages = [], // ✅ added
    } = req.body;

    const product = new Product({
      name,
      price,
      image,
      featured,
      category,
      stock,
      description,
      extraImages, // ✅ added
    });

    const saved = await product.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Create error:', err);
    res.status(500).json({ message: 'Failed to create product' });
  }
});

// ✅ Get All Products or Product by Name
router.get('/', async (req, res) => {
  try {
    const name = req.query.name;

    if (name) {
      const decodedName = decodeURIComponent(name);

      const product = await Product.find({
        name: { $regex: new RegExp(`^${decodedName}$`, 'i') },
      });

      if (!product || product.length === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }

      return res.json(product);
    }

    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch product(s)' });
  }
});

// ✅ Search by Query (partial match)
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const regex = new RegExp(query, 'i');
    const results = await Product.find({ name: regex }).limit(10);
    res.json(results);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// ✅ Update Product by ID
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      price,
      image,
      featured,
      category,
      stock,
      description,
      extraImages = [], // ✅ added
    } = req.body;

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name,
          price,
          image,
          featured,
          category,
          stock,
          description,
          extraImages, // ✅ added
        },
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

// ✅ Delete Product by ID
router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

module.exports = router;
