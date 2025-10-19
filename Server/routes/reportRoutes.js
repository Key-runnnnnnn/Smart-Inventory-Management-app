const express = require('express');
const router = express.Router();
const {
  exportInventoryCSV,
  exportInventoryPDF,
  exportTransactionsCSV,
  getMonthlyReport,
} = require('../controllers/reportController');

// Export routes
router.get('/export/inventory/csv', exportInventoryCSV);
router.get('/export/inventory/pdf', exportInventoryPDF);
router.get('/export/transactions/csv', exportTransactionsCSV);

// Report routes
router.get('/monthly', getMonthlyReport);

module.exports = router;
