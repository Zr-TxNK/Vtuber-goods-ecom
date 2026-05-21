/**
 * database.js — In-Memory Placeholder (ไม่มี SQLite)
 *
 * แทนที่ database จริงด้วย JavaScript array ธรรมดา
 * ข้อมูลจะหายเมื่อรีสตาร์ท server (เพราะเก็บใน RAM)
 * เหมาะสำหรับการเรียนรู้และทดสอบ
 */

// ============================================================
//  PLACEHOLDER DATA — สินค้าตัวอย่าง
// ============================================================

let products = [
  { id: 1, name: 'Hololive Acrylic Stand Vol.1',   category: 'Acrylic Stands', price: 24.99, stock: 15, description: 'อะคริลิคสแตนด์ขนาด A5 พิมพ์ลาย 4 สี ความละเอียดสูง มาพร้อมฐานตั้งโต๊ะ',         image_url: 'https://placehold.co/400x400/1a1a3e/a855f7?text=Acrylic+Stand' },
  { id: 2, name: 'Pekora Hoodie Black Edition',     category: 'Apparel',        price: 59.99, stock:  3, description: 'เสื้อฮู้ดดี้สีดำปักลาย Pekora ผ้า cotton 100% น้ำหนักดี ซับในนุ่ม',              image_url: 'https://placehold.co/400x400/1a1a3e/22d3ee?text=Hoodie' },
  { id: 3, name: 'Gura Shark Plushie',              category: 'Plushies',       price: 39.99, stock:  0, description: 'ตุ๊กตาฉลามน้อย Gura ขนาด 30 cm ผ้านุ่มไม่ระคายเคืองผิว เหมาะสำหรับตกแต่ง',     image_url: 'https://placehold.co/400x400/1a1a3e/f43f5e?text=Plushie' },
  { id: 4, name: 'Mumei Keychain Set',              category: 'Keychains',      price: 14.99, stock: 50, description: 'พวงกุญแจอะคริลิค Mumei เซต 3 ชิ้น ลายน่ารัก ขนาด 5 cm เคลือบ UV กันซีด',       image_url: 'https://placehold.co/400x400/1a1a3e/10b981?text=Keychain' },
  { id: 5, name: 'Suisei Stellar Stellar Vinyl',    category: 'Music',          price: 34.99, stock:  8, description: 'แผ่น Vinyl เพลง Stellar Stellar ของ Suisei ขนาด 12 นิ้ว พิมพ์ปก Full Art',     image_url: 'https://placehold.co/400x400/1a1a3e/f59e0b?text=Vinyl' },
  { id: 6, name: 'Marine Anniversary Mug',          category: 'Mugs',           price: 19.99, stock: 22, description: 'แก้วมัคเซรามิก 350ml ลาย Marine ครบรอบ 3 ปี เปลี่ยนสีตอนใส่น้ำร้อน',            image_url: 'https://placehold.co/400x400/1a1a3e/a855f7?text=Mug' },
  { id: 7, name: 'Korone Doggo Plushie XL',         category: 'Plushies',       price: 54.99, stock:  4, description: 'ตุ๊กตาสุนัขน้อย Korone รุ่น XL ขนาด 50 cm ผ้าขนนุ่มเด้ง สีเหลืองสดใส',        image_url: 'https://placehold.co/400x400/1a1a3e/f59e0b?text=Korone+XL' },
  { id: 8, name: 'Aqua Idol Outfit Acrylic',        category: 'Acrylic Stands', price: 29.99, stock: 12, description: 'อะคริลิคลาย Aqua ชุด Idol ขนาด B5 พิมพ์สีสดใส กระดาษหนา 5 มม.',               image_url: 'https://placehold.co/400x400/1a1a3e/22d3ee?text=Aqua+Stand' },
  { id: 9, name: 'Kronii Oversized T-Shirt',        category: 'Apparel',        price: 44.99, stock:  7, description: 'เสื้อยืด Oversized ลาย Kronii สีขาวพิมพ์ลายนาฬิกา ผ้า cotton combed 32s',     image_url: 'https://placehold.co/400x400/1a1a3e/a855f7?text=T-Shirt' },
  { id: 10, name: 'IRyS IRyStocrat Album CD',       category: 'Music',          price: 27.99, stock: 16, description: 'แผ่น CD อัลบั้ม EP แรกของ IRyS มาพร้อม Photobook 24 หน้า และการ์ดลายเซ็น',   image_url: 'https://placehold.co/400x400/1a1a3e/10b981?text=CD+Album' },
  { id: 11, name: 'Fubuki Winter Keychain',         category: 'Keychains',      price:  9.99, stock: 35, description: 'พวงกุญแจ Fubuki ชุดฤดูหนาว อะคริลิคใส สาย PU ยาว 10 cm พร้อมกระดิ่งจิ๋ว',    image_url: 'https://placehold.co/400x400/1a1a3e/22d3ee?text=FBK+Key' },
  { id: 12, name: 'Miko Sakura Gradient Mug',       category: 'Mugs',           price: 22.99, stock: 18, description: 'แก้วมัค Miko ลาย Sakura Gradient 400ml พิมพ์ทั้งสองด้าน ล้างเครื่องได้',       image_url: 'https://placehold.co/400x400/1a1a3e/f43f5e?text=Miko+Mug' },
];

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
