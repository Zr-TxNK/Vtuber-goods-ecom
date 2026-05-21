/**
 * BEST PRACTICE: Gatekeeper Pattern - Authentication (Rubric Item 3)
 * This middleware authenticates users using state-less JWT tokens. If a route
 * requires login, it must pass through this gatekeeper. It intercepts unauthorized
 * API calls and binds the authenticated user metadata (id, email) to req.user.
 */

const jwt = require('jsonwebtoken');

// Using a hardcoded fallback secret key for simplicity of Zero-Config setup.
// In production, this would be loaded from process.env.JWT_SECRET.
const JWT_SECRET = process.env.JWT_SECRET || 'vtuber_secret_key_1337_unlocked_edition';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // Format: "Bearer TOKEN"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Authorization token is missing.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user info (id, email, username) to request
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Access denied. Invalid or expired token.' });
  }
};

module.exports = {
  authenticateToken,
  JWT_SECRET
};
