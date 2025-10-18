export interface InventoryItem {
  _id: string;
  name: string;
  sku: string;
  description?: string;
  category: string;
  subCategory?: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  maxStockLevel?: number;
  costPrice: number;
  sellingPrice: number;
  supplier?: {
    name: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
  };
  warehouseLocation?: string;
  rackNumber?: string;
  expiryDate?: Date;
  batchNumber?: string;
  manufacturingDate?: Date;
  status: "active" | "inactive" | "discontinued";
  stockValue: number;
  imageUrl?: string;
  lastRestocked?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  stockStatus?: "out-of-stock" | "low-stock" | "in-stock" | "overstock";
  expiryStatus?: "expired" | "expiring-soon" | "expiring-this-month" | "valid";
}

export interface StockTransaction {
  _id: string;
  itemId: string | InventoryItem;
  type: "in" | "out" | "adjustment";
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  reasonDetails?: string;
  referenceNumber?: string;
  invoiceNumber?: string;
  party?: {
    name: string;
    type: "supplier" | "customer" | "other";
    contact?: string;
  };
  unitPrice?: number;
  totalAmount?: number;
  notes?: string;
  performedBy: string;
  transactionDate: Date;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Alert {
  id: string;
  type: "low-stock" | "near-expiry" | "expired" | "overstock";
  severity: "critical" | "warning" | "info";
  item: {
    id: string;
    name: string;
    sku: string;
    category: string;
    currentQuantity: number;
    reorderLevel?: number;
    unit: string;
    imageUrl?: string;
    expiryDate?: Date;
    batchNumber?: string;
    maxStockLevel?: number;
    stockValue?: number;
  };
  message: string;
  createdAt: Date;
  stockDifference?: number;
  daysUntilExpiry?: number;
  daysExpired?: number;
  expiryDate?: Date;
  overstockQuantity?: number;
  overstockPercentage?: number;
}

export interface DashboardAnalytics {
  overview: {
    totalStockValue: number;
    totalItems: number;
    totalQuantity: number;
    lowStockCount: number;
    outOfStockCount: number;
    overstockCount: number;
  };
  categoryDistribution: {
    _id: string;
    count: number;
    totalValue: number;
    totalQuantity: number;
  }[];
  recentActivity: {
    _id: string;
    count: number;
    totalQuantity: number;
  }[];
}

export interface Forecast {
  itemId: string;
  itemName: string;
  sku: string;
  category: string;
  currentStock: number;
  reorderLevel: number;
  unit: string;
  forecastPeriod: string;
  forecastMethod: string;
  forecast: {
    predictedDemand: number;
    dailyAverageForecast: number;
    confidence: "low" | "medium" | "high";
    trend: "increasing" | "stable" | "decreasing";
    seasonalityDetected: boolean;
    recommendedReorderQuantity: number;
    recommendedReorderPoint: number;
    insights: string;
    risks: string;
  };
  statistics: {
    totalSales: string;
    avgDailySales: string;
    sma7: string;
    sma30: string;
  };
  generatedAt: Date;
}

export interface MonthlyReport {
  period: {
    year: number;
    month: number;
    monthName: string;
    startDate: Date;
    endDate: Date;
  };
  sales: {
    totalRevenue: number;
    totalItemsSold: number;
    transactionCount: number;
  };
  purchases: {
    totalCost: number;
    totalItemsPurchased: number;
    transactionCount: number;
  };
  profitability: {
    grossProfit: number;
    margin: string;
  };
  topSellingItems: {
    name: string;
    sku: string;
    quantity: number;
    revenue: number;
  }[];
  currentInventoryValue: number;
  totalTransactions: number;
}

export type Category =
  | "Electronics"
  | "Clothing"
  | "Food & Beverage"
  | "Furniture"
  | "Raw Materials"
  | "Finished Goods"
  | "Office Supplies"
  | "Other";

export type Unit =
  | "pcs"
  | "kg"
  | "ltr"
  | "box"
  | "carton"
  | "bag"
  | "roll"
  | "meter";

export type TransactionReason =
  | "purchase"
  | "sale"
  | "return"
  | "damage"
  | "expired"
  | "theft"
  | "adjustment"
  | "transfer"
  | "production"
  | "sample"
  | "other";
