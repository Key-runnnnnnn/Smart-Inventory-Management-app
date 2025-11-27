# StockSense AI - Smart Inventory Management System

A comprehensive, AI-powered inventory management system built with Next.js 15, Flask (Python), MongoDB, and Google Gemini 2.0 Flash AI.

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

- **Language**: Python 3.11+
- **Framework**: Flask 3.0.0
- **Database**: MongoDB with PyMongo 4.6.1
- **AI/ML**: Google Generative AI (Gemini 2.0 Flash Experimental)
- **Real-time**: Flask-SocketIO 5.3.5
- **Export**: ReportLab 4.0.7
- **Environment**: python-dotenv 1.0.0

## 📦 Installation

### Prerequisites

- Python 3.11 or higher
- MongoDB Atlas account or local MongoDB
- Google Gemini API key (from https://aistudio.google.com/apikey)
- Node.js (v18 or higher) for frontend only

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Create a virtual environment:

```bash
python -m venv venv

# Activate on Windows:
venv\Scripts\activate

# Activate on Linux/Mac:
source venv/bin/activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create a `.env` file:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:3000
SECRET_KEY=your_secret_key_here
```

5. Start the Flask server:

```bash
python app.py
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
Smart-Inventory-Management-app/
├── Client/                      # Next.js Frontend
│   ├── app/                     # App Router pages
│   │   ├── page.tsx            # Dashboard
│   │   ├── inventory/          # Inventory management
│   │   ├── transactions/       # Transaction history
│   │   ├── analytics/          # Analytics & charts
│   │   ├── alerts/             # Alert center
│   │   ├── forecasting/        # AI forecasting (with modal)
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
└── backend/                     # Flask Backend (Python)
    ├── app.py                   # Main application entry
    ├── requirements.txt         # Python dependencies
    ├── config/                  # Configuration
    │   └── database.py          # MongoDB connection
    ├── models/                  # MongoDB models
    │   ├── inventory_item.py    # InventoryItem model
    │   └── stock_transaction.py # StockTransaction model
    ├── routes/                  # API routes (Blueprints)
    │   ├── inventory_routes.py
    │   ├── transaction_routes.py
    │   ├── analytics_routes.py
    │   ├── alert_routes.py
    │   ├── forecast_routes.py
    │   └── report_routes.py
    ├── services/                # Business logic
    │   ├── alert_service.py
    │   ├── forecast_service.py  # AI forecasting with fallback
    │   └── report_service.py
    └── sockets/                 # WebSocket handlers
        └── inventory_socket.py
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
- `GET /api/transactions/stats/summary` - Get transaction stats

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

### Forecasting (3 endpoints)

- `POST /api/forecast/demand/:itemId` - Forecast demand with AI
- `POST /api/forecast/restock-suggestions` - AI restock suggestions
- `POST /api/forecast/chat` - AI chat assistant for inventory queries

**Note**: AI forecasting includes fallback methods if Gemini API key is invalid or unavailable. Fallback provides statistical analysis based on historical data.

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

- Powered by Google Gemini 2.0 Flash Experimental
- Analyzes historical transaction data
- Provides demand predictions with confidence levels
- Trend and seasonality detection
- Natural language chat interface for inventory queries (modal window)
- **Fallback mode**: Uses statistical analysis if Gemini API is unavailable
- Smart restock suggestions based on consumption patterns

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

### Backend (.env)

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=http://localhost:3000
SECRET_KEY=your_secret_key_here
```

**Get Gemini API Key**: https://aistudio.google.com/apikey

**Note**: The application will work without a valid Gemini API key, using statistical fallback methods for forecasting.

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
- Status: isActive, stockStatus (computed), expiryStatus (computed)
- Timestamps: createdAt, updatedAt

**Note**: All MongoDB `_id` fields are converted to `id` in API responses for frontend compatibility.

### StockTransaction

- Transaction info: type (in/out/adjustment), quantity
- References: itemId, reason, referenceNumber
- Party: partyName, partyContact, partyType
- Financial: unitCost, totalAmount
- Tracking: performedBy, transactionDate, notes
- Timestamps: createdAt

**Note**: All datetime fields are serialized to ISO format strings in API responses.

## 🚦 Getting Started Guide

1. **Clone the repository**
2. **Setup MongoDB**: Create a MongoDB Atlas account and get connection string
3. **Get Gemini API Key**: Sign up at https://aistudio.google.com/apikey (optional - fallback available)
4. **Configure environment variables**:
   - Create `backend/.env` with MongoDB URI, Gemini key, and secret key
   - Create `Client/.env.local` with API URLs
5. **Setup Python backend**:
   - Create virtual environment: `python -m venv venv`
   - Activate: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Linux/Mac)
   - Install: `pip install -r requirements.txt`
6. **Setup Node.js frontend**:
   - Navigate to Client directory
   - Run: `npm install`
7. **Start the backend**: `python app.py` (from backend directory)
8. **Start the frontend**: `npm run dev` (from Client directory)
9. **Access the application** at http://localhost:3000

**Troubleshooting**:

- If MongoDB connection fails, ensure dnspython==2.4.2 is installed
- AI features work in fallback mode without Gemini API key
- All datetime fields are in ISO format
- API uses `id` field (not `_id`)

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

- `backend/README.md` - Backend architecture overview
- `backend/MIGRATION_SUMMARY.md` - Migration notes from Node.js to Flask

### Key API Features:

- RESTful design with consistent response format
- All responses include `success`, `message`, and `data` fields
- MongoDB `_id` automatically converted to `id`
- DateTime objects serialized to ISO format strings
- Error handling with appropriate HTTP status codes
- WebSocket support for real-time updates

## 🤝 Contributing

This is a complete full-stack application. Feel free to fork and customize for your needs.

## 🔧 Technical Highlights

- **Flask Backend**: Modern Python web framework with Blueprint architecture
- **MongoDB Integration**: PyMongo with proper ObjectId and datetime handling
- **AI Integration**: Google Gemini 2.0 Flash with intelligent fallback mechanisms
- **Real-time Updates**: Flask-SocketIO for WebSocket communication
- **Type Safety**: TypeScript frontend with proper type definitions
- **Responsive Design**: Tailwind CSS with mobile-first approach
- **Data Visualization**: Recharts for interactive analytics
- **Error Handling**: Comprehensive error handling with user-friendly messages

## 🐛 Known Issues & Solutions

- **DNS Resolution**: Use dnspython==2.4.2 (not 2.8.0)
- **ObjectId Serialization**: Handled automatically in model `to_dict()` methods
- **DateTime Serialization**: All dates converted to ISO format strings
- **Field Naming**: Backend converts `_id` to `id` for frontend compatibility
- **CORS**: Configured to allow frontend origin (localhost:3000)

---

**Built with ❤️ using Next.js, Flask (Python), MongoDB, and Google Gemini 2.0 Flash AI**
