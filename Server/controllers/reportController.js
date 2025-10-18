const reportService = require('../services/reportService');

// @desc    Export inventory as CSV
// @route   GET /api/reports/export/inventory/csv
// @access  Public
const exportInventoryCSV = async (req, res) => {
  try {
    const { category, status } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    const csv = await reportService.generateInventoryCSV(filter);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory-report.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error exporting inventory CSV',
      error: error.message,
    });
  }
};

// @desc    Export inventory as PDF
// @route   GET /api/reports/export/inventory/pdf
// @access  Public
const exportInventoryPDF = async (req, res) => {
  try {
    const { category, status } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    const pdfBuffer = await reportService.generateInventoryPDF(filter);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory-report.pdf');
    res.status(200).send(pdfBuffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error exporting inventory PDF',
      error: error.message,
    });
  }
};

// @desc    Export transactions as CSV
// @route   GET /api/reports/export/transactions/csv
// @access  Public
const exportTransactionsCSV = async (req, res) => {
  try {
    const { startDate, endDate, type, reason } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (reason) filter.reason = reason;
    if (startDate || endDate) {
      filter.transactionDate = {};
      if (startDate) filter.transactionDate.$gte = new Date(startDate);
      if (endDate) filter.transactionDate.$lte = new Date(endDate);
    }

    const csv = await reportService.generateTransactionsCSV(filter);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions-report.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error exporting transactions CSV',
      error: error.message,
    });
  }
};

// @desc    Get monthly performance report
// @route   GET /api/reports/monthly
// @access  Public
const getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: 'Year and month are required',
      });
    }

    const report = await reportService.generateMonthlyReport(
      parseInt(year),
      parseInt(month)
    );

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating monthly report',
      error: error.message,
    });
  }
};

// @desc    Get sales comparison report
// @route   GET /api/reports/sales-comparison
// @access  Public
const getSalesComparison = async (req, res) => {
  try {
    const { startDate, endDate, compareStartDate, compareEndDate } = req.query;

    if (!startDate || !endDate || !compareStartDate || !compareEndDate) {
      return res.status(400).json({
        success: false,
        message: 'All date parameters are required',
      });
    }

    const comparison = await reportService.generateSalesComparison(
      startDate,
      endDate,
      compareStartDate,
      compareEndDate
    );

    res.status(200).json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating sales comparison',
      error: error.message,
    });
  }
};

module.exports = {
  exportInventoryCSV,
  exportInventoryPDF,
  exportTransactionsCSV,
  getMonthlyReport,
  getSalesComparison,
};
