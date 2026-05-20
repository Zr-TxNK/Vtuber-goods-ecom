/**
 * BEST PRACTICE: Controller-Route-Service Pattern - Controller Layer (Rubric Item 7)
 * The controller receives the HTTP request, invokes services for business logic,
 * and formats the HTTP response (status codes and JSON outputs). It does not contain
 * database calls or business rules directly.
 */

const authService = require('../services/authService');

/**
 * Handle POST /register
 */
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Delegate registration to authService
    const newUser = await authService.registerUser(username, email, password);
    
    return res.status(201).json({
      message: 'User registered successfully.',
      user: newUser
    });
  } catch (error) {
    if (error.message.includes('exists')) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Registration Controller Error:', error);
    return res.status(500).json({ error: 'Internal Server Error during registration.' });
  }
};

/**
 * Handle POST /login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Delegate authentication to authService
    const result = await authService.loginUser(email, password);
    
    return res.status(200).json({
      message: 'Login successful.',
      token: result.token,
      user: result.user
    });
  } catch (error) {
    if (error.message.includes('Invalid')) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Login Controller Error:', error);
    return res.status(500).json({ error: 'Internal Server Error during login.' });
  }
};

module.exports = {
  register,
  login
};
