const express = require('express');
const router = express.Router();
const {
  getAllAlerts,
  getAlertSummary,
  getLowStockAlerts,
  getNearExpiryAlerts,
  getExpiredItemsAlerts,
  getOverstockAlerts,
} = require('../controllers/alertController');

// Get all alerts
router.get('/', getAllAlerts);

// Get alert summary
router.get('/summary', getAlertSummary);

// Get specific alert types
router.get('/low-stock', getLowStockAlerts);
router.get('/near-expiry', getNearExpiryAlerts);
router.get('/expired', getExpiredItemsAlerts);
router.get('/overstock', getOverstockAlerts);

module.exports = router;
