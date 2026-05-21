/**
 * VTuber Merch Hub — app.js
 * 
 * ไฟล์นี้ทำงานได้ 2 โหมด:
 *   1) Live Server (เปิดด้วย VS Code Live Server) — ใช้ MOCK_PRODUCTS เป็นข้อมูลจำลอง
 *   2) Express Backend  — ถ้ารัน node server.js จะดึงข้อมูลจริงจาก API /api/products
 *
 * เปลี่ยนโหมดได้ที่ USE_MOCK_DATA ด้านล่าง
 */

// ============================================================
// ⚙️  CONFIG — เปลี่ยนตรงนี้!
// ============================================================

// true  = ใช้ข้อมูลจำลอง (Live Server ไม่ต้องรัน node)
// false = ดึงข้อมูลจาก Express backend (node server.js)
const USE_MOCK_DATA = true;

// ============================================================
// 📦  MOCK DATA — ข้อมูลสินค้าตัวอย่าง
// ============================================================

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Hololive Acrylic Stand Vol.1',
    category: 'Acrylic Stands',
    price: 24.99,
    stock: 15,
    description: 'อะคริลิคสแตนด์ขนาด A5 พิมพ์ลาย 4 สี ความละเอียดสูง มาพร้อมฐานตั้งโต๊ะ',
    image_url: 'https://placehold.co/400x400/1a1a3e/a855f7?text=Acrylic+Stand'
  },
  {
    id: 2,
    name: 'Pekora Hoodie Black Edition',
    category: 'Apparel',
    price: 59.99,
    stock: 3,
    description: 'เสื้อฮู้ดดี้สีดำปักลาย Pekora ผ้า cotton 100% น้ำหนักดี ซับในนุ่ม',
    image_url: 'https://placehold.co/400x400/1a1a3e/22d3ee?text=Hoodie'
  },
  {
    id: 3,
    name: 'Gura Shark Plushie',
    category: 'Plushies',
    price: 39.99,
    stock: 0,
    description: 'ตุ๊กตาฉลามน้อย Gura ขนาด 30 cm ผ้านุ่มไม่ระคายเคืองผิว เหมาะสำหรับตกแต่ง',
    image_url: 'https://placehold.co/400x400/1a1a3e/f43f5e?text=Plushie'
  },
  {
    id: 4,
    name: 'Mumei Keychain Set',
    category: 'Keychains',
    price: 14.99,
    stock: 50,
    description: 'พวงกุญแจอะคริลิค Mumei เซต 3 ชิ้น ลายน่ารัก ขนาด 5 cm เคลือบ UV กันซีด',
    image_url: 'https://placehold.co/400x400/1a1a3e/10b981?text=Keychain'
  },
  {
    id: 5,
    name: 'Suisei "Stellar Stellar" Vinyl',
    category: 'Music',
    price: 34.99,
    stock: 8,
    description: 'แผ่น Vinyl เพลง Stellar Stellar ของ Suisei ขนาด 12 นิ้ว พิมพ์ปก Full Art',
    image_url: 'https://placehold.co/400x400/1a1a3e/f59e0b?text=Vinyl'
  },
  {
    id: 6,
    name: 'Marine Anniversary Mug',
    category: 'Mugs',
    price: 19.99,
    stock: 22,
    description: 'แก้วมัคเซรามิก 350ml ลาย Marine ครบรอบ 3 ปี พิมพ์ Heat-sensitive เปลี่ยนสีตอนใส่น้ำร้อน',
    image_url: 'https://placehold.co/400x400/1a1a3e/a855f7?text=Mug'
  },
  {
    id: 7,
    name: 'Korone Doggo Plushie XL',
    category: 'Plushies',
    price: 54.99,
    stock: 4,
    description: 'ตุ๊กตาสุนัขน้อย Korone รุ่น XL ขนาด 50 cm ผ้าขนนุ่มเด้ง สีเหลืองสดใส',
    image_url: 'https://placehold.co/400x400/1a1a3e/f59e0b?text=Korone+XL'
  },
  {
    id: 8,
    name: 'Aqua Idol Outfit Acrylic',
    category: 'Acrylic Stands',
    price: 29.99,
    stock: 12,
    description: 'อะคริลิคลาย Aqua ชุด Idol ขนาด B5 พิมพ์สีสดใส กระดาษหนา 5 มม.',
    image_url: 'https://placehold.co/400x400/1a1a3e/22d3ee?text=Aqua+Stand'
  },
  {
    id: 9,
    name: 'Kronii Oversized T-Shirt',
    category: 'Apparel',
    price: 44.99,
    stock: 7,
    description: 'เสื้อยืด Oversized ลาย Kronii สีขาวพิมพ์ลายนาฬิกา ผ้า cotton combed 32s',
    image_url: 'https://placehold.co/400x400/1a1a3e/a855f7?text=T-Shirt'
  },
  {
    id: 10,
    name: 'IRyS "IRyStocrat" Album CD',
    category: 'Music',
    price: 27.99,
    stock: 16,
    description: 'แผ่น CD อัลบั้ม EP แรกของ IRyS มาพร้อม Photobook 24 หน้า และการ์ดลายเซ็น',
    image_url: 'https://placehold.co/400x400/1a1a3e/10b981?text=CD+Album'
  },
  {
    id: 11,
    name: 'Fubuki Winter Keychain',
    category: 'Keychains',
    price: 9.99,
    stock: 35,
    description: 'พวงกุญแจ Fubuki ชุดฤดูหนาว อะคริลิคใส สาย PU ยาว 10 cm พร้อมกระดิ่งจิ๋ว',
    image_url: 'https://placehold.co/400x400/1a1a3e/22d3ee?text=FBK+Key'
  },
  {
    id: 12,
    name: 'Miko Sakura Gradient Mug',
    category: 'Mugs',
    price: 22.99,
    stock: 18,
    description: 'แก้วมัค Miko ลาย Sakura Gradient 400ml พิมพ์ทั้งสองด้าน ล้างเครื่องได้',
    image_url: 'https://placehold.co/400x400/1a1a3e/f43f5e?text=Miko+Mug'
  }
];

// ============================================================
// 🗃️  GLOBAL STATE
// ============================================================

let cartState    = [];  // สินค้าในตะกร้า
let userToken    = null;
let currentUser  = null;
let allProducts  = []; // สำรองไว้ filter ฝั่ง client

// ============================================================
// 🔗  DOM REFERENCES — แคช element ที่ใช้บ่อย
// ============================================================

const DOM = {
  productsGrid:    document.getElementById('products-grid'),
  searchInput:     document.getElementById('search-input'),
  categoryFilter:  document.getElementById('category-filter'),
  minPriceFilter:  document.getElementById('min-price-filter'),
  maxPriceFilter:  document.getElementById('max-price-filter'),
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

DOM.searchInput.addEventListener('input', debounce(() => fetchProducts(), 300));

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
// 📡  FETCH PRODUCTS
// ============================================================

async function fetchProducts() {
  DOM.resultsCount.textContent = 'กำลังค้นหา...';

  if (USE_MOCK_DATA) {
    // โหมด Live Server — filter ข้อมูลจำลอง
    filterAndRenderMockProducts();
  } else {
    // โหมด Backend — เรียก Express API
    await fetchProductsFromAPI();
  }
}

/** กรอง MOCK_PRODUCTS ด้วย filter ปัจจุบัน แล้ว render */
function filterAndRenderMockProducts() {
  const keyword  = DOM.searchInput.value.trim().toLowerCase();
  const category = DOM.categoryFilter.value;
  const minPrice = parseFloat(DOM.minPriceFilter.value) || 0;
  const maxPrice = parseFloat(DOM.maxPriceFilter.value) || Infinity;

  let results = MOCK_PRODUCTS.filter(p => {
    const matchKeyword  = !keyword || p.name.toLowerCase().includes(keyword) || p.description.toLowerCase().includes(keyword);
    const matchCategory = !category || p.category === category;
    const matchMin      = p.price >= minPrice;
    const matchMax      = p.price <= maxPrice;
    return matchKeyword && matchCategory && matchMin && matchMax;
  });

  renderProducts(results);
}

/** เรียก /api/products จาก Express backend */
async function fetchProductsFromAPI() {
  const keyword  = DOM.searchInput.value;
  const category = DOM.categoryFilter.value;
  const minPrice = DOM.minPriceFilter.value;
  const maxPrice = DOM.maxPriceFilter.value;

  const params = new URLSearchParams();
  if (keyword)  params.append('keyword',  keyword);
  if (category) params.append('category', category);
  if (minPrice) params.append('minPrice', minPrice);
  if (maxPrice) params.append('maxPrice', maxPrice);

  try {
    const res = await fetch(`/api/products?${params}`);
    if (!res.ok) throw new Error('API error');
    const products = await res.json();
    renderProducts(products);
  } catch (err) {
    console.error('fetchProducts error:', err);
    DOM.resultsCount.textContent = 'โหลดสินค้าไม่สำเร็จ';
    showToast('โหลดสินค้าไม่ได้ — ลองรัน node server.js', 'error');
  }
}

// ============================================================
// 🃏  RENDER PRODUCTS
// ============================================================

function renderProducts(products) {
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
    fetchProducts();
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
  fetchProducts();
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

DOM.categoryFilter.addEventListener('change', fetchProducts);
DOM.minPriceFilter.addEventListener('change', fetchProducts);
DOM.maxPriceFilter.addEventListener('change', fetchProducts);
DOM.clearFiltersBtn.addEventListener('click', () => {
  DOM.categoryFilter.value  = '';
  DOM.minPriceFilter.value  = '';
  DOM.maxPriceFilter.value  = '';
  DOM.searchInput.value     = '';
  fetchProducts();
});

DOM.navLogo.addEventListener('click',       backToCatalog);
DOM.heroBrowseBtn.addEventListener('click', () => DOM.catalogSection.scrollIntoView({ behavior: 'smooth' }));
DOM.navOrdersBtn.addEventListener('click',  viewOrderHistory);
DOM.backToCatalogBtn.addEventListener('click', backToCatalog);
DOM.checkoutBtn.addEventListener('click',   checkout);

// ============================================================
// 🚀  INIT — เริ่มต้นเมื่อหน้าโหลดเสร็จ
// ============================================================

window.addEventListener('DOMContentLoaded', () => {
  hydrateState();
  fetchProducts();

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
});
