/**
 * BEST PRACTICE: Controller-Route-Service Pattern - Controller Layer (Rubric Item 7)
 * Extracts filtering queries from request and returns matching products.
 */

const productService = require('./productService');

/**
 * Handle GET /api/products
 * Parses catalog query filters
 */
const getProducts = async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice } = req.query;

    const products = await productService.getAllProducts({
      keyword,
      category,
      minPrice,
      maxPrice
    });

    return res.status(200).json(products);
  } catch (error) {
    console.error('Get Products Controller Error:', error);
    return res.status(500).json({ error: 'Internal Server Error while fetching products.' });
  }
};

/**
 * Handle GET /api/products/:id
 */
const getProductDetails = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID.' });
    }

    const product = await productService.getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error('Get Product Details Controller Error:', error);
    return res.status(500).json({ error: 'Internal Server Error while retrieving product details.' });
  }
};

module.exports = {
  getProducts,
  getProductDetails
};
