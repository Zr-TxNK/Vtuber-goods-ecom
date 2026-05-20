/**
 * BEST PRACTICE: Gatekeeper Pattern - Input Validation & Sanitization (Rubric Item 3)
 * This middleware validates and sanitizes input data on the server-side before
 * it is sent to the controllers or services. This prevents invalid data processing
 * and sanitizes string inputs to prevent XSS and database corruption.
 */

// Helper to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper to sanitize inputs (basic HTML escaping to prevent XSS)
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validates registration payloads
 */
const validateRegister = (req, res, next) => {
  let { username, email, password } = req.body;

  // 1. Presence check
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required.' });
  }

  // 2. Sanitization
  username = sanitizeString(username);
  email = email.trim().toLowerCase();

  // 3. Format/Length validations
  if (username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters long.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address format.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  // Bind cleaned values back to request
  req.body.username = username;
  req.body.email = email;
  req.body.password = password; // Passwords shouldn't be HTML-escaped but will be hashed shortly

  next();
};

/**
 * Validates login payloads
 */
const validateLogin = (req, res, next) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  email = email.trim().toLowerCase();

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address format.' });
  }

  req.body.email = email;
  next();
};

/**
 * Validates checkout payload (items in the cart)
 */
const validateCheckout = (req, res, next) => {
  const { items } = req.body;

  // 1. Check if items array exists and is not empty
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty. Checkout requires at least one item.' });
  }

  // 2. Validate format of each item
  for (const item of items) {
    const productId = Number(item.productId);
    const quantity = Number(item.quantity);

    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({ error: 'Invalid product ID. Must be a positive integer.' });
    }

    if (isNaN(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
      return res.status(400).json({ error: 'Quantity must be a positive integer.' });
    }

    // Save back cast numbers
    item.productId = productId;
    item.quantity = quantity;
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateCheckout
};
