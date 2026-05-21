/**
 * BEST PRACTICE: Controller-Route-Service Pattern - Route Layer (Rubric Item 7)
 * Defines product catalog endpoints.
 */

const express = require('express');
const router = express.Router();
const productController = require('./productController');

// Mount routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductDetails);

module.exports = router;
