const express = require('express');
const router = express.Router();
const {
  forecastItemDemand,
  getAIRestockSuggestions,
  getBatchForecast,
  getEOQ,
  getHistoricalData,
} = require('../controllers/forecastController');

// Forecast routes
router.get('/item/:itemId', forecastItemDemand);
router.get('/batch', getBatchForecast);
router.get('/eoq/:itemId', getEOQ);
router.get('/history/:itemId', getHistoricalData);

// AI-powered suggestions
router.post('/restock-suggestions', getAIRestockSuggestions);

module.exports = router;
