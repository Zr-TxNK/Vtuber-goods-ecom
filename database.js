/**
 * database.js — In-Memory Placeholder (ไม่มี SQLite)
 *
 * แทนที่ database จริงด้วย JavaScript array ธรรมดา
 * ข้อมูลจะหายเมื่อรีสตาร์ท server (เพราะเก็บใน RAM)
 * เหมาะสำหรับการเรียนรู้และทดสอบ
 */

// ============================================================
//  PLACEHOLDER DATA - seed catalog from the public JSON source
// ============================================================

const productSeed = require('./data/products.json');

// Clone each product because checkout changes stock only in server memory.
let products = productSeed.map(product => ({ ...product }));

let users  = []; // { id, username, email, password_hash, role }
let orders = []; // { id, user_id, total_amount, status, created_at }
let orderItems = []; // { id, order_id, product_id, quantity, price_at_purchase }

// Auto-increment counters
let nextUserId      = 1;
let nextOrderId     = 1;
let nextOrderItemId = 1;

// ============================================================
//  HELPER FUNCTIONS — เลียนแบบ SQLite API เดิม
// ============================================================

/**
 * dbAll — คืนค่า array ของแถวที่ตรงกับ query
 * (placeholder: รองรับ SELECT จาก products, users, orders, order_items)
 */
const dbAll = async (sql, params = []) => {
  // Products
  if (/FROM products/i.test(sql)) {
    let result = [...products];

    if (/WHERE/i.test(sql)) {
      const keyword  = _extractParam(sql, params, 'name LIKE');
      const category = _extractParam(sql, params, 'category =');
      const minPrice = _extractParam(sql, params, 'price >=');
      const maxPrice = _extractParam(sql, params, 'price <=');

      result = result.filter(p => {
        const kw = keyword ? keyword.replace(/%/g, '').toLowerCase() : null;
        if (kw && !p.name.toLowerCase().includes(kw) && !p.description.toLowerCase().includes(kw)) return false;
        if (category && p.category !== category) return false;
        if (minPrice !== null && p.price < parseFloat(minPrice)) return false;
        if (maxPrice !== null && p.price > parseFloat(maxPrice)) return false;
        return true;
      });
    }

    return result;
  }

  // Orders for a user
  if (/FROM orders WHERE user_id/i.test(sql)) {
    const userId = params[0];
    return orders
      .filter(o => o.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // Order items with product name join
  if (/FROM order_items/i.test(sql)) {
    const orderId = params[0];
    return orderItems
      .filter(oi => oi.order_id === orderId)
      .map(oi => {
        const product = products.find(p => p.id === oi.product_id) || {};
        return {
          ...oi,
          product_name: product.name || 'Unknown',
          image_url:    product.image_url || ''
        };
      });
  }

  return [];
};

/**
 * dbGet — คืนค่าแถวเดียว (หรือ undefined)
 */
const dbGet = async (sql, params = []) => {
  // Find user by email
  if (/FROM users WHERE email/i.test(sql)) {
    return users.find(u => u.email === params[0]);
  }

  // Find user by id (SELECT id FROM users)
  if (/SELECT id FROM users/i.test(sql)) {
    return users.find(u => u.email === params[0]);
  }

  // Find product by id
  if (/FROM products WHERE id/i.test(sql)) {
    return products.find(p => p.id === params[0]);
  }

  return undefined;
};

/**
 * dbRun — เลียนแบบ INSERT / UPDATE / TRANSACTION
 * คืน { lastID, changes }
 */
const dbRun = async (sql, params = []) => {
  const sqlUpper = sql.trim().toUpperCase();

  // Transaction stubs — ไม่ทำอะไร (in-memory ไม่ต้องการ)
  if (['BEGIN TRANSACTION', 'COMMIT', 'ROLLBACK'].includes(sqlUpper)) {
    return { lastID: 0, changes: 0 };
  }

  // INSERT INTO users
  if (/INSERT INTO users/i.test(sql)) {
    const [username, email, password_hash] = params;
    const newUser = { id: nextUserId++, username, email, password_hash, role: 'user' };
    users.push(newUser);
    return { lastID: newUser.id, changes: 1 };
  }

  // INSERT INTO orders
  if (/INSERT INTO orders/i.test(sql)) {
    const [user_id, total_amount, status] = params;
    const newOrder = {
      id: nextOrderId++,
      user_id,
      total_amount,
      status,
      created_at: new Date().toISOString()
    };
    orders.push(newOrder);
    return { lastID: newOrder.id, changes: 1 };
  }

  // INSERT INTO order_items
  if (/INSERT INTO order_items/i.test(sql)) {
    const [order_id, product_id, quantity, price_at_purchase] = params;
    const newItem = { id: nextOrderItemId++, order_id, product_id, quantity, price_at_purchase };
    orderItems.push(newItem);
    return { lastID: newItem.id, changes: 1 };
  }

  // UPDATE products SET stock = stock - ?
  if (/UPDATE products SET stock/i.test(sql)) {
    const [qty, productId] = params;
    const product = products.find(p => p.id === productId);
    if (product) {
      product.stock -= qty;
      return { lastID: 0, changes: 1 };
    }
    return { lastID: 0, changes: 0 };
  }

  return { lastID: 0, changes: 0 };
};

/** ฟังก์ชัน helper สำหรับดึงค่า param จาก SQL string (แบบง่าย) */
const _extractParam = (sql, params, condition) => {
  const idx = sql.toLowerCase().indexOf(condition.toLowerCase());
  if (idx === -1) return null;
  // นับจำนวน '?' ก่อน condition นี้
  const before = sql.slice(0, idx);
  const questionsBefore = (before.match(/\?/g) || []).length;
  return params[questionsBefore] !== undefined ? params[questionsBefore] : null;
};

// ไม่ต้องการ initializeDatabase() อีกต่อไป
const initializeDatabase = async () => {
  console.log('✅ In-memory placeholder database ready.');
  console.log(`   📦 Products: ${products.length} รายการ`);
};

module.exports = { dbAll, dbGet, dbRun, initializeDatabase, products, users, orders };
