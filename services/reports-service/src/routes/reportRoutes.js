const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.post('/sync', reportController.syncOrder);
router.get('/sales', reportController.getSalesReport);
router.get('/top-products', reportController.getTopProducts);
router.get('/revenue', reportController.getTotalRevenue);

module.exports = router;
