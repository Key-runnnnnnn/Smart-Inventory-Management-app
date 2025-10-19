const InventoryItem = require('../models/InventoryItem');
const StockTransaction = require('../models/StockTransaction');


const getDashboardAnalytics = async (req, res) => {
  try {
    // Total stock value
    const stockValueData = await InventoryItem.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$stockValue' },
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
        },
      },
    ]);

    const stockValue = stockValueData[0] || {
      totalValue: 0,
      totalItems: 0,
      totalQuantity: 0,
    };

    // Low stock count
    const lowStockCount = await InventoryItem.countDocuments({
      $expr: { $lte: ['$quantity', '$reorderLevel'] },
      status: 'active',
    });

    // Out of stock count
    const outOfStockCount = await InventoryItem.countDocuments({
      quantity: 0,
      status: 'active',
    });

    // Overstock count
    const overstockCount = await InventoryItem.countDocuments({
      $expr: { $gte: ['$quantity', '$maxStockLevel'] },
      status: 'active',
    });

    // Category-wise distribution
    const categoryDistribution = await InventoryItem.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalValue: { $sum: '$stockValue' },
          totalQuantity: { $sum: '$quantity' },
        },
      },
      { $sort: { totalValue: -1 } },
      {
        $project: {
          _id: 1,
          category: '$_id',
          count: 1,
          totalValue: 1,
          totalQuantity: 1,
        },
      },
    ]);

    // Recent transactions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await StockTransaction.aggregate([
      { $match: { transactionDate: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalStockValue: stockValue.totalValue,
          totalItems: stockValue.totalItems,
          totalQuantity: stockValue.totalQuantity,
          lowStockCount,
          outOfStockCount,
          overstockCount,
        },
        categoryDistribution,
        recentActivity,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard analytics',
      error: error.message,
    });
  }
};


const getTopPerformingItems = async (req, res) => {
  try {
    const { limit = 5, metric = 'sales', days = 30 } = req.query;

    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - parseInt(days));

    // Get top items based on sales quantity
    const topItemsByQuantity = await StockTransaction.aggregate([
      {
        $match: {
          type: 'out',
          reason: 'sale',
          transactionDate: { $gte: dateFilter },
        },
      },
      {
        $group: {
          _id: '$itemId',
          totalQuantitySold: { $sum: '$quantity' },
          totalRevenue: { $sum: '$totalAmount' },
          transactionCount: { $sum: 1 },
        },
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'inventoryitems',
          localField: '_id',
          foreignField: '_id',
          as: 'itemDetails',
        },
      },
      { $unwind: '$itemDetails' },
      {
        $project: {
          _id: '$_id',
          itemId: '$_id',
          name: '$itemDetails.name',
          sku: '$itemDetails.sku',
          category: '$itemDetails.category',
          quantity: '$itemDetails.quantity',
          unit: '$itemDetails.unit',
          stockValue: '$itemDetails.stockValue',
          totalQuantitySold: 1,
          totalRevenue: 1,
          transactionCount: 1,
          imageUrl: '$itemDetails.imageUrl',
        },
      },
    ]);

    // Get top items based on revenue
    const topItemsByRevenue = await StockTransaction.aggregate([
      {
        $match: {
          type: 'out',
          reason: 'sale',
          transactionDate: { $gte: dateFilter },
        },
      },
      {
        $group: {
          _id: '$itemId',
          totalQuantitySold: { $sum: '$quantity' },
          totalRevenue: { $sum: '$totalAmount' },
          transactionCount: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'inventoryitems',
          localField: '_id',
          foreignField: '_id',
          as: 'itemDetails',
        },
      },
      { $unwind: '$itemDetails' },
      {
        $project: {
          _id: '$_id',
          itemId: '$_id',
          name: '$itemDetails.name',
          sku: '$itemDetails.sku',
          category: '$itemDetails.category',
          quantity: '$itemDetails.quantity',
          unit: '$itemDetails.unit',
          stockValue: '$itemDetails.stockValue',
          totalQuantitySold: 1,
          totalRevenue: 1,
          transactionCount: 1,
          imageUrl: '$itemDetails.imageUrl',
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        items: topItemsByQuantity,
        topByQuantity: topItemsByQuantity,
        topByRevenue: topItemsByRevenue,
        period: `Last ${days} days`,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching top performing items',
      error: error.message,
    });
  }
};


const getSlowMovingItems = async (req, res) => {
  try {
    const { days = 60, limit = 10 } = req.query;

    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - parseInt(days));

    // Get all active items
    const allItems = await InventoryItem.find({ status: 'active' }).select(
      '_id name sku category quantity unit stockValue lastRestocked createdAt imageUrl'
    );

    // Get items with transactions in the specified period
    const itemsWithTransactions = await StockTransaction.aggregate([
      {
        $match: {
          type: 'out',
          transactionDate: { $gte: dateFilter },
        },
      },
      {
        $group: {
          _id: '$itemId',
          totalQuantitySold: { $sum: '$quantity' },
          lastSaleDate: { $max: '$transactionDate' },
          transactionCount: { $sum: 1 },
        },
      },
    ]);

    // Create a map of items with sales
    const salesMap = new Map();
    itemsWithTransactions.forEach((item) => {
      salesMap.set(item._id.toString(), item);
    });

    // Identify slow-moving items
    const slowMovingItems = allItems
      .map((item) => {
        const salesData = salesMap.get(item._id.toString());
        const daysSinceLastSale = salesData
          ? Math.floor(
            (new Date() - new Date(salesData.lastSaleDate)) /
            (1000 * 60 * 60 * 24)
          )
          : null;

        const daysSinceAdded = Math.floor(
          (new Date() - new Date(item.createdAt)) / (1000 * 60 * 60 * 24)
        );

        return {
          _id: item._id,
          itemId: item._id,
          name: item.name,
          sku: item.sku,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit || 'pcs',
          stockValue: item.stockValue,
          totalQuantitySold: salesData?.totalQuantitySold || 0,
          transactionCount: salesData?.transactionCount || 0,
          lastSaleDate: salesData?.lastSaleDate || null,
          daysSinceLastSale,
          daysSinceLastTransaction: daysSinceLastSale,
          daysSinceAdded,
          imageUrl: item.imageUrl,
        };
      })
      .filter((item) => {
        // Item is slow-moving if:
        // 1. No sales at all in the period, OR
        // 2. Very low sales (less than 10 units total AND less than 3 transactions), OR
        // 3. Low turnover (sold less than 10% of current stock in the period)

        const hasNoSales = item.totalQuantitySold === 0;
        const hasVeryLowSales = item.totalQuantitySold > 0 && item.totalQuantitySold < 10 && item.transactionCount < 3;
        const hasLowTurnover = item.quantity > 0 && item.totalQuantitySold < item.quantity * 0.1;

        return hasNoSales || hasVeryLowSales || hasLowTurnover;
      })
      .sort((a, b) => {
        // Sort by: 
        // 1. Items with no sales first
        // 2. Then by lowest transaction count
        // 3. Then by highest stock value (most capital tied up)
        if (a.totalQuantitySold === 0 && b.totalQuantitySold > 0) return -1;
        if (a.totalQuantitySold > 0 && b.totalQuantitySold === 0) return 1;
        if (a.transactionCount !== b.transactionCount) {
          return a.transactionCount - b.transactionCount;
        }
        return b.stockValue - a.stockValue;
      })
      .slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      count: slowMovingItems.length,
      data: slowMovingItems,
      period: `Last ${days} days`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching slow-moving items',
      error: error.message,
    });
  }
};


const getInventoryTurnover = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - parseInt(days));

    // Calculate average inventory value
    const avgInventoryValue = await InventoryItem.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          avgValue: { $avg: '$stockValue' },
          totalValue: { $sum: '$stockValue' },
        },
      },
    ]);

    // Calculate cost of goods sold (COGS) - total value of items sold
    const cogsData = await StockTransaction.aggregate([
      {
        $match: {
          type: 'out',
          reason: 'sale',
          transactionDate: { $gte: dateFilter },
        },
      },
      {
        $lookup: {
          from: 'inventoryitems',
          localField: 'itemId',
          foreignField: '_id',
          as: 'item',
        },
      },
      { $unwind: '$item' },
      {
        $group: {
          _id: null,
          totalCOGS: {
            $sum: { $multiply: ['$quantity', '$item.costPrice'] },
          },
          totalRevenue: { $sum: '$totalAmount' },
          totalQuantitySold: { $sum: '$quantity' },
        },
      },
    ]);

    const cogs = cogsData[0] || {
      totalCOGS: 0,
      totalRevenue: 0,
      totalQuantitySold: 0,
    };
    const avgInvValue = avgInventoryValue[0] || {
      avgValue: 0,
      totalValue: 0,
    };

    // Turnover Ratio = COGS / Average Inventory Value
    const turnoverRatio =
      avgInvValue.avgValue > 0 ? cogs.totalCOGS / avgInvValue.avgValue : 0;

    // Days in period
    const daysInPeriod = parseInt(days);

    // Days Sales of Inventory (DSI) = (Average Inventory / COGS) * Days in Period
    const daysOfInventory =
      cogs.totalCOGS > 0
        ? (avgInvValue.totalValue / cogs.totalCOGS) * daysInPeriod
        : 0;

    res.status(200).json({
      success: true,
      data: {
        period: `Last ${days} days`,
        turnoverRatio: turnoverRatio.toFixed(2),
        daysOfInventory: Math.round(daysOfInventory),
        averageInventoryValue: avgInvValue.totalValue,
        totalCOGS: cogs.totalCOGS,
        totalRevenue: cogs.totalRevenue,
        grossProfit: cogs.totalRevenue - cogs.totalCOGS,
        grossProfitMargin:
          cogs.totalRevenue > 0
            ? (((cogs.totalRevenue - cogs.totalCOGS) / cogs.totalRevenue) * 100).toFixed(2) + '%'
            : '0%',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error calculating inventory turnover',
      error: error.message,
    });
  }
};


const getSalesTrends = async (req, res) => {
  try {
    const { days = 30, groupBy = 'day' } = req.query;

    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - parseInt(days));

    // Define date grouping format
    let dateFormat;
    switch (groupBy) {
      case 'hour':
        dateFormat = {
          year: { $year: '$transactionDate' },
          month: { $month: '$transactionDate' },
          day: { $dayOfMonth: '$transactionDate' },
          hour: { $hour: '$transactionDate' },
        };
        break;
      case 'week':
        dateFormat = {
          year: { $year: '$transactionDate' },
          week: { $week: '$transactionDate' },
        };
        break;
      case 'month':
        dateFormat = {
          year: { $year: '$transactionDate' },
          month: { $month: '$transactionDate' },
        };
        break;
      default: // day
        dateFormat = {
          year: { $year: '$transactionDate' },
          month: { $month: '$transactionDate' },
          day: { $dayOfMonth: '$transactionDate' },
        };
    }

    const salesTrends = await StockTransaction.aggregate([
      {
        $match: {
          type: 'out',
          reason: 'sale',
          transactionDate: { $gte: dateFilter },
        },
      },
      {
        $group: {
          _id: dateFormat,
          totalSales: { $sum: '$totalAmount' },
          totalQuantity: { $sum: '$quantity' },
          transactionCount: { $sum: 1 },
          date: { $first: '$transactionDate' },
        },
      },
      { $sort: { date: 1 } },
    ]);

    // Transform salesTrends to simpler format with formatted labels
    const trends = salesTrends.map((trend) => {
      let dateLabel = '';
      if (groupBy === 'hour') {
        dateLabel = `${trend._id.month}/${trend._id.day} ${trend._id.hour}:00`;
      } else if (groupBy === 'week') {
        dateLabel = `Week ${trend._id.week}, ${trend._id.year}`;
      } else if (groupBy === 'month') {
        dateLabel = `${trend._id.month}/${trend._id.year}`;
      } else {
        dateLabel = `${trend._id.month}/${trend._id.day}`;
      }

      return {
        _id: dateLabel,
        date: trend.date,
        quantity: trend.totalQuantity,
        sales: trend.totalSales,
        transactionCount: trend.transactionCount,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        trends: trends,
        period: `Last ${days} days`,
        groupedBy: groupBy,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sales trends',
      error: error.message,
    });
  }
};


const getInventoryValueTrends = async (req, res) => {
  try {
    // Current value by category
    const currentValueByCategory = await InventoryItem.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$category',
          totalValue: { $sum: '$stockValue' },
          itemCount: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
        },
      },
      { $sort: { totalValue: -1 } },
    ]);

    // Stock status distribution
    const stockStatusDistribution = await InventoryItem.aggregate([
      { $match: { status: 'active' } },
      {
        $project: {
          stockStatus: {
            $cond: {
              if: { $eq: ['$quantity', 0] },
              then: 'out-of-stock',
              else: {
                $cond: {
                  if: { $lte: ['$quantity', '$reorderLevel'] },
                  then: 'low-stock',
                  else: {
                    $cond: {
                      if: { $gte: ['$quantity', '$maxStockLevel'] },
                      then: 'overstock',
                      else: 'in-stock',
                    },
                  },
                },
              },
            },
          },
          stockValue: 1,
        },
      },
      {
        $group: {
          _id: '$stockStatus',
          count: { $sum: 1 },
          totalValue: { $sum: '$stockValue' },
        },
      },
    ]);

    // Transform category values into trends format for charts
    const trends = currentValueByCategory.map((cat) => ({
      _id: cat._id,
      category: cat._id,
      totalValue: cat.totalValue,
      itemCount: cat.itemCount,
      totalQuantity: cat.totalQuantity,
    }));

    res.status(200).json({
      success: true,
      data: {
        trends: trends,
        valueByCategory: currentValueByCategory,
        stockStatusDistribution,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory value trends',
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardAnalytics,
  getTopPerformingItems,
  getSlowMovingItems,
  getInventoryTurnover,
  getSalesTrends,
  getInventoryValueTrends,
};
