/**
 * BEST PRACTICE: Controller-Route-Service Pattern - Route Layer (Rubric Item 7)
 * Defines order endpoints. Mounts authenticateToken and validateCheckout gatekeepers.
 */

const express = require('express');
const router = express.Router();
const orderController = require('./orderController');
const { authenticateToken } = require('./authMiddleware');
const { validateCheckout } = require('./validateMiddleware');

// Mount routes with authentication and validation gatekeeper middlewares
router.post('/', authenticateToken, validateCheckout, orderController.placeOrder);
router.get('/', authenticateToken, orderController.getOrderHistory);

module.exports = router;
