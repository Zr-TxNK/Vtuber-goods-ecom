/**
 * VTuber Merch Hub - app.js
 *
 * Product catalog data flow:
 *   initApp() -> requestProducts() -> fetch(data/products.json) -> renderUI()
 *
 * เมื่อใช้ backend เต็มรูปแบบ requestProducts() จะอ่าน /api/products แทน เพื่อให้
 * stock ที่ถูกตัดหลัง checkout แสดงผลล่าสุด ข้อมูลเริ่มต้นของทั้งสองโหมดมาจาก
 * data/products.json ชุดเดียวกัน
 */

// ============================================================
// ⚙️  CONFIG — เปลี่ยนตรงนี้!
// ============================================================

// true  = โหลด catalog JSON ผ่าน Live Server และจำลอง auth/checkout
// false = โหลด catalog และดำเนินรายการผ่าน Express backend (node server.js)
const USE_MOCK_DATA = true;
const PRODUCTS_JSON_PATH = './data/products.json';

// ============================================================
// 🗃️  GLOBAL STATE
// ============================================================

let cartState    = [];  // สินค้าในตะกร้า
let userToken    = null;
let currentUser  = null;
let allProducts  = []; // ข้อมูล catalog ล่าสุดจาก JSON หรือ API สำหรับ filter ฝั่ง client

// ============================================================
// 🔗  DOM REFERENCES — แคช element ที่ใช้บ่อย
// ============================================================

const DOM = {
  productsGrid:    document.getElementById('products-grid'),
  searchInput:     document.getElementById('search-input'),
  categoryFilter:  document.getElementById('category-filter'),
  minPriceFilter:  document.getElementById('min-price-filter'),
  maxPriceFilter:  document.getElementById('max-price-filter'),
  sortFilter:      document.getElementById('sort-filter'),
  clearFiltersBtn: document.getElementById('clear-filters-btn'),
  resultsCount:    document.getElementById('results-count'),

  // Auth
  authNavGuest:  document.getElementById('auth-nav-guest'),
  authNavUser:   document.getElementById('auth-nav-user'),
  userGreeting:  document.getElementById('user-greeting'),
  navLoginBtn:   document.getElementById('nav-login-btn'),
  navRegisterBtn:document.getElementById('nav-register-btn'),
  navLogoutBtn:  document.getElementById('nav-logout-btn'),
  navOrdersBtn:  document.getElementById('nav-orders-btn'),
  navLogo:       document.getElementById('nav-logo'),
  heroBrowseBtn: document.getElementById('hero-browse-btn'),

  // Modals & Drawer
  loginModal:       document.getElementById('login-modal'),
  registerModal:    document.getElementById('register-modal'),
  cartDrawer:       document.getElementById('cart-drawer'),
  navCartBtn:       document.getElementById('nav-cart-btn'),
  cartBadge:        document.getElementById('cart-badge'),
  cartDrawerItems:  document.getElementById('cart-drawer-items'),
  cartSubtotal:     document.getElementById('cart-subtotal'),
  checkoutBtn:      document.getElementById('checkout-btn'),
  closeLoginBtn:    document.getElementById('close-login-btn'),
  closeRegisterBtn: document.getElementById('close-register-btn'),
  closeCartBtn:     document.getElementById('close-cart-btn'),

  // Forms
  loginForm:     document.getElementById('login-form'),
  registerForm:  document.getElementById('register-form'),
  switchRegister:document.getElementById('switch-to-register'),
  switchLogin:   document.getElementById('switch-to-login'),

  // Sections
  catalogSection:   document.getElementById('catalog-section'),
  profileSection:   document.getElementById('profile-section'),
  orderHistoryList: document.getElementById('order-history-list'),
  backToCatalogBtn: document.getElementById('back-to-catalog-btn'),
  toastContainer:   document.getElementById('toast-container'),
};

// ============================================================
// 💧  STATE HYDRATION — โหลดข้อมูลจาก localStorage
// ============================================================

function hydrateState() {
  // โหลด auth
  const storedToken = localStorage.getItem('token');
  const storedUser  = localStorage.getItem('user');

  if (storedToken && storedUser) {
    userToken = storedToken;
    try {
      currentUser = JSON.parse(storedUser);
      updateAuthUI(true);
    } catch (e) {
      clearAuthSession();
    }
  } else {
    updateAuthUI(false);
  }

  // โหลดตะกร้า
  const storedCart = localStorage.getItem('cart');
  if (storedCart) {
    try {
      cartState = JSON.parse(storedCart);
      if (!Array.isArray(cartState)) cartState = [];
      // กรอง item ที่ข้อมูลไม่ครบออก (ป้องกัน data เก่าเสีย)
      cartState = cartState.filter(i =>
        i && typeof i.price === 'number' && typeof i.quantity === 'number' && i.name && i.productId != null
      );
    } catch (e) {
      cartState = [];
      localStorage.removeItem('cart');
    }
  }

  updateCartUI();
}

function persistCartState() {
  localStorage.setItem('cart', JSON.stringify(cartState));
}

// ============================================================
// 🔍  SEARCH & FILTER
// ============================================================

// Debounce — ป้องกัน call ถี่เกินไปตอนพิมพ์
function debounce(fn, ms) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

DOM.searchInput.addEventListener('input', debounce(renderFilteredProducts, 300));

// ============================================================
// 🖱️  EVENT DELEGATION — จับ click "Add to Cart" ทั้ง grid
// ============================================================

DOM.productsGrid.addEventListener('click', (event) => {
  const btn = event.target.closest('.add-to-cart-btn');
  if (!btn) return;

  const { productId, productName, productPrice, productStock, productImage } = btn.dataset;
  addToCart(
    parseInt(productId),
    productName,
    parseFloat(productPrice),
    parseInt(productStock),
    productImage
  );
});

// ============================================================
// 🛍️  SHOPPING CART OPERATIONS
// ============================================================

function addToCart(productId, name, price, stock, imageUrl) {
  if (stock <= 0) {
    showToast(`"${name}" หมดสต็อกแล้ว`, 'error');
    return;
  }

  const idx = cartState.findIndex(i => i.productId === productId);

  if (idx > -1) {
    const newQty = cartState[idx].quantity + 1;
    if (newQty > stock) {
      showToast(`เพิ่มไม่ได้แล้ว — มีแค่ ${stock} ชิ้นในสต็อก`, 'error');
      return;
    }
    cartState[idx].quantity = newQty;
  } else {
    cartState.push({ productId, name, price, quantity: 1, stock, imageUrl });
  }

  persistCartState();
  updateCartUI();
  showToast(`เพิ่ม "${name}" เข้าตะกร้าแล้ว!`, 'success');
}

function updateItemQuantity(productId, delta) {
  const idx = cartState.findIndex(i => i.productId === productId);
  if (idx === -1) return;

  const item    = cartState[idx];
  const nextQty = item.quantity + delta;

  if (nextQty <= 0) {
    cartState.splice(idx, 1);
    showToast(`ลบ "${item.name}" ออกจากตะกร้าแล้ว`, 'success');
  } else if (nextQty > item.stock) {
    showToast(`มีแค่ ${item.stock} ชิ้นในสต็อก`, 'error');
  } else {
    item.quantity = nextQty;
  }

  persistCartState();
  updateCartUI();
}

function removeCartItem(productId) {
  const idx = cartState.findIndex(i => i.productId === productId);
  if (idx > -1) {
    const name = cartState[idx].name;
    cartState.splice(idx, 1);
    persistCartState();
    updateCartUI();
    showToast(`ลบ "${name}" ออกแล้ว`, 'success');
  }
}

function updateCartUI() {
  const totalItems = cartState.reduce((sum, i) => sum + i.quantity, 0);
  DOM.cartBadge.textContent = totalItems;
  DOM.cartDrawerItems.innerHTML = '';

  if (cartState.length === 0) {
    DOM.cartDrawerItems.innerHTML = '<div class="empty-cart-message">ตะกร้าของคุณว่างอยู่</div>';
    DOM.cartSubtotal.textContent = '$0.00';
    return;
  }

  let subtotal = 0;
  cartState.forEach(item => {
    subtotal += item.price * item.quantity;
    DOM.cartDrawerItems.insertAdjacentHTML('beforeend', `
      <div class="cart-item">
        <img src="${item.imageUrl}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">$${item.price.toFixed(2)}</div>
          <div class="cart-item-actions">
            <div class="quantity-controller">
              <button class="quantity-btn" onclick="updateItemQuantity(${item.productId}, -1)">−</button>
              <span class="quantity-value">${item.quantity}</span>
              <button class="quantity-btn" onclick="updateItemQuantity(${item.productId}, 1)">+</button>
            </div>
            <button class="remove-item-btn" onclick="removeCartItem(${item.productId})">ลบ</button>
          </div>
        </div>
      </div>
    `);
  });

  DOM.cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
}

// ต้องเป็น global เพราะถูกเรียกจาก innerHTML onclick
window.updateItemQuantity = updateItemQuantity;
window.removeCartItem     = removeCartItem;

// ============================================================
// 📡  REQUEST PRODUCTS AND RENDER CATALOG
// ============================================================

/**
 * ขอข้อมูล catalog จาก data source แล้วส่งต่อไปแสดงผล
 *
 * Data flow ในโหมด Live Server:
 *   requestProducts() -> fetch('./data/products.json')
 *   -> response.json() -> allProducts -> renderFilteredProducts() -> renderUI()
 *
 * โหมด backend ใช้ API แทนไฟล์ JSON เพื่อให้ stock หลัง checkout เป็นค่าล่าสุด
 * โดย backend เริ่มต้นข้อมูลจาก products.json ชุดเดียวกัน
 */
async function requestProducts() {
  DOM.resultsCount.textContent = 'กำลังโหลดสินค้า...';

  try {
    const response = USE_MOCK_DATA
      ? await fetch(PRODUCTS_JSON_PATH)
      : await fetch('/api/products');

    if (!response.ok) {
      throw new Error(`Product request failed (${response.status})`);
    }

    // แปลง response body จาก JSON text เป็น array ของ product objects
    const products = await response.json();
    if (!Array.isArray(products) || !products.every(isValidProduct)) {
      throw new Error('Product data format is invalid');
    }

    // เก็บข้อมูลต้นฉบับไว้หนึ่งชุด; การค้นหาครั้งถัดไปไม่ต้อง request ใหม่
    allProducts = products;
    renderFilteredProducts();
  } catch (err) {
    console.error('requestProducts error:', err);
    allProducts = [];
    DOM.productsGrid.innerHTML = '';
    DOM.resultsCount.textContent = 'โหลดสินค้าไม่สำเร็จ';
    showToast('โหลดสินค้าไม่ได้ กรุณาตรวจไฟล์ข้อมูลหรือ server', 'error');
  }
}

/** ตรวจ contract ที่ product card และ cart จำเป็นต้องใช้งานก่อน render */
function isValidProduct(product) {
  return product &&
    Number.isInteger(product.id) &&
    typeof product.name === 'string' &&
    typeof product.category === 'string' &&
    Number.isFinite(product.price) &&
    Number.isInteger(product.stock) &&
    typeof product.description === 'string' &&
    typeof product.image_url === 'string';
}

/**
 * กรอง source-of-truth (`allProducts`) ตาม intent ของผู้ใช้
 * ฟังก์ชันนี้ไม่อ่านหรือแก้ DOM จึงเรียกซ้ำและทดสอบ business logic ได้ง่าย
 */
function filterProducts(searchTerm, category) {
  const normalizedTerm = searchTerm.trim().toLowerCase();

  return allProducts.filter(product => {
    // `.includes()` ค้นแบบ literal จึงรองรับคำค้นอย่าง @ หรือ # โดยไม่เกิด error
    const matchesName = !normalizedTerm ||
      product.name.toLowerCase().includes(normalizedTerm);
    const matchesCategory = category === 'All' ||
      product.category === category;

    return matchesName && matchesCategory;
  });
}

/** คง price-range feature เดิมไว้ แยกจาก search/category logic ของกิจกรรม */
function filterProductsByPrice(products, minPriceValue, maxPriceValue) {
  const minPrice = Number.parseFloat(minPriceValue);
  const maxPrice = Number.parseFloat(maxPriceValue);

  return products.filter(product => {
    const matchesMin = Number.isNaN(minPrice) || product.price >= minPrice;
    const matchesMax = Number.isNaN(maxPrice) || product.price <= maxPrice;
    return matchesMin && matchesMax;
  });
}

/** คืน array ใหม่ที่เรียงราคา โดยไม่เปลี่ยนลำดับของ source-of-truth */
function sortProducts(products, sortOrder) {
  const sortedProducts = [...products];

  if (sortOrder === 'price-desc') {
    return sortedProducts.sort((a, b) => b.price - a.price);
  }
  if (sortOrder === 'price-asc') {
    return sortedProducts.sort((a, b) => a.price - b.price);
  }

  return sortedProducts;
}

/**
 * Consumer ของ DOM events: จับค่าจาก controls -> ประมวลผล array -> render DOM ใหม่
 * Flow นี้ตรงกับกิจกรรม User Action -> Capture Input -> Filter Array -> Update DOM
 */
function renderFilteredProducts() {
  const productsByIntent = filterProducts(
    DOM.searchInput.value,
    DOM.categoryFilter.value
  );
  const productsInPriceRange = filterProductsByPrice(
    productsByIntent,
    DOM.minPriceFilter.value,
    DOM.maxPriceFilter.value
  );
  const visibleProducts = sortProducts(
    productsInPriceRange,
    DOM.sortFilter.value
  );

  renderUI(visibleProducts);
}

// ============================================================
// 🃏  RENDER PRODUCTS
// ============================================================

/**
 * รับ product array แล้วสร้าง HTML card ให้ #products-grid
 * ฟังก์ชันนี้ไม่ fetch ข้อมูลเอง จึงมีหน้าที่เดียวคือแปลง state เป็น UI
 */
function renderUI(products) {
  DOM.productsGrid.innerHTML = '';
  DOM.resultsCount.textContent = `พบ ${products.length} รายการ`;

  if (products.length === 0) {
    DOM.productsGrid.innerHTML = `
      <div class="empty-state">
        <span class="empty-state-icon">🛍️</span>
        <p>ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
      </div>`;
    return;
  }

  products.forEach(prod => {
    let badge = '';
    if (prod.stock <= 0)      badge = '<span class="product-badge badge-out-of-stock">หมดสต็อก</span>';
    else if (prod.stock < 5)  badge = `<span class="product-badge badge-limited">เหลือ ${prod.stock} ชิ้น</span>`;
    else                      badge = '<span class="product-badge badge-in-stock">มีสินค้า</span>';

    DOM.productsGrid.insertAdjacentHTML('beforeend', `
      <article class="product-card">
        <div class="product-image-container">
          <img src="${prod.image_url}" alt="${prod.name}" class="product-image" loading="lazy">
          ${badge}
        </div>
        <div class="product-content">
          <span class="product-category">${prod.category}</span>
          <h3 class="product-name">${prod.name}</h3>
          <p class="product-description">${prod.description || ''}</p>
          <div class="product-footer">
            <span class="product-price">$${prod.price.toFixed(2)}</span>
            <button
              class="btn btn-primary add-to-cart-btn"
              ${prod.stock <= 0 ? 'disabled' : ''}
              data-product-id="${prod.id}"
              data-product-name="${prod.name}"
              data-product-price="${prod.price}"
              data-product-stock="${prod.stock}"
              data-product-image="${prod.image_url}"
            >
              ${prod.stock <= 0 ? 'หมดแล้ว' : 'เพิ่มลงตะกร้า'}
            </button>
          </div>
        </div>
      </article>
    `);
  });
}

// ============================================================
// 💳  CHECKOUT
// ============================================================

async function checkout() {
  if (!userToken) {
    showToast('กรุณาเข้าสู่ระบบก่อนสั่งซื้อ', 'error');
    openModal(DOM.loginModal);
    return;
  }
  if (cartState.length === 0) {
    showToast('ตะกร้าของคุณว่างอยู่', 'error');
    return;
  }

  if (USE_MOCK_DATA) {
    // Mock checkout — จำลองว่า order สำเร็จ
    showToast('สั่งซื้อสำเร็จ! (โหมดทดลอง)', 'success');
    cartState = [];
    persistCartState();
    updateCartUI();
    closeDrawer(DOM.cartDrawer);
    return;
  }

  // Real checkout ผ่าน API
  DOM.checkoutBtn.disabled = true;
  DOM.checkoutBtn.textContent = 'กำลังดำเนินการ...';

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        items: cartState.map(i => ({ productId: i.productId, quantity: i.quantity }))
      }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Checkout ล้มเหลว');

    showToast('สั่งซื้อสำเร็จ! ขอบคุณมาก 🎉', 'success');
    cartState = [];
    persistCartState();
    updateCartUI();
    closeDrawer(DOM.cartDrawer);
    await requestProducts();
    viewOrderHistory();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    DOM.checkoutBtn.disabled = false;
    DOM.checkoutBtn.textContent = 'ดำเนินการชำระเงิน';
  }
}

// ============================================================
// 📜  ORDER HISTORY
// ============================================================

async function viewOrderHistory() {
  DOM.catalogSection.style.display = 'none';
  DOM.profileSection.classList.add('active');

  if (!userToken) {
    DOM.orderHistoryList.innerHTML = '<div style="color:var(--text-muted);padding:2rem;text-align:center;">กรุณาเข้าสู่ระบบเพื่อดูประวัติคำสั่งซื้อ</div>';
    return;
  }

  if (USE_MOCK_DATA) {
    DOM.orderHistoryList.innerHTML = '<div style="color:var(--text-muted);padding:2rem;text-align:center;">📦 ยังไม่มีคำสั่งซื้อในโหมดทดลอง</div>';
    return;
  }

  DOM.orderHistoryList.innerHTML = '<div style="color:var(--text-muted)">กำลังโหลด...</div>';
  try {
    const res = await fetch('/api/orders', {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    if (!res.ok) throw new Error('โหลดประวัติไม่สำเร็จ');
    const orders = await res.json();
    renderOrderHistory(orders);
  } catch (err) {
    DOM.orderHistoryList.innerHTML = `<div style="color:var(--color-accent)">${err.message}</div>`;
  }
}

function renderOrderHistory(orders) {
  DOM.orderHistoryList.innerHTML = '';
  if (orders.length === 0) {
    DOM.orderHistoryList.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-muted)">ยังไม่มีคำสั่งซื้อ</div>';
    return;
  }

  orders.forEach(order => {
    const date = new Date(order.created_at).toLocaleString('th-TH');
    let itemsHTML = order.items.map(item => `
      <div class="order-card-item">
        <span>${item.product_name} (x${item.quantity})</span>
        <span>$${(item.price_at_purchase * item.quantity).toFixed(2)}</span>
      </div>
    `).join('');

    DOM.orderHistoryList.insertAdjacentHTML('beforeend', `
      <div class="order-card">
        <div class="order-card-header">
          <span>คำสั่งซื้อ #${order.id} | ${date}</span>
          <span class="order-card-status status-completed">${order.status}</span>
        </div>
        ${itemsHTML}
        <div class="order-card-total">
          <span>รวมทั้งหมด:</span>
          <span>$${order.total_amount.toFixed(2)}</span>
        </div>
      </div>
    `);
  });
}

function backToCatalog() {
  DOM.profileSection.classList.remove('active');
  DOM.catalogSection.style.display = 'grid';
  renderFilteredProducts();
}

// ============================================================
// 🔐  AUTHENTICATION
// ============================================================

async function handleLogin(event) {
  event.preventDefault();

  const email    = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  if (USE_MOCK_DATA) {
    // Mock login — รับ email/password ใดก็ได้
    const mockUser = { username: email.split('@')[0], email };
    userToken    = 'mock-token-' + Date.now();
    currentUser  = mockUser;
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(currentUser));
    updateAuthUI(true);
    closeModal(DOM.loginModal);
    showToast(`ยินดีต้อนรับ ${currentUser.username}! (โหมดทดลอง)`, 'success');
    DOM.loginForm.reset();
    return;
  }

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Login ล้มเหลว');

    userToken   = result.token;
    currentUser = result.user;
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(currentUser));
    updateAuthUI(true);
    closeModal(DOM.loginModal);
    showToast(`ยินดีต้อนรับ ${currentUser.username}!`, 'success');
    DOM.loginForm.reset();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleRegister(event) {
  event.preventDefault();

  const username = document.getElementById('register-username').value;
  const email    = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  if (USE_MOCK_DATA) {
    showToast('สมัครสมาชิกสำเร็จ! (โหมดทดลอง) — ลอง Login ได้เลย', 'success');
    closeModal(DOM.registerModal);
    openModal(DOM.loginModal);
    DOM.registerForm.reset();
    return;
  }

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Registration ล้มเหลว');

    showToast('สมัครสมาชิกสำเร็จ! กรุณา Login', 'success');
    closeModal(DOM.registerModal);
    openModal(DOM.loginModal);
    DOM.registerForm.reset();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function clearAuthSession() {
  userToken   = null;
  currentUser = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  updateAuthUI(false);
  backToCatalog();
  showToast('ออกจากระบบแล้ว', 'success');
}

function updateAuthUI(isLoggedIn) {
  if (isLoggedIn && currentUser) {
    DOM.authNavGuest.style.display = 'none';
    DOM.authNavUser.style.display  = 'flex';
    DOM.userGreeting.textContent   = `สวัสดี, ${currentUser.username}`;
  } else {
    DOM.authNavGuest.style.display = 'flex';
    DOM.authNavUser.style.display  = 'none';
    DOM.userGreeting.textContent   = '';
  }
}

// ============================================================
// 🔔  TOAST NOTIFICATIONS
// ============================================================

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');

  const icons = { success: '✓', error: '✕' };
  toast.innerHTML = `<span style="font-weight:900;font-size:1rem">${icons[type] || '!'}</span><span>${message}</span>`;

  DOM.toastContainer.appendChild(toast);
  toast.getBoundingClientRect(); // force reflow
  setTimeout(() => toast.classList.add('active'), 20);
  setTimeout(() => {
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 450);
  }, 4000);
}

// ============================================================
// 🪟  MODAL / DRAWER HELPERS
// ============================================================

function openModal(modal)  { modal.classList.add('active');    modal.setAttribute('aria-hidden', 'false'); }
function closeModal(modal) { modal.classList.remove('active'); modal.setAttribute('aria-hidden', 'true');  }
function openDrawer(d)     { d.classList.add('active');        d.setAttribute('aria-hidden', 'false'); }
function closeDrawer(d)    { d.classList.remove('active');     d.setAttribute('aria-hidden', 'true');  }

// ============================================================
// 🎛️  EVENT BINDINGS
// ============================================================

DOM.navLoginBtn.addEventListener('click',    () => openModal(DOM.loginModal));
DOM.navRegisterBtn.addEventListener('click', () => openModal(DOM.registerModal));
DOM.navCartBtn.addEventListener('click',     () => openDrawer(DOM.cartDrawer));

DOM.closeLoginBtn.addEventListener('click',    () => closeModal(DOM.loginModal));
DOM.closeRegisterBtn.addEventListener('click', () => closeModal(DOM.registerModal));
DOM.closeCartBtn.addEventListener('click',     () => closeDrawer(DOM.cartDrawer));

DOM.switchRegister.addEventListener('click', () => { closeModal(DOM.loginModal);    openModal(DOM.registerModal); });
DOM.switchLogin.addEventListener('click',    () => { closeModal(DOM.registerModal); openModal(DOM.loginModal); });

// คลิก overlay เพื่อปิด modal
window.addEventListener('click', e => {
  if (e.target === DOM.loginModal)    closeModal(DOM.loginModal);
  if (e.target === DOM.registerModal) closeModal(DOM.registerModal);
  if (e.target === DOM.cartDrawer)    closeDrawer(DOM.cartDrawer);
});

DOM.loginForm.addEventListener('submit',   handleLogin);
DOM.registerForm.addEventListener('submit', handleRegister);
DOM.navLogoutBtn.addEventListener('click',  clearAuthSession);

DOM.categoryFilter.addEventListener('change', renderFilteredProducts);
DOM.minPriceFilter.addEventListener('change', renderFilteredProducts);
DOM.maxPriceFilter.addEventListener('change', renderFilteredProducts);
DOM.sortFilter.addEventListener('change', renderFilteredProducts);
DOM.clearFiltersBtn.addEventListener('click', () => {
  DOM.categoryFilter.value  = 'All';
  DOM.minPriceFilter.value  = '';
  DOM.maxPriceFilter.value  = '';
  DOM.sortFilter.value      = 'default';
  DOM.searchInput.value     = '';
  renderFilteredProducts();
});

DOM.navLogo.addEventListener('click',       backToCatalog);
DOM.heroBrowseBtn.addEventListener('click', () => DOM.catalogSection.scrollIntoView({ behavior: 'smooth' }));
DOM.navOrdersBtn.addEventListener('click',  viewOrderHistory);
DOM.backToCatalogBtn.addEventListener('click', backToCatalog);
DOM.checkoutBtn.addEventListener('click',   checkout);

// ============================================================
// 🚀  INIT — เริ่มต้นเมื่อหน้าโหลดเสร็จ
// ============================================================

function initApp() {
  hydrateState();
  // Data flow starts here: request the product source, then render cards in renderUI().
  requestProducts();

  // Navbar scroll effect
  const navbar = document.getElementById('main-navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  // แสดง mode ใน console เพื่อ debug ง่าย
  console.log(`%c VTuber Merch Hub`, 'font-size:16px;font-weight:bold;color:#a855f7');
  console.log(`%c โหมด: ${USE_MOCK_DATA ? '🟡 Live Server (Mock Data)' : '🟢 Express Backend'}`, 'color:#22d3ee');
}

// รองรับทั้งกรณี DOMContentLoaded ยังไม่ fire และ fire ไปแล้ว
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
