const mongoose = require('mongoose');
require('dotenv').config();
const InventoryItem = require('../models/InventoryItem');
const StockTransaction = require('../models/StockTransaction');
const connectDB = require('../config/database');

// Sample inventory items
const sampleItems = [
  {
    name: 'HP Laptop ProBook 450',
    sku: 'ELEC-LAP-HP450',
    description: '15.6" Business Laptop with Intel Core i5',
    category: 'Electronics',
    subCategory: 'Computers',
    quantity: 25,
    unit: 'pcs',
    reorderLevel: 10,
    maxStockLevel: 50,
    costPrice: 45000,
    sellingPrice: 58000,
    supplier: {
      name: 'Tech Distributors Ltd',
      contactPerson: 'Rajesh Kumar',
      phone: '+91-9876543210',
      email: 'rajesh@techdist.com',
    },
    warehouseLocation: 'Warehouse A',
    rackNumber: 'A-12',
    status: 'active',
    imageUrl: 'https://via.placeholder.com/300x200?text=HP+Laptop',
  },
  {
    name: 'Samsung Galaxy S23',
    sku: 'ELEC-MOB-SGS23',
    description: 'Latest Android smartphone with 5G',
    category: 'Electronics',
    subCategory: 'Mobile Phones',
    quantity: 8,
    unit: 'pcs',
    reorderLevel: 15,
    maxStockLevel: 100,
    costPrice: 55000,
    sellingPrice: 72000,
    supplier: {
      name: 'Mobile Masters',
      contactPerson: 'Priya Sharma',
      phone: '+91-9876543211',
      email: 'priya@mobilemasters.com',
    },
    warehouseLocation: 'Warehouse B',
    rackNumber: 'B-05',
    status: 'active',
    imageUrl: 'https://via.placeholder.com/300x200?text=Samsung+S23',
  },
  {
    name: 'Office Chair Ergonomic',
    sku: 'FURN-CHR-ERG01',
    description: 'Comfortable ergonomic office chair with lumbar support',
    category: 'Furniture',
    subCategory: 'Chairs',
    quantity: 45,
    unit: 'pcs',
    reorderLevel: 20,
    maxStockLevel: 100,
    costPrice: 3500,
    sellingPrice: 5500,
    supplier: {
      name: 'Furniture Mart',
      contactPerson: 'Amit Patel',
      phone: '+91-9876543212',
      email: 'amit@furnituremart.com',
    },
    warehouseLocation: 'Warehouse C',
    rackNumber: 'C-18',
    status: 'active',
    imageUrl: 'https://via.placeholder.com/300x200?text=Office+Chair',
  },
  {
    name: 'A4 Paper Ream (500 Sheets)',
    sku: 'STAT-PAP-A4-500',
    description: 'Premium quality A4 size paper, 80 GSM',
    category: 'Stationery',
    subCategory: 'Paper',
    quantity: 150,
    unit: 'pack',
    reorderLevel: 50,
    maxStockLevel: 500,
    costPrice: 180,
    sellingPrice: 250,
    supplier: {
      name: 'Paper Plus',
      contactPerson: 'Sunita Verma',
      phone: '+91-9876543213',
      email: 'sunita@paperplus.com',
    },
    warehouseLocation: 'Warehouse A',
    rackNumber: 'A-25',
    status: 'active',
    imageUrl: 'https://via.placeholder.com/300x200?text=A4+Paper',
  },
  {
    name: 'Paracetamol 500mg (100 Tablets)',
    sku: 'MED-TAB-PARA500',
    description: 'Pain relief and fever reducer tablets',
    category: 'Medical',
    subCategory: 'Medicines',
    quantity: 5,
    unit: 'box',
    reorderLevel: 20,
    maxStockLevel: 200,
    costPrice: 25,
    sellingPrice: 45,
    expiryDate: new Date('2025-12-31'),
    batchNumber: 'BATCH-2024-001',
    manufacturingDate: new Date('2024-06-01'),
    supplier: {
      name: 'PharmaCorp',
      contactPerson: 'Dr. Mehta',
      phone: '+91-9876543214',
      email: 'mehta@pharmacorp.com',
    },
    warehouseLocation: 'Warehouse D',
    rackNumber: 'D-02',
    status: 'active',
    imageUrl: 'https://via.placeholder.com/300x200?text=Paracetamol',
  },
  {
    name: 'Engine Oil 5W-30 (1 Liter)',
    sku: 'AUTO-OIL-5W30',
    description: 'Synthetic motor oil for petrol engines',
    category: 'Automotive',
    subCategory: 'Lubricants',
    quantity: 80,
    unit: 'ltr',
    reorderLevel: 30,
    maxStockLevel: 200,
    costPrice: 320,
    sellingPrice: 450,
    supplier: {
      name: 'Auto Parts India',
      contactPerson: 'Karan Singh',
      phone: '+91-9876543215',
      email: 'karan@autopartsindia.com',
    },
    warehouseLocation: 'Warehouse E',
    rackNumber: 'E-10',
    status: 'active',
    imageUrl: 'https://via.placeholder.com/300x200?text=Engine+Oil',
  },
  {
    name: 'Men\'s Cotton T-Shirt',
    sku: 'CLO-TSH-MCOT-L',
    description: 'Casual round neck cotton t-shirt, Size L',
    category: 'Clothing',
    subCategory: 'T-Shirts',
    quantity: 120,
    unit: 'pcs',
    reorderLevel: 40,
    maxStockLevel: 300,
    costPrice: 150,
    sellingPrice: 399,
    supplier: {
      name: 'Fashion Textiles',
      contactPerson: 'Neha Kapoor',
      phone: '+91-9876543216',
      email: 'neha@fashiontextiles.com',
    },
    warehouseLocation: 'Warehouse B',
    rackNumber: 'B-22',
    status: 'active',
    imageUrl: 'https://via.placeholder.com/300x200?text=T-Shirt',
  },
  {
    name: 'Basmati Rice (5kg)',
    sku: 'FOOD-RIC-BAS-5KG',
    description: 'Premium aged basmati rice',
    category: 'Food',
    subCategory: 'Grains',
    quantity: 95,
    unit: 'pack',
    reorderLevel: 30,
    maxStockLevel: 250,
    costPrice: 280,
    sellingPrice: 450,
    expiryDate: new Date('2026-03-31'),
    manufacturingDate: new Date('2024-04-01'),
    supplier: {
      name: 'Grain Traders',
      contactPerson: 'Vikram Reddy',
      phone: '+91-9876543217',
      email: 'vikram@graintraders.com',
    },
    warehouseLocation: 'Warehouse F',
    rackNumber: 'F-08',
    status: 'active',
    imageUrl: 'https://via.placeholder.com/300x200?text=Basmati+Rice',
  },
  {
    name: 'Whiteboard Marker (Pack of 10)',
    sku: 'STAT-MKR-WB-10',
    description: 'Dry erase markers, assorted colors',
    category: 'Stationery',
    subCategory: 'Writing Tools',
    quantity: 3,
    unit: 'pack',
    reorderLevel: 15,
    maxStockLevel: 100,
    costPrice: 120,
    sellingPrice: 199,
    supplier: {
      name: 'Office Supplies Co',
      contactPerson: 'Anita Desai',
      phone: '+91-9876543218',
      email: 'anita@officesupplies.com',
    },
    warehouseLocation: 'Warehouse A',
    rackNumber: 'A-30',
    status: 'active',
    imageUrl: 'https://via.placeholder.com/300x200?text=Markers',
  },
  {
    name: 'LED Bulb 9W (Pack of 4)',
    sku: 'ELEC-BUL-LED9W',
    description: 'Energy efficient LED bulbs, cool white',
    category: 'Electronics',
    subCategory: 'Lighting',
    quantity: 0,
    unit: 'pack',
    reorderLevel: 25,
    maxStockLevel: 150,
    costPrice: 180,
    sellingPrice: 299,
    supplier: {
      name: 'Lighting Solutions',
      contactPerson: 'Ravi Kumar',
      phone: '+91-9876543219',
      email: 'ravi@lightingsolutions.com',
    },
    warehouseLocation: 'Warehouse A',
    rackNumber: 'A-08',
    status: 'active',
    imageUrl: 'https://via.placeholder.com/300x200?text=LED+Bulb',
  },
  {
    name: 'Surgical Masks (Box of 50)',
    sku: 'MED-MSK-SURG50',
    description: '3-ply disposable surgical face masks',
    category: 'Medical',
    subCategory: 'PPE',
    quantity: 12,
    unit: 'box',
    reorderLevel: 30,
    maxStockLevel: 200,
    costPrice: 180,
    sellingPrice: 299,
    expiryDate: new Date('2025-11-15'),
    batchNumber: 'BATCH-2024-MSK-045',
    manufacturingDate: new Date('2024-05-15'),
    supplier: {
      name: 'MediCare Supplies',
      contactPerson: 'Dr. Gupta',
      phone: '+91-9876543220',
      email: 'gupta@medicare.com',
    },
    warehouseLocation: 'Warehouse D',
    rackNumber: 'D-15',
    status: 'active',
    imageUrl: 'https://via.placeholder.com/300x200?text=Surgical+Masks',
  },
  {
    name: 'Wooden Desk (Large)',
    sku: 'FURN-DSK-WD-LG',
    description: 'Large wooden office desk with drawers',
    category: 'Furniture',
    subCategory: 'Desks',
    quantity: 18,
    unit: 'pcs',
    reorderLevel: 8,
    maxStockLevel: 40,
    costPrice: 8500,
    sellingPrice: 13500,
    supplier: {
      name: 'Furniture Mart',
      contactPerson: 'Amit Patel',
      phone: '+91-9876543212',
      email: 'amit@furnituremart.com',
    },
    warehouseLocation: 'Warehouse C',
    rackNumber: 'C-05',
    status: 'active',
    imageUrl: 'https://via.placeholder.com/300x200?text=Wooden+Desk',
  },
];

// Function to seed database
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await InventoryItem.deleteMany({});
    await StockTransaction.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Insert inventory items
    console.log('📦 Inserting inventory items...');
    const items = await InventoryItem.insertMany(sampleItems);
    console.log(`✅ ${items.length} inventory items created\n`);

    // Create sample transactions for some items
    console.log('📝 Creating sample transactions...');
    const transactions = [];

    // Transaction 1: Stock IN for Samsung phone
    transactions.push({
      itemId: items[1]._id, // Samsung Galaxy S23
      type: 'in',
      quantity: 50,
      previousQuantity: 0,
      newQuantity: 50,
      reason: 'purchase',
      reasonDetails: 'Initial stock purchase',
      invoiceNumber: 'INV-2024-001',
      unitPrice: 55000,
      totalAmount: 2750000,
      party: {
        name: 'Mobile Masters',
        type: 'supplier',
        contact: '+91-9876543211',
      },
      performedBy: 'Admin',
      transactionDate: new Date('2024-09-01'),
    });

    // Transaction 2: Stock OUT for Samsung phone (Sale)
    transactions.push({
      itemId: items[1]._id,
      type: 'out',
      quantity: 42,
      previousQuantity: 50,
      newQuantity: 8,
      reason: 'sale',
      reasonDetails: 'Sold to retail customers',
      unitPrice: 72000,
      totalAmount: 3024000,
      party: {
        name: 'Various Customers',
        type: 'customer',
      },
      performedBy: 'Sales Team',
      transactionDate: new Date('2024-09-15'),
    });

    // Transaction 3: Stock IN for Office Chair
    transactions.push({
      itemId: items[2]._id, // Office Chair
      type: 'in',
      quantity: 60,
      previousQuantity: 0,
      newQuantity: 60,
      reason: 'purchase',
      invoiceNumber: 'INV-2024-002',
      unitPrice: 3500,
      totalAmount: 210000,
      party: {
        name: 'Furniture Mart',
        type: 'supplier',
        contact: '+91-9876543212',
      },
      performedBy: 'Admin',
      transactionDate: new Date('2024-08-20'),
    });

    // Transaction 4: Stock OUT for Office Chair (Sale)
    transactions.push({
      itemId: items[2]._id,
      type: 'out',
      quantity: 15,
      previousQuantity: 60,
      newQuantity: 45,
      reason: 'sale',
      reasonDetails: 'Corporate order',
      unitPrice: 5500,
      totalAmount: 82500,
      party: {
        name: 'ABC Corporation',
        type: 'customer',
        contact: '+91-8888888888',
      },
      performedBy: 'Sales Team',
      transactionDate: new Date('2024-09-10'),
    });

    // Transaction 5: Stock adjustment for Paracetamol (damaged goods)
    transactions.push({
      itemId: items[4]._id, // Paracetamol
      type: 'out',
      quantity: 15,
      previousQuantity: 20,
      newQuantity: 5,
      reason: 'damage',
      reasonDetails: 'Water damage in warehouse',
      performedBy: 'Warehouse Manager',
      transactionDate: new Date('2024-10-01'),
    });

    // Transaction 6: Stock IN for LED Bulbs (initially had 30, all sold out)
    transactions.push({
      itemId: items[9]._id, // LED Bulb
      type: 'in',
      quantity: 30,
      previousQuantity: 0,
      newQuantity: 30,
      reason: 'purchase',
      invoiceNumber: 'INV-2024-003',
      unitPrice: 180,
      totalAmount: 5400,
      party: {
        name: 'Lighting Solutions',
        type: 'supplier',
        contact: '+91-9876543219',
      },
      performedBy: 'Admin',
      transactionDate: new Date('2024-08-15'),
    });

    transactions.push({
      itemId: items[9]._id,
      type: 'out',
      quantity: 30,
      previousQuantity: 30,
      newQuantity: 0,
      reason: 'sale',
      reasonDetails: 'Bulk sale to retailer',
      unitPrice: 299,
      totalAmount: 8970,
      party: {
        name: 'XYZ Retail',
        type: 'customer',
      },
      performedBy: 'Sales Team',
      transactionDate: new Date('2024-09-20'),
    });

    // Transaction 7: Stock IN for Whiteboard Markers
    transactions.push({
      itemId: items[8]._id, // Whiteboard Marker
      type: 'in',
      quantity: 25,
      previousQuantity: 0,
      newQuantity: 25,
      reason: 'purchase',
      invoiceNumber: 'INV-2024-004',
      unitPrice: 120,
      totalAmount: 3000,
      party: {
        name: 'Office Supplies Co',
        type: 'supplier',
        contact: '+91-9876543218',
      },
      performedBy: 'Admin',
      transactionDate: new Date('2024-09-05'),
    });

    transactions.push({
      itemId: items[8]._id,
      type: 'out',
      quantity: 22,
      previousQuantity: 25,
      newQuantity: 3,
      reason: 'sale',
      unitPrice: 199,
      totalAmount: 4378,
      performedBy: 'Sales Team',
      transactionDate: new Date('2024-10-10'),
    });

    const createdTransactions = await StockTransaction.insertMany(transactions);
    console.log(`✅ ${createdTransactions.length} transactions created\n`);

    // Display summary
    console.log('📊 SEEDING SUMMARY:');
    console.log('═══════════════════════════════════════');
    console.log(`Total Inventory Items: ${items.length}`);
    console.log(`Total Transactions: ${createdTransactions.length}`);

    const categories = await InventoryItem.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    console.log('\nItems by Category:');
    categories.forEach(cat => {
      console.log(`  - ${cat._id}: ${cat.count} items`);
    });

    const lowStockItems = items.filter(item => item.quantity <= item.reorderLevel);
    console.log(`\n⚠️  Low Stock Items: ${lowStockItems.length}`);
    lowStockItems.forEach(item => {
      console.log(`  - ${item.name} (${item.sku}): ${item.quantity} ${item.unit}`);
    });

    const outOfStockItems = items.filter(item => item.quantity === 0);
    console.log(`\n🚫 Out of Stock Items: ${outOfStockItems.length}`);
    outOfStockItems.forEach(item => {
      console.log(`  - ${item.name} (${item.sku})`);
    });

    console.log('\n✨ Database seeding completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
