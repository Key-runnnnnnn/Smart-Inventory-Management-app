const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const InventoryItem = require('../models/InventoryItem');
const StockTransaction = require('../models/StockTransaction');

/**
 * Generate CSV report for inventory items
 */
const generateInventoryCSV = async (filter = {}) => {
  try {
    const items = await InventoryItem.find({ ...filter, status: 'active' }).lean();

    const fields = [
      { label: 'SKU', value: 'sku' },
      { label: 'Name', value: 'name' },
      { label: 'Category', value: 'category' },
      { label: 'Sub Category', value: 'subCategory' },
      { label: 'Quantity', value: 'quantity' },
      { label: 'Unit', value: 'unit' },
      { label: 'Reorder Level', value: 'reorderLevel' },
      { label: 'Cost Price', value: 'costPrice' },
      { label: 'Selling Price', value: 'sellingPrice' },
      { label: 'Stock Value', value: 'stockValue' },
      { label: 'Supplier Name', value: 'supplier.name' },
      { label: 'Warehouse Location', value: 'warehouseLocation' },
      { label: 'Rack Number', value: 'rackNumber' },
      { label: 'Status', value: 'status' },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(items);

    return csv;
  } catch (error) {
    throw new Error(`Error generating inventory CSV: ${error.message}`);
  }
};

/**
 * Generate CSV report for transactions
 */
const generateTransactionsCSV = async (filter = {}) => {
  try {
    const transactions = await StockTransaction.find(filter)
      .populate('itemId', 'name sku category')
      .lean();

    const data = transactions.map((t) => ({
      transactionDate: new Date(t.transactionDate).toISOString(),
      itemName: t.itemId?.name || 'N/A',
      itemSKU: t.itemId?.sku || 'N/A',
      type: t.type,
      quantity: t.quantity,
      previousQuantity: t.previousQuantity,
      newQuantity: t.newQuantity,
      reason: t.reason,
      unitPrice: t.unitPrice || 0,
      totalAmount: t.totalAmount || 0,
      partyName: t.party?.name || '',
      performedBy: t.performedBy,
      invoiceNumber: t.invoiceNumber || '',
    }));

    const fields = [
      { label: 'Date', value: 'transactionDate' },
      { label: 'Item Name', value: 'itemName' },
      { label: 'SKU', value: 'itemSKU' },
      { label: 'Type', value: 'type' },
      { label: 'Quantity', value: 'quantity' },
      { label: 'Previous Quantity', value: 'previousQuantity' },
      { label: 'New Quantity', value: 'newQuantity' },
      { label: 'Reason', value: 'reason' },
      { label: 'Unit Price', value: 'unitPrice' },
      { label: 'Total Amount', value: 'totalAmount' },
      { label: 'Party Name', value: 'partyName' },
      { label: 'Performed By', value: 'performedBy' },
      { label: 'Invoice Number', value: 'invoiceNumber' },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    return csv;
  } catch (error) {
    throw new Error(`Error generating transactions CSV: ${error.message}`);
  }
};

/**
 * Generate PDF report for inventory
 */
const generateInventoryPDF = async (filter = {}) => {
  try {
    const items = await InventoryItem.find({ ...filter, status: 'active' });

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('Inventory Report', { align: 'center' });
      doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, {
        align: 'center',
      });
      doc.moveDown();

      // Summary
      const totalValue = items.reduce((sum, item) => sum + item.stockValue, 0);
      const totalItems = items.length;

      doc.fontSize(12).text('Summary', { underline: true });
      doc.fontSize(10).text(`Total Items: ${totalItems}`);
      doc.text(`Total Stock Value: ₹${totalValue.toLocaleString()}`);
      doc.moveDown();

      // Table Header
      doc.fontSize(12).text('Inventory Items', { underline: true });
      doc.moveDown(0.5);

      // Table
      const tableTop = doc.y;
      const itemHeight = 30;
      let y = tableTop;

      // Column headers
      doc.fontSize(8).font('Helvetica-Bold');
      doc.text('SKU', 50, y, { width: 80 });
      doc.text('Name', 130, y, { width: 120 });
      doc.text('Category', 250, y, { width: 80 });
      doc.text('Qty', 330, y, { width: 40 });
      doc.text('Unit', 370, y, { width: 40 });
      doc.text('Value', 410, y, { width: 80 });

      y += 15;
      doc.font('Helvetica');

      // Items
      items.forEach((item, i) => {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }

        doc.fontSize(7);
        doc.text(item.sku, 50, y, { width: 80 });
        doc.text(item.name.substring(0, 25), 130, y, { width: 120 });
        doc.text(item.category, 250, y, { width: 80 });
        doc.text(item.quantity.toString(), 330, y, { width: 40 });
        doc.text(item.unit, 370, y, { width: 40 });
        doc.text(`₹${item.stockValue.toLocaleString()}`, 410, y, { width: 80 });

        y += itemHeight;
      });

      doc.end();
    });
  } catch (error) {
    throw new Error(`Error generating inventory PDF: ${error.message}`);
  }
};

/**
 * Generate monthly performance report
 */
const generateMonthlyReport = async (year, month) => {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Get transactions for the month
    const transactions = await StockTransaction.find({
      transactionDate: { $gte: startDate, $lte: endDate },
    }).populate('itemId', 'name sku category');

    // Sales data
    const sales = transactions.filter((t) => t.type === 'out' && t.reason === 'sale');
    const totalSales = sales.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
    const totalItemsSold = sales.reduce((sum, t) => sum + t.quantity, 0);

    // Purchases data
    const purchases = transactions.filter((t) => t.type === 'in' && t.reason === 'purchase');
    const totalPurchases = purchases.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
    const totalItemsPurchased = purchases.reduce((sum, t) => sum + t.quantity, 0);

    // Top selling items
    const itemSalesMap = new Map();
    sales.forEach((sale) => {
      const itemId = sale.itemId?._id?.toString();
      if (itemId) {
        if (!itemSalesMap.has(itemId)) {
          itemSalesMap.set(itemId, {
            name: sale.itemId.name,
            sku: sale.itemId.sku,
            quantity: 0,
            revenue: 0,
          });
        }
        const item = itemSalesMap.get(itemId);
        item.quantity += sale.quantity;
        item.revenue += sale.totalAmount || 0;
      }
    });

    const topItems = Array.from(itemSalesMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Current inventory value
    const currentInventoryValue = await InventoryItem.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$stockValue' } } },
    ]);

    return {
      period: {
        year,
        month,
        startDate,
        endDate,
        monthName: new Date(year, month - 1).toLocaleString('default', {
          month: 'long',
        }),
      },
      sales: {
        totalRevenue: totalSales,
        totalItemsSold,
        transactionCount: sales.length,
      },
      purchases: {
        totalCost: totalPurchases,
        totalItemsPurchased,
        transactionCount: purchases.length,
      },
      profitability: {
        grossProfit: totalSales - totalPurchases,
        margin: totalSales > 0 ? (((totalSales - totalPurchases) / totalSales) * 100).toFixed(2) + '%' : '0%',
      },
      topSellingItems: topItems,
      currentInventoryValue: currentInventoryValue[0]?.total || 0,
      totalTransactions: transactions.length,
    };
  } catch (error) {
    throw new Error(`Error generating monthly report: ${error.message}`);
  }
};

/**
 * Generate sales comparison report
 */
const generateSalesComparison = async (startDate, endDate, compareStartDate, compareEndDate) => {
  try {
    // Current period sales
    const currentSales = await StockTransaction.aggregate([
      {
        $match: {
          type: 'out',
          reason: 'sale',
          transactionDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Comparison period sales
    const compareSales = await StockTransaction.aggregate([
      {
        $match: {
          type: 'out',
          reason: 'sale',
          transactionDate: {
            $gte: new Date(compareStartDate),
            $lte: new Date(compareEndDate),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 },
        },
      },
    ]);

    const current = currentSales[0] || { totalRevenue: 0, totalQuantity: 0, count: 0 };
    const compare = compareSales[0] || { totalRevenue: 0, totalQuantity: 0, count: 0 };

    const revenueChange = compare.totalRevenue > 0
      ? (((current.totalRevenue - compare.totalRevenue) / compare.totalRevenue) * 100).toFixed(2)
      : 0;

    const quantityChange = compare.totalQuantity > 0
      ? (((current.totalQuantity - compare.totalQuantity) / compare.totalQuantity) * 100).toFixed(2)
      : 0;

    return {
      currentPeriod: {
        startDate,
        endDate,
        totalRevenue: current.totalRevenue,
        totalQuantity: current.totalQuantity,
        transactionCount: current.count,
      },
      comparisonPeriod: {
        startDate: compareStartDate,
        endDate: compareEndDate,
        totalRevenue: compare.totalRevenue,
        totalQuantity: compare.totalQuantity,
        transactionCount: compare.count,
      },
      changes: {
        revenueChange: `${revenueChange}%`,
        quantityChange: `${quantityChange}%`,
        revenueChangeDelta: current.totalRevenue - compare.totalRevenue,
        quantityChangeDelta: current.totalQuantity - compare.totalQuantity,
      },
    };
  } catch (error) {
    throw new Error(`Error generating sales comparison: ${error.message}`);
  }
};

module.exports = {
  generateInventoryCSV,
  generateTransactionsCSV,
  generateInventoryPDF,
  generateMonthlyReport,
  generateSalesComparison,
};
