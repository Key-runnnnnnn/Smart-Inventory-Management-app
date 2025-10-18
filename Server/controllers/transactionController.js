const StockTransaction = require('../models/StockTransaction');
const InventoryItem = require('../models/InventoryItem');
const mongoose = require('mongoose');
const { emitStockTransaction, emitInventoryUpdate, emitLowStockAlert } = require('../sockets/inventorySocket');

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Public
const getAllTransactions = async (req, res) => {
  try {
    const {
      itemId,
      type,
      reason,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    // Build filter object
    const filter = {};

    if (itemId) filter.itemId = itemId;
    if (type) filter.type = type;
    if (reason) filter.reason = reason;

    if (startDate || endDate) {
      filter.transactionDate = {};
      if (startDate) filter.transactionDate.$gte = new Date(startDate);
      if (endDate) filter.transactionDate.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactions = await StockTransaction.find(filter)
      .populate('itemId', 'name sku category')
      .sort({ transactionDate: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await StockTransaction.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message,
    });
  }
};

// @desc    Get transactions for a specific item
// @route   GET /api/transactions/item/:itemId
// @access  Public
const getItemTransactions = async (req, res) => {
  try {
    const transactions = await StockTransaction.find({
      itemId: req.params.itemId
    })
      .sort({ transactionDate: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching item transactions',
      error: error.message,
    });
  }
};

// @desc    Create stock IN transaction
// @route   POST /api/transactions/stock-in
// @access  Public
const stockIn = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { itemId, quantity, reason, ...transactionData } = req.body;

    // Validate item exists
    const item = await InventoryItem.findById(itemId).session(session);
    if (!item) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    // Record previous quantity
    const previousQuantity = item.quantity;
    const newQuantity = previousQuantity + parseInt(quantity);

    // Update item quantity
    item.quantity = newQuantity;
    item.lastRestocked = new Date();
    await item.save({ session });

    // Create transaction record
    const transaction = await StockTransaction.create([{
      itemId,
      type: 'in',
      quantity: parseInt(quantity),
      previousQuantity,
      newQuantity,
      reason,
      ...transactionData,
    }], { session });

    await session.commitTransaction();

    // Emit WebSocket event
    const io = req.app.get('io');
    if (io) {
      emitStockTransaction(io, transaction[0], item);
      emitInventoryUpdate(io, item, 'updated');
    }

    res.status(201).json({
      success: true,
      message: 'Stock added successfully',
      data: {
        transaction: transaction[0],
        updatedItem: item,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      success: false,
      message: 'Error adding stock',
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// @desc    Create stock OUT transaction
// @route   POST /api/transactions/stock-out
// @access  Public
const stockOut = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { itemId, quantity, reason, ...transactionData } = req.body;

    // Validate item exists
    const item = await InventoryItem.findById(itemId).session(session);
    if (!item) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    // Check if sufficient stock available
    if (item.quantity < parseInt(quantity)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${item.quantity}, Requested: ${quantity}`,
      });
    }

    // Record previous quantity
    const previousQuantity = item.quantity;
    const newQuantity = previousQuantity - parseInt(quantity);

    // Update item quantity
    item.quantity = newQuantity;
    await item.save({ session });

    // Create transaction record
    const transaction = await StockTransaction.create([{
      itemId,
      type: 'out',
      quantity: parseInt(quantity),
      previousQuantity,
      newQuantity,
      reason,
      ...transactionData,
    }], { session });

    await session.commitTransaction();

    // Emit WebSocket event
    const io = req.app.get('io');
    if (io) {
      emitStockTransaction(io, transaction[0], item);
      emitInventoryUpdate(io, item, 'updated');

      // Check for low stock and emit alert
      if (item.quantity <= item.reorderLevel) {
        emitLowStockAlert(io, item);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Stock removed successfully',
      data: {
        transaction: transaction[0],
        updatedItem: item,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      success: false,
      message: 'Error removing stock',
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// @desc    Stock adjustment (manual correction)
// @route   POST /api/transactions/adjustment
// @access  Public
const stockAdjustment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { itemId, newQuantity, reason, ...transactionData } = req.body;

    // Validate item exists
    const item = await InventoryItem.findById(itemId).session(session);
    if (!item) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    const previousQuantity = item.quantity;
    const quantityDifference = Math.abs(newQuantity - previousQuantity);

    // Update item quantity
    item.quantity = parseInt(newQuantity);
    await item.save({ session });

    // Create transaction record
    const transaction = await StockTransaction.create([{
      itemId,
      type: 'adjustment',
      quantity: quantityDifference,
      previousQuantity,
      newQuantity: parseInt(newQuantity),
      reason: reason || 'adjustment',
      ...transactionData,
    }], { session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: 'Stock adjusted successfully',
      data: {
        transaction: transaction[0],
        updatedItem: item,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      success: false,
      message: 'Error adjusting stock',
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats
// @access  Public
const getTransactionStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};

    if (startDate || endDate) {
      dateFilter.transactionDate = {};
      if (startDate) dateFilter.transactionDate.$gte = new Date(startDate);
      if (endDate) dateFilter.transactionDate.$lte = new Date(endDate);
    }

    const stats = await StockTransaction.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
    ]);

    const recentTransactions = await StockTransaction.find()
      .populate('itemId', 'name sku')
      .sort({ transactionDate: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        stats,
        recentTransactions,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction stats',
      error: error.message,
    });
  }
};

module.exports = {
  getAllTransactions,
  getItemTransactions,
  stockIn,
  stockOut,
  stockAdjustment,
  getTransactionStats,
};
