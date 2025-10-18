const express = require('express');
const router = express.Router();
const {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getLowStockItems,
  getExpiringItems,
  getInventoryStats,
} = require('../controllers/inventoryController');

// Main CRUD routes
router.route('/')
  .get(getAllItems)
  .post(createItem);

router.route('/:id')
  .get(getItemById)
  .put(updateItem)
  .delete(deleteItem);

// Alert routes
router.get('/alerts/low-stock', getLowStockItems);
router.get('/alerts/expiring', getExpiringItems);

// Stats route
router.get('/stats/summary', getInventoryStats);

module.exports = router;
