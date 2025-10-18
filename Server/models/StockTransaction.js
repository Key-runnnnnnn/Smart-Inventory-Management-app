const mongoose = require('mongoose');

const stockTransactionSchema = new mongoose.Schema({
  // Reference to inventory item
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: [true, 'Item ID is required'],
  },
  
  // Transaction details
  type: {
    type: String,
    required: [true, 'Transaction type is required'],
    enum: ['in', 'out', 'adjustment'],
  },
  
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity must be positive'],
  },
  
  // Quantity before and after transaction
  previousQuantity: {
    type: Number,
    required: true,
  },
  
  newQuantity: {
    type: Number,
    required: true,
  },
  
  // Transaction metadata
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    enum: [
      'purchase',
      'sale',
      'return',
      'damage',
      'expired',
      'theft',
      'adjustment',
      'transfer',
      'production',
      'sample',
      'other'
    ],
  },
  
  reasonDetails: {
    type: String,
    trim: true,
  },
  
  // Reference information
  referenceNumber: {
    type: String,
    trim: true,
  },
  
  invoiceNumber: {
    type: String,
    trim: true,
  },
  
  // Party details (supplier/customer)
  party: {
    name: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['supplier', 'customer', 'other'],
    },
    contact: {
      type: String,
      trim: true,
    },
  },
  
  // Financial details
  unitPrice: {
    type: Number,
    min: [0, 'Unit price cannot be negative'],
  },
  
  totalAmount: {
    type: Number,
    min: [0, 'Total amount cannot be negative'],
  },
  
  // Additional info
  notes: {
    type: String,
    trim: true,
  },
  
  // User who performed the transaction
  performedBy: {
    type: String,
    trim: true,
    default: 'System',
  },
  
  // Transaction date
  transactionDate: {
    type: Date,
    default: Date.now,
  },
  
  // Warehouse/location info
  location: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Middleware to calculate total amount before saving
stockTransactionSchema.pre('save', function(next) {
  if (this.unitPrice && this.quantity) {
    this.totalAmount = this.unitPrice * this.quantity;
  }
  next();
});

// Index for better query performance
stockTransactionSchema.index({ itemId: 1, transactionDate: -1 });
stockTransactionSchema.index({ type: 1 });
stockTransactionSchema.index({ transactionDate: -1 });

const StockTransaction = mongoose.model('StockTransaction', stockTransactionSchema);

module.exports = StockTransaction;
