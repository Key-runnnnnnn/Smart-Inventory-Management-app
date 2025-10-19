const express = require('express');
const router = express.Router();
const {
  forecastItemDemand,
  getAIRestockSuggestions,
  getBatchForecast,
  getHistoricalData,
} = require('../controllers/forecastController');

// Forecast routes
router.get('/item/:itemId', forecastItemDemand);
router.get('/batch', getBatchForecast);
router.get('/history/:itemId', getHistoricalData);

// AI-powered suggestions
router.post('/restock-suggestions', getAIRestockSuggestions);

module.exports = router;
