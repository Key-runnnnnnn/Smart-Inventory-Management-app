const alertService = require('../services/alertService');

// @desc    Get all alerts
// @route   GET /api/alerts
// @access  Public
const getAllAlerts = async (req, res) => {
  try {
    const alerts = await alertService.getAllAlerts();

    res.status(200).json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts',
      error: error.message,
    });
  }
};

// @desc    Get alert summary
// @route   GET /api/alerts/summary
// @access  Public
const getAlertSummary = async (req, res) => {
  try {
    const summary = await alertService.getAlertSummary();

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching alert summary',
      error: error.message,
    });
  }
};

// @desc    Get low stock alerts
// @route   GET /api/alerts/low-stock
// @access  Public
const getLowStockAlerts = async (req, res) => {
  try {
    const alerts = await alertService.getLowStockAlerts();

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching low stock alerts',
      error: error.message,
    });
  }
};

// @desc    Get near expiry alerts
// @route   GET /api/alerts/near-expiry
// @access  Public
const getNearExpiryAlerts = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const alerts = await alertService.getNearExpiryAlerts(parseInt(days));

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching near expiry alerts',
      error: error.message,
    });
  }
};

// @desc    Get expired items alerts
// @route   GET /api/alerts/expired
// @access  Public
const getExpiredItemsAlerts = async (req, res) => {
  try {
    const alerts = await alertService.getExpiredItemsAlerts();

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching expired items alerts',
      error: error.message,
    });
  }
};

// @desc    Get overstock alerts
// @route   GET /api/alerts/overstock
// @access  Public
const getOverstockAlerts = async (req, res) => {
  try {
    const alerts = await alertService.getOverstockAlerts();

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching overstock alerts',
      error: error.message,
    });
  }
};

module.exports = {
  getAllAlerts,
  getAlertSummary,
  getLowStockAlerts,
  getNearExpiryAlerts,
  getExpiredItemsAlerts,
  getOverstockAlerts,
};
