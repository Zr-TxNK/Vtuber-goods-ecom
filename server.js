/**
 * server.js — Express Entry Point
 *
 * รันด้วย: node server.js
 * เปิดเบราว์เซอร์ที่: http://localhost:3000
 *
 * หมายเหตุ: ระบบ database ถูกแทนที่ด้วย in-memory placeholder ใน database.js
 * ข้อมูลจะ reset ทุกครั้งที่รีสตาร์ท server
 */

const express = require('express');
const path    = require('path');
const { initializeDatabase } = require('./database');

// Routes
const authRoutes    = require('./authRoutes');
const productRoutes = require('./productRoutes');
const orderRoutes   = require('./orderRoutes');

const app  = express();
const PORT = process.env.PORT || 3000;

// Body parser
app.use(express.json());

// เสิร์ฟ static files จาก root (index.html, style.css, app.js อยู่ที่เดียวกัน)
app.use(express.static(path.join(__dirname)));

// API Routes
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ error: 'เกิดข้อผิดพลาดที่ server' });
});

// Start
const startServer = async () => {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 VTuber Merch Hub กำลังทำงานที่ port ${PORT}`);
    console.log(`🌐 เปิด http://localhost:${PORT} ในเบราว์เซอร์`);
    console.log(`📦 ใช้ in-memory placeholder (ไม่มี SQLite)`);
    console.log('='.repeat(50));
  });
};

startServer();
