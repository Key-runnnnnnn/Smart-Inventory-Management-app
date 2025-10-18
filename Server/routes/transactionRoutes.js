const express = require('express');
const router = express.Router();
const {
  getAllTransactions,
  getItemTransactions,
  stockIn,
  stockOut,
  stockAdjustment,
  getTransactionStats,
} = require('../controllers/transactionController');

// Main transaction routes
router.get('/', getAllTransactions);
router.get('/item/:itemId', getItemTransactions);

// Stock operation routes
router.post('/stock-in', stockIn);
router.post('/stock-out', stockOut);
router.post('/adjustment', stockAdjustment);

// Stats route
router.get('/stats/summary', getTransactionStats);

module.exports = router;
