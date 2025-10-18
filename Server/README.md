# 🏢 Smart Inventory Management System - Backend

A comprehensive, production-ready inventory management system with AI-powered forecasting, real-time updates, and advanced analytics.

## ✨ Features

### 🧾 Inventory Management

- Full CRUD operations for inventory items
- Stock IN/OUT transaction tracking
- Reorder level monitoring
- Multi-warehouse support
- Batch and expiry tracking
- Real-time quantity updates via WebSocket

### 📊 Analytics & Insights

- Total stock value calculation
- Top 5 performing items (by sales/revenue)
- Slow-moving inventory detection
- Inventory turnover analysis
- Category-wise distribution
- Sales trends over time

### 🔔 Alerts & Notifications

- Low stock alerts (configurable thresholds)
- Near-expiry notifications
- Expired items tracking
- Overstock warnings
- Real-time alert broadcasting via WebSocket

### 🤖 AI/Forecasting (Powered by Google Gemini)

- Demand forecasting for next 30/60/90 days
- AI-powered restock suggestions
- Natural language queries ("What should I restock next week?")
- Economic Order Quantity (EOQ) calculation
- Seasonal pattern detection
- Confidence scoring for predictions

### 🧰 Reporting

- CSV export (inventory & transactions)
- PDF report generation
- Monthly performance reports
- Sales comparison reports
- Visual trend analysis data

### 🔌 Real-Time Updates

- WebSocket integration (Socket.io)
- Live inventory updates
- Real-time transaction notifications
- Alert broadcasting

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **AI/ML**: Google Generative AI (Gemini Pro)
- **Real-time**: Socket.io
- **CSV**: json2csv
- **PDF**: PDFKit
- **Environment**: dotenv

## 📦 Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Steps

1. **Clone the repository**

```bash
git clone <repository-url>
cd Inventory-Management/Server
```

2. **Install dependencies**

```bash
npm install
```

3. **Create .env file**

```bash
cp .env.example .env
```

Edit `.env` with your configurations:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/Inventory
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=http://localhost:3000
```

4. **Seed the database** (optional but recommended)

```bash
npm run seed
```

This will create 12 sample inventory items with transactions.

5. **Start the server**

Development mode (with nodemon):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Server will run on `http://localhost:5000`

## 📚 API Documentation

Complete API documentation is available in [`API_DOCUMENTATION_COMPLETE.md`](./API_DOCUMENTATION_COMPLETE.md)

### Quick API Overview

| Module       | Endpoints             | Description                    |
| ------------ | --------------------- | ------------------------------ |
| Inventory    | `/api/inventory/*`    | CRUD operations, alerts, stats |
| Transactions | `/api/transactions/*` | Stock IN/OUT, history          |
| Analytics    | `/api/analytics/*`    | Dashboard, trends, insights    |
| Alerts       | `/api/alerts/*`       | All alert types                |
| Forecasting  | `/api/forecast/*`     | AI predictions, EOQ            |
| Reports      | `/api/reports/*`      | CSV/PDF exports                |

## 🧪 Testing the API

### Using cURL

**Get all inventory items:**

```bash
curl http://localhost:5000/api/inventory
```

**Create new item:**

```bash
curl -X POST http://localhost:5000/api/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "sku": "TEST-001",
    "category": "Electronics",
    "quantity": 100,
    "unit": "pcs",
    "reorderLevel": 20,
    "costPrice": 1000,
    "sellingPrice": 1500
  }'
```

**Get AI forecast:**

```bash
curl http://localhost:5000/api/forecast/item/{itemId}?days=30
```

**Natural language restock suggestion:**

```bash
curl -X POST http://localhost:5000/api/forecast/restock-suggestions \
  -H "Content-Type: application/json" \
  -d '{"query": "What should I restock this week?"}'
```

### Using Postman

Import the API endpoints from the documentation or use the Postman collection (if available).

## 🔌 WebSocket Usage

### Connect to WebSocket

```javascript
const io = require("socket.io-client");
const socket = io("http://localhost:5000");

// Join inventory updates room
socket.emit("join:inventory");

// Listen for updates
socket.on("inventory:update", (data) => {
  console.log("Inventory updated:", data);
});

// Listen for low stock alerts
socket.on("alert:low-stock", (alert) => {
  console.log("Low stock alert:", alert);
});
```

## 📁 Project Structure

```
Server/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── inventoryController.js
│   ├── transactionController.js
│   ├── analyticsController.js
│   ├── alertController.js
│   ├── reportController.js
│   └── forecastController.js
├── models/
│   ├── InventoryItem.js
│   └── StockTransaction.js
├── routes/
│   ├── inventoryRoutes.js
│   ├── transactionRoutes.js
│   ├── analyticsRoutes.js
│   ├── alertRoutes.js
│   ├── reportRoutes.js
│   └── forecastRoutes.js
├── services/
│   ├── alertService.js
│   ├── reportService.js
│   └── forecastService.js
├── sockets/
│   └── inventorySocket.js   # WebSocket handlers
├── scripts/
│   └── seed.js             # Database seeding
├── .env
├── index.js                # Main entry point
└── package.json
```

## 🎯 Available Scripts

| Script | Command        | Description                        |
| ------ | -------------- | ---------------------------------- |
| Start  | `npm start`    | Run in production mode             |
| Dev    | `npm run dev`  | Run with nodemon (auto-reload)     |
| Seed   | `npm run seed` | Populate database with sample data |

## 🔐 Security Notes

**For Production:**

1. Add authentication (JWT/OAuth)
2. Implement rate limiting
3. Use HTTPS
4. Sanitize inputs
5. Add request validation middleware
6. Secure WebSocket connections
7. Hide sensitive error messages
8. Use environment-specific configs

## 📊 Database Schema

### InventoryItem Schema

- Basic info (name, SKU, description)
- Categorization
- Stock levels (quantity, reorder level, max stock)
- Pricing (cost price, selling price)
- Supplier details
- Location & storage
- Expiry & batch tracking
- Virtual fields (stockStatus, expiryStatus)

### StockTransaction Schema

- Item reference
- Transaction type (in/out/adjustment)
- Quantity tracking
- Reason & details
- Party information
- Financial data
- Audit trail

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Google Gemini AI for forecasting capabilities
- MongoDB for database
- Socket.io for real-time features

## 📞 Support

For issues and questions:

- Create an issue in the repository
- Check the [API Documentation](./API_DOCUMENTATION_COMPLETE.md)

---

**Built with ❤️ for efficient inventory management**
