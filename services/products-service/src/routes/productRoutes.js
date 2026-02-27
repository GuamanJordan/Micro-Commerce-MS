const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Rutas públicas
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Rutas admin (la auth la maneja el Gateway)
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

// Ruta interna (para otros servicios)
router.put('/:id/stock', productController.updateStock);

module.exports = router;
