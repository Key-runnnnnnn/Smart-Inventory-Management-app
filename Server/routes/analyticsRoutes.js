const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getTopPerformingItems,
  getSlowMovingItems,
  getInventoryTurnover,
  getSalesTrends,
  getInventoryValueTrends,
} = require('../controllers/analyticsController');

// Dashboard analytics
router.get('/dashboard', getDashboardAnalytics);

// Top performing items
router.get('/top-items', getTopPerformingItems);

// Slow-moving inventory
router.get('/slow-moving', getSlowMovingItems);

// Inventory turnover
router.get('/turnover', getInventoryTurnover);

// Sales trends over time
router.get('/sales-trends', getSalesTrends);

// Inventory value trends
router.get('/value-trends', getInventoryValueTrends);

module.exports = router;
