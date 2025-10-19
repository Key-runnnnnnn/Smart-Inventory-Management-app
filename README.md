# InventoryPro - Smart Inventory Management System

A comprehensive, AI-powered inventory management system built with Next.js 15, Node.js, MongoDB, and Google Gemini AI.

## 🚀 Features

### 1. **Inventory Management**

- Complete CRUD operations for inventory items
- Real-time stock level tracking
- Low stock alerts and notifications
- Batch and expiry date tracking
- Warehouse location management
- Stock in/out transactions with detailed logging

### 2. **Analytics & Insights**

- Interactive dashboards with Recharts
- Category-wise distribution analysis
- Top performing and slow-moving items
- Inventory turnover analysis
- Sales and value trend visualization
- Real-time KPI monitoring

### 3. **Smart Alerts System**

- Low stock alerts (critical, warning, info)
- Near expiry and expired item notifications
- Overstock warnings
- Real-time WebSocket updates
- Customizable alert thresholds

### 4. **AI-Powered Forecasting**

- Demand prediction using Google Gemini AI
- Historical data analysis
- Trend detection and seasonality analysis
- Reorder point recommendations
- Natural language AI chat assistant

### 5. **Transaction Management**

- Complete transaction history
- Stock in/out tracking
- Adjustment logging
- Party (supplier/customer) details
- Reference number tracking
- Financial reporting

### 6. **Reports & Export**

- Monthly performance reports
- Sales comparison analysis
- CSV/PDF export for inventory
- Transaction history export
- Top selling items reports
- Profit margin calculations

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client
- **Icons**: Lucide React
- **Utilities**: date-fns, clsx, tailwind-merge

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose 8.19.1
- **AI/ML**: Google Generative AI (Gemini Pro)
- **Real-time**: Socket.io
- **Export**: json2csv, PDFKit
- **Environment**: dotenv 17.2.3

## 📦 Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB
- Google Gemini API key

### Backend Setup

1. Navigate to the Server directory:

```bash
cd Server
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

4. Seed the database (optional):

```bash
node scripts/seed.js
```

5. Start the server:

```bash
npm start
# or for development with nodemon
npm run dev
```

### Frontend Setup

1. Navigate to the Client directory:

```bash
cd Client
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
Inventory-Management/
├── Client/                      # Next.js Frontend
│   ├── app/                     # App Router pages
│   │   ├── page.tsx            # Dashboard
│   │   ├── inventory/          # Inventory management
│   │   ├── transactions/       # Transaction history
│   │   ├── analytics/          # Analytics & charts
│   │   ├── alerts/             # Alert center
│   │   ├── forecasting/        # AI forecasting
│   │   └── reports/            # Reports & exports
│   ├── components/             # React components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── inventory/          # Inventory components
│   ├── lib/                    # Utilities
│   │   ├── api.ts              # API client
│   │   ├── socket.ts           # WebSocket client
│   │   └── utils.ts            # Helper functions
│   └── types/                  # TypeScript types
│
└── Server/                      # Node.js Backend
    ├── controllers/             # Request handlers
    │   ├── inventoryController.js
    │   ├── transactionController.js
    │   ├── analyticsController.js
    │   ├── alertController.js
    │   ├── forecastController.js
    │   └── reportController.js
    ├── models/                  # MongoDB schemas
    │   ├── InventoryItem.js
    │   └── StockTransaction.js
    ├── routes/                  # API routes
    ├── services/                # Business logic
    │   ├── alertService.js
    │   ├── forecastService.js
    │   └── reportService.js
    ├── sockets/                 # WebSocket handlers
    │   └── inventorySocket.js
    ├── config/                  # Configuration
    │   └── database.js
    └── scripts/                 # Utility scripts
        └── seed.js              # Database seeder
```

## 🔌 API Endpoints

### Inventory (8 endpoints)

- `GET /api/inventory` - Get all items with filters
- `GET /api/inventory/:id` - Get item by ID
- `POST /api/inventory` - Create new item
- `PUT /api/inventory/:id` - Update item
- `DELETE /api/inventory/:id` - Delete item
- `GET /api/inventory/low-stock` - Get low stock items
- `GET /api/inventory/expiring` - Get expiring items
- `GET /api/inventory/stats` - Get inventory statistics

### Transactions (6 endpoints)

- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/item/:itemId` - Get item transactions
- `POST /api/transactions/stock-in` - Add stock
- `POST /api/transactions/stock-out` - Remove stock
- `POST /api/transactions/adjustment` - Adjust stock
- `GET /api/transactions/stats` - Get transaction stats

### Analytics (6 endpoints)

- `GET /api/analytics/dashboard` - Dashboard analytics
- `GET /api/analytics/top-performing` - Top items
- `GET /api/analytics/slow-moving` - Slow moving items
- `GET /api/analytics/turnover` - Inventory turnover
- `GET /api/analytics/sales-trends` - Sales trends
- `GET /api/analytics/value-trends` - Value trends

### Alerts (6 endpoints)

- `GET /api/alerts` - Get all alerts
- `GET /api/alerts/summary` - Alert summary
- `GET /api/alerts/low-stock` - Low stock alerts
- `GET /api/alerts/near-expiry` - Near expiry alerts
- `GET /api/alerts/expired` - Expired alerts
- `GET /api/alerts/overstock` - Overstock alerts

### Forecasting (4 endpoints)

- `POST /api/forecast/item/:itemId` - Forecast demand
- `POST /api/forecast/ai-suggestions` - AI restock suggestions
- `POST /api/forecast/batch` - Batch forecast
- `GET /api/forecast/historical/:itemId` - Historical data

### Reports (5 endpoints)

- `GET /api/reports/export/inventory/csv` - Export inventory CSV
- `GET /api/reports/export/inventory/pdf` - Export inventory PDF
- `GET /api/reports/export/transactions/csv` - Export transactions
- `GET /api/reports/monthly/:year/:month` - Monthly report
- `GET /api/reports/sales-comparison` - Sales comparison

## 🎨 Key Features in Detail

### Real-time Updates

- WebSocket integration for instant notifications
- Live stock level updates across all clients
- Real-time alert system
- Automatic dashboard refresh

### AI Forecasting

- Powered by Google Gemini Pro
- Analyzes historical transaction data
- Provides demand predictions with confidence levels
- Trend and seasonality detection
- Natural language chat interface for restock queries

### Advanced Analytics

- Interactive charts using Recharts
- Category distribution pie charts
- Sales trends line charts
- Inventory turnover bar charts
- Top/slow-moving item analysis

### Comprehensive Reporting

- Monthly performance summaries
- Sales comparison across periods
- Profit margin calculations
- Export to CSV and PDF formats

## 🔐 Environment Variables

### Server (.env)

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### Client (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## 📊 Database Schema

### InventoryItem

- Basic info: name, SKU, description
- Categorization: category, subCategory
- Stock: quantity, unit, reorderPoint, maxStockLevel
- Pricing: unitPrice, sellingPrice, stockValue
- Supplier: supplierName, supplierContact
- Location: location (warehouse/rack)
- Batch: batchNumber, manufacturingDate, expiryDate
- Status: isActive, stockStatus, expiryStatus

### StockTransaction

- Transaction info: type (in/out/adjustment), quantity
- References: itemId, reason, referenceNumber
- Party: partyName, partyContact, partyType
- Financial: unitCost, totalAmount
- Tracking: performedBy, transactionDate, notes

## 🚦 Getting Started Guide

1. **Clone the repository**
2. **Setup MongoDB**: Create a database and get connection string
3. **Get Gemini API Key**: Sign up at Google AI Studio
4. **Configure environment variables** in both Client and Server
5. **Install dependencies** for both frontend and backend
6. **Seed the database** with sample data (optional)
7. **Start the backend server** (port 5000)
8. **Start the frontend dev server** (port 3000)
9. **Access the application** at http://localhost:3000

## 🧪 Testing the Application

### Sample Operations:

1. **Add Inventory**: Create new items with all details
2. **Stock In**: Add stock using the transaction modal
3. **Stock Out**: Remove stock for sales
4. **View Analytics**: Check dashboard and charts
5. **Generate Forecast**: Use AI to predict demand
6. **Check Alerts**: Monitor low stock and expiry alerts
7. **Export Reports**: Download CSV/PDF reports

## 📝 API Documentation

Full API documentation is available in:

- `Server/API_DOCUMENTATION_COMPLETE.md` - Detailed endpoint documentation
- `Server/BACKEND_SUMMARY.md` - Backend architecture overview

## 🤝 Contributing

This is a complete full-stack application. Feel free to fork and customize for your needs.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- MongoDB for the flexible database
- Google for Gemini AI capabilities
- Recharts for beautiful visualizations
- The open-source community

## 📞 Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ using Next.js, Node.js, MongoDB, and Google Gemini AI**
