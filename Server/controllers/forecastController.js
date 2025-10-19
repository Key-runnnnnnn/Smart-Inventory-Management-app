const forecastService = require('../services/forecastService');

// @desc    Forecast demand for a specific item using Gemini AI
// @route   GET /api/forecast/item/:itemId
// @access  Public
const forecastItemDemand = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { days = 30 } = req.query;

    const forecast = await forecastService.forecastDemandWithGemini(
      itemId,
      parseInt(days)
    );

    res.status(200).json({
      success: true,
      data: forecast,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error forecasting item demand',
      error: error.message,
    });
  }
};

// @desc    Get AI-powered restock suggestions using natural language
// @route   POST /api/forecast/restock-suggestions
// @access  Public
const getAIRestockSuggestions = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query is required',
      });
    }

    const suggestions = await forecastService.getRestockSuggestions(query);

    res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating restock suggestions',
      error: error.message,
    });
  }
};

// @desc    Batch forecast for multiple items
// @route   GET /api/forecast/batch
// @access  Public
const getBatchForecast = async (req, res) => {
  try {
    const { category, limit = 10 } = req.query;

    const forecasts = await forecastService.batchForecast(
      category,
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: forecasts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating batch forecast',
      error: error.message,
    });
  }
};

// @desc    Get historical sales data for an item
// @route   GET /api/forecast/history/:itemId
// @access  Public
const getHistoricalData = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { days = 90 } = req.query;

    const data = await forecastService.getHistoricalSalesData(
      itemId,
      parseInt(days)
    );

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching historical data',
      error: error.message,
    });
  }
};

module.exports = {
  forecastItemDemand,
  getAIRestockSuggestions,
  getBatchForecast,
  getHistoricalData,
};
