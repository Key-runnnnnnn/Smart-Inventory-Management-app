const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    uppercase: true,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    trim: true,
  },
  
  // Categorization
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Electronics', 'Clothing', 'Food', 'Furniture', 'Stationery', 'Medical', 'Automotive', 'Other'],
  },
  subCategory: {
    type: String,
    trim: true,
  },
  
  // Stock Information
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0,
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['pcs', 'kg', 'ltr', 'box', 'pack', 'dozen', 'meter'],
    default: 'pcs',
  },
  reorderLevel: {
    type: Number,
    required: [true, 'Reorder level is required'],
    min: [0, 'Reorder level cannot be negative'],
    default: 10,
  },
  maxStockLevel: {
    type: Number,
    min: [0, 'Max stock level cannot be negative'],
  },
  
  // Pricing
  costPrice: {
    type: Number,
    required: [true, 'Cost price is required'],
    min: [0, 'Cost price cannot be negative'],
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Selling price is required'],
    min: [0, 'Selling price cannot be negative'],
  },
  
  // Supplier Information
  supplier: {
    name: {
      type: String,
      trim: true,
    },
    contactPerson: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  
  // Location & Storage
  warehouseLocation: {
    type: String,
    trim: true,
  },
  rackNumber: {
    type: String,
    trim: true,
  },
  
  // Expiry & Batch
  expiryDate: {
    type: Date,
  },
  batchNumber: {
    type: String,
    trim: true,
  },
  manufacturingDate: {
    type: Date,
  },
  
  // Status & Tracking
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active',
  },
  
  // Computed fields
  stockValue: {
    type: Number,
    default: 0,
  },
  
  // Image
  imageUrl: {
    type: String,
    trim: true,
  },
  
  // Metadata
  lastRestocked: {
    type: Date,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for stock status
inventoryItemSchema.virtual('stockStatus').get(function() {
  if (this.quantity === 0) return 'out-of-stock';
  if (this.quantity <= this.reorderLevel) return 'low-stock';
  if (this.maxStockLevel && this.quantity >= this.maxStockLevel) return 'overstock';
  return 'in-stock';
});

// Virtual for expiry status
inventoryItemSchema.virtual('expiryStatus').get(function() {
  if (!this.expiryDate) return null;
  
  const today = new Date();
  const daysUntilExpiry = Math.ceil((this.expiryDate - today) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 7) return 'expiring-soon';
  if (daysUntilExpiry <= 30) return 'expiring-this-month';
  return 'valid';
});

// Middleware to calculate stock value before saving
inventoryItemSchema.pre('save', function(next) {
  this.stockValue = this.quantity * this.costPrice;
  next();
});

// Index for better query performance
inventoryItemSchema.index({ category: 1, status: 1 });
inventoryItemSchema.index({ name: 'text', description: 'text' });

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

module.exports = InventoryItem;
