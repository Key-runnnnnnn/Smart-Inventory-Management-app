const alertService = require('../services/alertService');

/**
 * Initialize Socket.io for real-time inventory updates
 */
const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Join room for inventory updates
    socket.on('join:inventory', () => {
      socket.join('inventory-updates');
      console.log(`📦 Client ${socket.id} joined inventory updates room`);
      socket.emit('joined', { room: 'inventory-updates' });
    });

    // Join room for alerts
    socket.on('join:alerts', () => {
      socket.join('alerts');
      console.log(`🔔 Client ${socket.id} joined alerts room`);
      socket.emit('joined', { room: 'alerts' });
    });

    // Join room for specific item updates
    socket.on('join:item', (itemId) => {
      socket.join(`item:${itemId}`);
      console.log(`📊 Client ${socket.id} joined item ${itemId} updates`);
      socket.emit('joined', { room: `item:${itemId}` });
    });

    // Request current alert summary
    socket.on('request:alerts', async () => {
      try {
        const alerts = await alertService.getAllAlerts();
        socket.emit('alerts:update', alerts);
      } catch (error) {
        socket.emit('error', { message: 'Failed to fetch alerts' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Emit inventory update event
 */
const emitInventoryUpdate = (io, item, action) => {
  io.to('inventory-updates').emit('inventory:update', {
    action, // 'created', 'updated', 'deleted'
    item: {
      id: item._id,
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      stockStatus: item.stockStatus,
      stockValue: item.stockValue,
    },
    timestamp: new Date(),
  });

  // Also emit to specific item room
  io.to(`item:${item._id}`).emit('item:update', {
    action,
    item,
    timestamp: new Date(),
  });
};

/**
 * Emit stock transaction event
 */
const emitStockTransaction = (io, transaction, item) => {
  io.to('inventory-updates').emit('transaction:new', {
    transaction: {
      id: transaction._id,
      type: transaction.type,
      quantity: transaction.quantity,
      previousQuantity: transaction.previousQuantity,
      newQuantity: transaction.newQuantity,
      reason: transaction.reason,
    },
    item: {
      id: item._id,
      name: item.name,
      sku: item.sku,
      currentQuantity: item.quantity,
    },
    timestamp: new Date(),
  });

  // Emit to specific item room
  io.to(`item:${item._id}`).emit('transaction:new', {
    transaction,
    item,
    timestamp: new Date(),
  });
};

/**
 * Emit alert event
 */
const emitAlert = (io, alert) => {
  io.to('alerts').emit('alert:new', {
    alert,
    timestamp: new Date(),
  });
};

/**
 * Emit low stock alert
 */
const emitLowStockAlert = (io, item) => {
  const alert = {
    type: 'low-stock',
    severity: item.quantity === 0 ? 'critical' : 'warning',
    item: {
      id: item._id,
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      reorderLevel: item.reorderLevel,
    },
    message: `${item.name} is ${item.quantity === 0 ? 'out of stock' : 'running low'}`,
  };

  io.to('alerts').emit('alert:low-stock', alert);
  emitAlert(io, alert);
};

/**
 * Broadcast alert summary update
 */
const broadcastAlertSummary = async (io) => {
  try {
    const summary = await alertService.getAlertSummary();
    io.to('alerts').emit('alerts:summary', {
      summary,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error broadcasting alert summary:', error);
  }
};

module.exports = {
  initializeSocket,
  emitInventoryUpdate,
  emitStockTransaction,
  emitAlert,
  emitLowStockAlert,
  broadcastAlertSummary,
};
