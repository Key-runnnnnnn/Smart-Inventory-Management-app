const InventoryItem = require('../models/InventoryItem');
const StockTransaction = require('../models/StockTransaction');

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Public
const getAllItems = async (req, res) => {
  try {
    const { 
      category, 
      status, 
      stockStatus, 
      search,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Add stock status filter
    if (stockStatus) {
      switch (stockStatus) {
        case 'out-of-stock':
          filter.quantity = 0;
          break;
        case 'low-stock':
          filter.quantity = { $gt: 0, $lte: filter.reorderLevel };
          break;
        case 'in-stock':
          filter.$expr = { $gt: ['$quantity', '$reorderLevel'] };
          break;
      }
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sortBy]: sortOrder };

    const items = await InventoryItem.find(filter)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await InventoryItem.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory items',
      error: error.message,
    });
  }
};

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Public
const getItemById = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching item',
      error: error.message,
    });
  }
};

// @desc    Create new inventory item
// @route   POST /api/inventory
// @access  Public
const createItem = async (req, res) => {
  try {
    const item = await InventoryItem.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: item,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'SKU already exists',
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Error creating item',
      error: error.message,
    });
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Public
const updateItem = async (req, res) => {
  try {
    const item = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: item,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating item',
      error: error.message,
    });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Public
const deleteItem = async (req, res) => {
  try {
    const item = await InventoryItem.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting item',
      error: error.message,
    });
  }
};

// @desc    Get low stock items
// @route   GET /api/inventory/alerts/low-stock
// @access  Public
const getLowStockItems = async (req, res) => {
  try {
    const items = await InventoryItem.find({
      $expr: { $lte: ['$quantity', '$reorderLevel'] },
      status: 'active',
    }).sort({ quantity: 1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching low stock items',
      error: error.message,
    });
  }
};

// @desc    Get expiring items
// @route   GET /api/inventory/alerts/expiring
// @access  Public
const getExpiringItems = async (req, res) => {
  try {
    const daysThreshold = parseInt(req.query.days) || 30;
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysThreshold);

    const items = await InventoryItem.find({
      expiryDate: {
        $gte: today,
        $lte: futureDate,
      },
      status: 'active',
    }).sort({ expiryDate: 1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching expiring items',
      error: error.message,
    });
  }
};

// @desc    Get inventory summary/stats
// @route   GET /api/inventory/stats
// @access  Public
const getInventoryStats = async (req, res) => {
  try {
    const totalItems = await InventoryItem.countDocuments({ status: 'active' });
    const totalStockValue = await InventoryItem.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$stockValue' } } },
    ]);

    const lowStockCount = await InventoryItem.countDocuments({
      $expr: { $lte: ['$quantity', '$reorderLevel'] },
      status: 'active',
    });

    const outOfStockCount = await InventoryItem.countDocuments({
      quantity: 0,
      status: 'active',
    });

    const categoryDistribution = await InventoryItem.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 }, totalValue: { $sum: '$stockValue' } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalItems,
        totalStockValue: totalStockValue[0]?.total || 0,
        lowStockCount,
        outOfStockCount,
        categoryDistribution,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory stats',
      error: error.message,
    });
  }
};

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getLowStockItems,
  getExpiringItems,
  getInventoryStats,
};
