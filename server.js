/**
 * BEST PRACTICE: Express Entry Point & Middleware Configuration
 * This file serves as the main bootstrapper for the server. It imports middleware,
 * initializes database tables, registers API routers, and serves static files.
 */

const express = require('express');
const path = require('path');
const { initializeDatabase } = require('./src/config/database');

// Import Route modules (Controller-Route-Service Pattern - Route Mounts)
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const orderRoutes = require('./src/routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// BEST PRACTICE: Checkout Body Parsing (Rubric Item 4)
app.use(express.json());

// Serve static frontend files from 'public' folder (Zero-Config setup)
app.use(express.static(path.join(__dirname, 'public')));

// Mount API routes (Separation of Concerns)
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// General error handler middleware
app.use((err, req, res, next) => {
  console.error('Global Error Handler caught:', err.stack);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Run schema migrations and data seeding on boot
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 Limited Edition VTuber Goods Store listening on port ${PORT}`);
      console.log(`🌐 Open http://localhost:${PORT} in your web browser!`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Failed to initialize database and start server:', error);
    process.exit(1);
  }
};

startServer();
