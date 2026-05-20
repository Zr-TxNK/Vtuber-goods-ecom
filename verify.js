/**
 * BEST PRACTICE: Automated Verification Script
 * This file verifies the correctness of the database, services, and business rules.
 */

const { initializeDatabase, dbGet } = require('./src/config/database');
const authService = require('./src/services/authService');
const productService = require('./src/services/productService');
const orderService = require('./src/services/orderService');

const logHeader = (msg) => console.log(`\n=== 🧪 TEST: ${msg} ===`);
const logSuccess = (msg) => console.log(`  ✅ SUCCESS: ${msg}`);
const logFail = (msg) => console.error(`  ❌ FAILED: ${msg}`);

async function runTests() {
  console.log('🏁 Starting automated service verification tests...');
  
  await initializeDatabase();

  const timestamp = Date.now();
  const testEmail = `tako_${timestamp}@kfp.com`;
  const testUsername = `Tako_${timestamp}`;
  const testPassword = 'superSecurePassword123';
  let userId;
  let jwtToken;

  try {
    // ----------------------------------------------------
    // TEST 1: User Registration
    // ----------------------------------------------------
    logHeader('User Registration (bcryptjs Hashing)');
    const regResult = await authService.registerUser(testUsername, testEmail, testPassword);
    userId = regResult.id;
    
    if (userId) {
      logSuccess(`Registered user "${testUsername}" with ID ${userId}.`);
      
      const dbUser = await dbGet('SELECT password_hash FROM users WHERE id = ?', [userId]);
      if (dbUser && dbUser.password_hash.startsWith('$2a$')) {
        logSuccess('Confirmed password is encrypted using bcrypt hash starting with $2a$ format.');
      } else {
        throw new Error('Password hash does not seem to be a valid bcrypt signature!');
      }
    } else {
      throw new Error('Registration did not return a valid user ID.');
    }

    // ----------------------------------------------------
    // TEST 2: User Login & JWT Generation
    // ----------------------------------------------------
    logHeader('User Login (JWT Stateless Session generation)');
    const loginResult = await authService.loginUser(testEmail, testPassword);
    jwtToken = loginResult.token;

    if (jwtToken && loginResult.user.email === testEmail) {
      logSuccess(`Logged in successfully. Issued JWT token (length: ${jwtToken.length}).`);
    } else {
      throw new Error('Login failed. JWT was not returned.');
    }

    // ----------------------------------------------------
    // TEST 3: Product Listing and Filtering
    // ----------------------------------------------------
    logHeader('Interactive Product Search Filters');
    
    const allProds = await productService.getAllProducts();
    logSuccess(`Fetched all products. Total items in catalog: ${allProds.length}`);

    const keywordProds = await productService.getAllProducts({ keyword: 'gura' });
    if (keywordProds.length > 0 && keywordProds[0].name.toLowerCase().includes('gura')) {
      logSuccess(`Keyword search filtering for 'gura' returned: "${keywordProds[0].name}"`);
    } else {
      throw new Error('Keyword filter test failed.');
    }

    const apparelProds = await productService.getAllProducts({ category: 'Apparel' });
    if (apparelProds.length > 0 && apparelProds.every(p => p.category === 'Apparel')) {
      logSuccess(`Category filter for 'Apparel' returned: ${apparelProds.length} item(s).`);
    } else {
      throw new Error('Category filter test failed.');
    }

    const priceProds = await productService.getAllProducts({ minPrice: 10, maxPrice: 20 });
    if (priceProds.length > 0 && priceProds.every(p => p.price >= 10 && p.price <= 20)) {
      logSuccess(`Price range filter ($10 to $20) returned: ${priceProds.length} item(s).`);
    } else {
      throw new Error('Price filter test failed.');
    }

    // ----------------------------------------------------
    // TEST 4: Checkout Order with Valid Stock
    // ----------------------------------------------------
    logHeader('Checkout - Transaction with Valid Stock');
    
    const targetProd = await productService.getProductById(1);
    const initialStock = targetProd.stock;
    const purchaseQty = 2;

    logSuccess(`Product: "${targetProd.name}" | Initial Stock: ${initialStock}`);

    const orderItems = [{ productId: 1, quantity: purchaseQty }];
    const orderResult = await orderService.createOrder(userId, orderItems);

    logSuccess(`Order #${orderResult.orderId} created successfully. Total: $${orderResult.totalAmount.toFixed(2)}`);

    const postOrderProd = await productService.getProductById(1);
    logSuccess(`Product post-checkout stock: ${postOrderProd.stock}`);
    
    if (postOrderProd.stock === initialStock - purchaseQty) {
      logSuccess('Stock correctly decremented in database.');
    } else {
      throw new Error(`Inventory mismatch: Expected ${initialStock - purchaseQty}, got ${postOrderProd.stock}`);
    }

    // ----------------------------------------------------
    // TEST 5: Checkout Order Exceeding Stock (Rollback verification)
    // ----------------------------------------------------
    logHeader('Checkout - Transaction ROLLBACK on Stock Exhaustion (Bonus Challenge)');

    const outOfStockProd = await productService.getProductById(6);
    logSuccess(`Product: "${outOfStockProd.name}" | Current Stock: ${outOfStockProd.stock}`);

    const initialOrders = await dbGet('SELECT COUNT(*) AS count FROM orders');
    
    try {
      logSuccess(`Attempting to checkout 1 unit of "${outOfStockProd.name}"...`);
      await orderService.createOrder(userId, [{ productId: 6, quantity: 1 }]);
      throw new Error('Order succeeded when it should have failed out-of-stock check!');
    } catch (err) {
      if (err.message.includes('Out of Stock')) {
        logSuccess(`Rejected checkout as expected with error: "${err.message}"`);
      } else {
        throw err;
      }
    }

    const finalOrders = await dbGet('SELECT COUNT(*) AS count FROM orders');
    if (initialOrders.count === finalOrders.count) {
      logSuccess('Verified: SQL Transaction ROLLBACK successfully prevented database order entry creation.');
    } else {
      throw new Error('Database integrity violated! Order entry created despite out-of-stock rollback.');
    }

    const finalStockProd = await productService.getProductById(6);
    if (finalStockProd.stock === 0) {
      logSuccess('Verified: Product stock levels remained untouched.');
    } else {
      throw new Error('Database integrity violated! Stock level updated.');
    }

    // ----------------------------------------------------
    // TEST 6: User Order History
    // ----------------------------------------------------
    logHeader('User Order History (Relational Joins)');
    const history = await orderService.getUserOrders(userId);
    
    if (history.length > 0) {
      logSuccess(`Retrieved history: Found ${history.length} order(s) for User ID ${userId}.`);
      logSuccess(`First order contains: ${history[0].items.map(i => `${i.product_name} (x${i.quantity})`).join(', ')}`);
    } else {
      throw new Error('Order history retrieval failed.');
    }

    console.log('\n🌟 SUCCESS: All architectural service tests passed successfully! 🌟\n');
    process.exit(0);

  } catch (error) {
    logFail(`Service integration tests failed! Reason: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

runTests();
