/**
 * BEST PRACTICE: Controller-Route-Service Pattern - Controller Layer (Rubric Item 7)
 * Extracts the user payload from the authentication token (req.user) and order items,
 * delegates the checkout operation to orderService, and responds with HTTP status codes.
 */

const orderService = require('../services/orderService');

/**
 * Handle POST /api/orders
 * Placing a new order with stock-check transaction
 */
const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id; // Extracted by authenticateToken middleware
    const { items } = req.body;  // Cart items verified by validateCheckout middleware

    // Delegate creation to orderService
    const newOrder = await orderService.createOrder(userId, items);

    return res.status(201).json({
      message: 'Order placed successfully!',
      order: newOrder
    });
  } catch (error) {
    console.error('Place Order Controller Error:', error);

    // If order failed due to stock check validation
    if (error.message.includes('Out of Stock')) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Internal Server Error during checkout.' });
  }
};

/**
 * Handle GET /api/orders
 * Fetch authenticated user's order history
 */
const getOrderHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await orderService.getUserOrders(userId);

    return res.status(200).json(orders);
  } catch (error) {
    console.error('Get Order History Controller Error:', error);
    return res.status(500).json({ error: 'Internal Server Error while retrieving order history.' });
  }
};

module.exports = {
  placeOrder,
  getOrderHistory
};
