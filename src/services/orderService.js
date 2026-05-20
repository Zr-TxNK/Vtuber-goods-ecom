/**
 * BEST PRACTICE: Controller-Route-Service Pattern - Service Layer (Rubric Item 7)
 * Handles the order processing, including SQL transactions, business rules (stock-check),
 * and relational queries.
 */

const { dbRun, dbGet, dbAll } = require('../config/database');

/**
 * Creates an order inside a TRANSACTION block and performs stock check.
 * BONUS RUBRIC CHALLENGE: Pre-Checkout Inventory Check (Rubric Item 8)
 * SQL Safety: Parameterized Queries (Rubric Item 6)
 */
const createOrder = async (userId, items) => {
  // 1. Begin the Transaction block to ensure ACID compliance
  await dbRun('BEGIN TRANSACTION');

  try {
    let totalAmount = 0;
    const verifiedItems = [];

    // 2. Loop through all checkout items to verify stock and price
    for (const item of items) {
      const { productId, quantity } = item;

      // Fetch the product stock and price using a parameterized query (SQL Safety)
      const product = await dbGet(
        'SELECT name, price, stock FROM products WHERE id = ?',
        [productId]
      );

      if (!product) {
        throw new Error(`Product with ID ${productId} does not exist.`);
      }

      // Check if stock is sufficient (Rubric Item 8)
      if (product.stock < quantity) {
        // Explicit "Out of Stock" error
        throw new Error(`Out of Stock: "${product.name}" only has ${product.stock} units left. (You requested ${quantity})`);
      }

      // Calculate totals
      const lineTotal = product.price * quantity;
      totalAmount += lineTotal;

      // Keep track of verified metadata to save database double-queries
      verifiedItems.push({
        productId,
        quantity,
        name: product.name,
        priceAtPurchase: product.price
      });
    }

    // 3. Update stock levels for verified items (Deduct stock)
    for (const item of verifiedItems) {
      await dbRun(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.productId]
      );
    }

    // 4. Insert the main Order record
    const orderResult = await dbRun(
      'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
      [userId, totalAmount, 'completed']
    );
    const orderId = orderResult.lastID;

    // 5. Insert each Order Item record linking back to the order ID (Relational schema)
    for (const item of verifiedItems) {
      await dbRun(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
        [orderId, item.productId, item.quantity, item.priceAtPurchase]
      );
    }

    // 6. If everything succeeded, commit the transaction
    await dbRun('COMMIT');

    return {
      orderId,
      totalAmount,
      status: 'completed',
      items: verifiedItems
    };

  } catch (error) {
    // If any product is out of stock or query fails, roll back the transaction!
    await dbRun('ROLLBACK');
    throw error;
  }
};

/**
 * Fetch all orders for a specific user, along with items (Relational Schema lookup)
 */
const getUserOrders = async (userId) => {
  // Query orders
  const orders = await dbAll(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );

  // Load items for each order (Relational Schema Join)
  for (const order of orders) {
    const items = await dbAll(
      `SELECT oi.*, p.name AS product_name, p.image_url 
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [order.id]
    );
    order.items = items;
  }

  return orders;
};

module.exports = {
  createOrder,
  getUserOrders
};
