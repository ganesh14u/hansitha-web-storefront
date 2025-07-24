const express = require('express');
const router = express.Router();
const { saveCheckoutOrder } = require('../controllers/checkoutController');

router.post('/checkout', saveCheckoutOrder);

module.exports = router;
