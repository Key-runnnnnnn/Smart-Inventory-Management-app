const InventoryItem = require('../models/InventoryItem');

/**
 * Alert Service - Handles various inventory alerts
 */

// Get low stock alerts
const getLowStockAlerts = async () => {
  try {
    const items = await InventoryItem.find({
      $expr: { $lte: ['$quantity', '$reorderLevel'] },
      status: 'active',
    }).sort({ quantity: 1 });

    return items.map((item) => ({
      id: item._id,
      type: 'low-stock',
      severity: item.quantity === 0 ? 'critical' : 'warning',
      item: {
        id: item._id,
        name: item.name,
        sku: item.sku,
        category: item.category,
        currentQuantity: item.quantity,
        reorderLevel: item.reorderLevel,
        unit: item.unit,
        imageUrl: item.imageUrl,
      },
      message: `${item.name} is ${item.quantity === 0 ? 'out of stock' : 'running low'}. Current: ${item.quantity} ${item.unit}, Reorder level: ${item.reorderLevel} ${item.unit}`,
      stockDifference: item.reorderLevel - item.quantity,
      createdAt: new Date(),
    }));
  } catch (error) {
    throw new Error(`Error fetching low stock alerts: ${error.message}`);
  }
};

// Get near expiry alerts
const getNearExpiryAlerts = async (daysThreshold = 30) => {
  try {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysThreshold);

    const items = await InventoryItem.find({
      expiryDate: {
        $gte: today,
        $lte: futureDate,
      },
      status: 'active',
      quantity: { $gt: 0 },
    }).sort({ expiryDate: 1 });

    return items.map((item) => {
      const daysUntilExpiry = Math.ceil(
        (item.expiryDate - today) / (1000 * 60 * 60 * 24)
      );

      let severity = 'info';
      if (daysUntilExpiry <= 7) severity = 'critical';
      else if (daysUntilExpiry <= 14) severity = 'warning';

      return {
        id: item._id,
        type: 'near-expiry',
        severity,
        item: {
          id: item._id,
          name: item.name,
          sku: item.sku,
          category: item.category,
          currentQuantity: item.quantity,
          unit: item.unit,
          expiryDate: item.expiryDate,
          batchNumber: item.batchNumber,
          imageUrl: item.imageUrl,
        },
        message: `${item.name} (Batch: ${item.batchNumber || 'N/A'}) will expire in ${daysUntilExpiry} days. Stock: ${item.quantity} ${item.unit}`,
        daysUntilExpiry,
        expiryDate: item.expiryDate,
        createdAt: new Date(),
      };
    });
  } catch (error) {
    throw new Error(`Error fetching near expiry alerts: ${error.message}`);
  }
};

// Get expired items alerts
const getExpiredItemsAlerts = async () => {
  try {
    const today = new Date();

    const items = await InventoryItem.find({
      expiryDate: { $lt: today },
      status: 'active',
      quantity: { $gt: 0 },
    }).sort({ expiryDate: 1 });

    return items.map((item) => {
      const daysExpired = Math.ceil(
        (today - item.expiryDate) / (1000 * 60 * 60 * 24)
      );

      return {
        id: item._id,
        type: 'expired',
        severity: 'critical',
        item: {
          id: item._id,
          name: item.name,
          sku: item.sku,
          category: item.category,
          currentQuantity: item.quantity,
          unit: item.unit,
          expiryDate: item.expiryDate,
          batchNumber: item.batchNumber,
          imageUrl: item.imageUrl,
        },
        message: `${item.name} (Batch: ${item.batchNumber || 'N/A'}) has expired ${daysExpired} days ago. Quantity: ${item.quantity} ${item.unit}`,
        daysExpired,
        expiryDate: item.expiryDate,
        createdAt: new Date(),
      };
    });
  } catch (error) {
    throw new Error(`Error fetching expired items alerts: ${error.message}`);
  }
};

// Get overstock alerts
const getOverstockAlerts = async () => {
  try {
    const items = await InventoryItem.find({
      $expr: { $gte: ['$quantity', '$maxStockLevel'] },
      maxStockLevel: { $exists: true, $ne: null },
      status: 'active',
    }).sort({ quantity: -1 });

    return items.map((item) => {
      const overstock = item.quantity - item.maxStockLevel;
      const overstockPercentage = (
        (overstock / item.maxStockLevel) *
        100
      ).toFixed(1);

      return {
        id: item._id,
        type: 'overstock',
        severity: 'info',
        item: {
          id: item._id,
          name: item.name,
          sku: item.sku,
          category: item.category,
          currentQuantity: item.quantity,
          maxStockLevel: item.maxStockLevel,
          unit: item.unit,
          stockValue: item.stockValue,
          imageUrl: item.imageUrl,
        },
        message: `${item.name} is overstocked by ${overstock} ${item.unit} (${overstockPercentage}% over limit)`,
        overstockQuantity: overstock,
        overstockPercentage: parseFloat(overstockPercentage),
        createdAt: new Date(),
      };
    });
  } catch (error) {
    throw new Error(`Error fetching overstock alerts: ${error.message}`);
  }
};

// Get all alerts
const getAllAlerts = async () => {
  try {
    const [lowStock, nearExpiry, expired, overstock] = await Promise.all([
      getLowStockAlerts(),
      getNearExpiryAlerts(),
      getExpiredItemsAlerts(),
      getOverstockAlerts(),
    ]);

    const allAlerts = [...lowStock, ...nearExpiry, ...expired, ...overstock];

    // Sort by severity (critical > warning > info)
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    allAlerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return {
      total: allAlerts.length,
      critical: allAlerts.filter((a) => a.severity === 'critical').length,
      warning: allAlerts.filter((a) => a.severity === 'warning').length,
      info: allAlerts.filter((a) => a.severity === 'info').length,
      alerts: allAlerts,
      summary: {
        lowStock: lowStock.length,
        nearExpiry: nearExpiry.length,
        expired: expired.length,
        overstock: overstock.length,
      },
    };
  } catch (error) {
    throw new Error(`Error fetching all alerts: ${error.message}`);
  }
};

// Get alert summary (counts only)
const getAlertSummary = async () => {
  try {
    const [lowStockCount, nearExpiryCount, expiredCount, overstockCount] =
      await Promise.all([
        InventoryItem.countDocuments({
          $expr: { $lte: ['$quantity', '$reorderLevel'] },
          status: 'active',
        }),
        InventoryItem.countDocuments({
          expiryDate: {
            $gte: new Date(),
            $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
          status: 'active',
          quantity: { $gt: 0 },
        }),
        InventoryItem.countDocuments({
          expiryDate: { $lt: new Date() },
          status: 'active',
          quantity: { $gt: 0 },
        }),
        InventoryItem.countDocuments({
          $expr: { $gte: ['$quantity', '$maxStockLevel'] },
          maxStockLevel: { $exists: true, $ne: null },
          status: 'active',
        }),
      ]);

    const total = lowStockCount + nearExpiryCount + expiredCount + overstockCount;

    return {
      total,
      lowStock: lowStockCount,
      nearExpiry: nearExpiryCount,
      expired: expiredCount,
      overstock: overstockCount,
    };
  } catch (error) {
    throw new Error(`Error fetching alert summary: ${error.message}`);
  }
};

module.exports = {
  getLowStockAlerts,
  getNearExpiryAlerts,
  getExpiredItemsAlerts,
  getOverstockAlerts,
  getAllAlerts,
  getAlertSummary,
};
