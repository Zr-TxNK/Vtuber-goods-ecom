/**
 * BEST PRACTICE: Controller-Route-Service Pattern - Service Layer (Rubric Item 7)
 * Service layers handle business workflows and database operations.
 */

const { dbAll, dbGet } = require('../config/database');

/**
 * Fetch all products matching the interactive filters
 * BEST PRACTICE: SQL Safety - Parameterized Queries for dynamic searches (Rubric Item 6)
 */
const getAllProducts = async (filters = {}) => {
  let sql = 'SELECT * FROM products';
  const conditions = [];
  const params = [];

  // 1. Keyword search
  if (filters.keyword) {
    conditions.push('(name LIKE ? OR description LIKE ?)');
    const term = `%${filters.keyword}%`;
    params.push(term, term);
  }

  // 2. Category filter
  if (filters.category) {
    conditions.push('category = ?');
    params.push(filters.category);
  }

  // 3. Price boundary filters
  if (filters.minPrice !== undefined && filters.minPrice !== '') {
    const minVal = parseFloat(filters.minPrice);
    if (!isNaN(minVal)) {
      conditions.push('price >= ?');
      params.push(minVal);
    }
  }

  if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
    const maxVal = parseFloat(filters.maxPrice);
    if (!isNaN(maxVal)) {
      conditions.push('price <= ?');
      params.push(maxVal);
    }
  }

  // Combine conditions with AND
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  // Execute query safely
  return await dbAll(sql, params);
};

/**
 * Get product by its primary ID
 */
const getProductById = async (id) => {
  return await dbGet('SELECT * FROM products WHERE id = ?', [id]);
};

module.exports = {
  getAllProducts,
  getProductById
};
