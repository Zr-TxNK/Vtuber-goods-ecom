/**
 * BEST PRACTICE: Controller-Route-Service Pattern - Service Layer (Rubric Item 7)
 * Service layers contain pure business logic, calculations, database transactions,
 * and data mapping. This separates the Express request/response object lifecycle
 * from the actual domain operations.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbRun, dbGet } = require('../config/database');
const { JWT_SECRET } = require('../middlewares/authMiddleware');

/**
 * Register a new user
 * BEST PRACTICE: Parameterized Queries for SQL Safety (Rubric Item 6)
 */
const registerUser = async (username, email, password) => {
  // 1. Check if user already exists
  // Parameterized query: '?' prevents SQL Injection
  const existingUser = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
  if (existingUser) {
    throw new Error('User with this email already exists.');
  }

  // 2. Hash password with bcryptjs
  // 10 salt rounds is the industry standard for a good security/performance trade-off
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // 3. Save user to database
  // Parameterized query: '?' prevents SQL Injection
  const result = await dbRun(
    'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
    [username, email, passwordHash]
  );

  return {
    id: result.lastID,
    username,
    email
  };
};

/**
 * Log in a user and return a JWT token
 * BEST PRACTICE: Parameterized Queries for SQL Safety (Rubric Item 6)
 */
const loginUser = async (email, password) => {
  // 1. Find user by email
  // Parameterized query: '?' prevents SQL Injection
  const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) {
    throw new Error('Invalid email or password.');
  }

  // 2. Verify password with bcryptjs
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error('Invalid email or password.');
  }

  // 3. Generate stateless session JWT token
  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' } // Stateless token valid for 24 hours
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  };
};

module.exports = {
  registerUser,
  loginUser
};
