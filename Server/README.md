# Smart Inventory Management - Flask Backend

This is the Flask-based backend API for the Smart Inventory Management System. It has been converted from the original Node.js/Express implementation.

## Features

- **RESTful API** - Complete CRUD operations for inventory management
- **Real-time Updates** - WebSocket support using Flask-SocketIO
- **MongoDB Integration** - Flexible NoSQL database for inventory data
- **AI-Powered Forecasting** - Demand forecasting using Google Gemini AI
- **Advanced Analytics** - Dashboard analytics, sales trends, inventory turnover
- **Alert System** - Automated alerts for low stock, expiry, and overstock
- **Report Generation** - CSV and PDF export capabilities
- **Transaction Tracking** - Complete audit trail of all stock movements

## Technology Stack

- **Flask** - Web framework
- **Flask-SocketIO** - Real-time WebSocket communication
- **PyMongo** - MongoDB driver
- **Google Generative AI** - AI-powered forecasting
- **ReportLab** - PDF generation
- **Flask-CORS** - Cross-Origin Resource Sharing

## Prerequisites

- Python 3.8 or higher
- MongoDB (local or cloud instance)
- Google Gemini API key (for AI forecasting features)

## Installation

1. **Clone the repository**

   ```bash
   cd backend
   ```

2. **Create a virtual environment**

   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**

   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - Linux/Mac:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

5. **Set up environment variables**
   - Copy `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```
   - Edit `.env` and configure:
     - `MONGODB_URI` - Your MongoDB connection string
     - `GEMINI_API_KEY` - Your Google Gemini API key
     - `CLIENT_URL` - Your frontend URL (default: http://localhost:3000)
     - `PORT` - Server port (default: 5000)

## Running the Application

### Development Mode

```bash
python app.py
```

The server will start on `http://localhost:5000`

### Production Mode

Using Gunicorn with eventlet worker:

```bash
gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:5000 app:app
```

## API Documentation

### Base URL

```
http://localhost:5000/api
```

### Endpoints

#### Inventory

- `GET /inventory` - Get all inventory items (with filters & pagination)
- `GET /inventory/:id` - Get single item
- `POST /inventory` - Create new item
- `PUT /inventory/:id` - Update item
- `DELETE /inventory/:id` - Delete item
- `GET /inventory/alerts/low-stock` - Get low stock items
- `GET /inventory/alerts/expiring` - Get expiring items
- `GET /inventory/stats/summary` - Get inventory statistics

#### Transactions

- `GET /transactions` - Get all transactions
- `GET /transactions/item/:itemId` - Get item transactions
- `POST /transactions/stock-in` - Add stock
- `POST /transactions/stock-out` - Remove stock
- `POST /transactions/adjustment` - Adjust stock
- `GET /transactions/stats` - Get transaction statistics

#### Analytics

- `GET /analytics/dashboard` - Get dashboard analytics
- `GET /analytics/top-items` - Get top performing items
- `GET /analytics/slow-moving` - Get slow moving items
- `GET /analytics/turnover` - Get inventory turnover metrics
- `GET /analytics/sales-trends` - Get sales trends
- `GET /analytics/value-trends` - Get inventory value trends

#### Alerts

- `GET /alerts` - Get all alerts
- `GET /alerts/summary` - Get alert summary
- `GET /alerts/low-stock` - Get low stock alerts
- `GET /alerts/near-expiry` - Get near expiry alerts
- `GET /alerts/expired` - Get expired items alerts
- `GET /alerts/overstock` - Get overstock alerts

#### Reports

- `GET /reports/export/inventory/csv` - Export inventory as CSV
- `GET /reports/export/inventory/pdf` - Export inventory as PDF
- `GET /reports/export/transactions/csv` - Export transactions as CSV
- `GET /reports/monthly?year=2024&month=1` - Get monthly report

#### Forecasting (AI-Powered)

- `GET /forecast/item/:itemId` - Forecast demand for specific item
- `POST /forecast/restock-suggestions` - Get AI restock suggestions
- `GET /forecast/batch` - Batch forecast for multiple items
- `GET /forecast/history/:itemId` - Get historical sales data

### WebSocket Events

#### Client -> Server

- `join:inventory` - Join inventory updates room
- `join:alerts` - Join alerts room
- `join:item` - Join specific item updates room
- `request:alerts` - Request current alerts

#### Server -> Client

- `inventory:update` - Inventory item updated
- `transaction:new` - New transaction created
- `alert:new` - New alert triggered
- `alert:low-stock` - Low stock alert
- `alerts:summary` - Alert summary update
- `alerts:update` - All alerts update

## Project Structure

```
backend/
├── app.py                  # Main application entry point
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables template
├── config/
│   ├── __init__.py
│   └── database.py        # Database configuration
├── models/
│   ├── __init__.py
│   ├── inventory_item.py  # Inventory item model
│   └── stock_transaction.py # Transaction model
├── routes/
│   ├── __init__.py
│   ├── inventory_routes.py
│   ├── transaction_routes.py
│   ├── analytics_routes.py
│   ├── alert_routes.py
│   ├── report_routes.py
│   └── forecast_routes.py
├── services/
│   ├── __init__.py
│   ├── alert_service.py
│   ├── report_service.py
│   └── forecast_service.py
└── sockets/
    ├── __init__.py
    └── inventory_socket.py
```

## Differences from Node.js Version

### Key Changes:

1. **Framework**: Express → Flask
2. **Database Driver**: Mongoose → PyMongo
3. **WebSocket**: Socket.io → Flask-SocketIO
4. **AI Integration**: @google/generative-ai → google-generativeai (Python SDK)
5. **PDF Generation**: PDFKit → ReportLab
6. **CSV Generation**: json2csv → Python csv module

### Architecture:

- Models are implemented as static classes instead of Mongoose schemas
- Routes use Flask Blueprints instead of Express routers
- Middleware functionality is handled through Flask decorators
- Sessions/transactions use PyMongo's session management

## Environment Variables

```env
# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/inventory_management

# Security
SECRET_KEY=your-secret-key-here

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Environment
FLASK_ENV=development
```

## Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (in development only)"
}
```

## Database Indexes

The application automatically creates indexes for better performance:

- Inventory: `sku` (unique), `category + status`, text search on `name + description`
- Transactions: `itemId + transactionDate`, `type`, `transactionDate`

## Contributing

When contributing to this Flask backend:

1. Follow PEP 8 Python style guidelines
2. Add type hints where applicable
3. Include docstrings for all functions and classes
4. Test all endpoints before submitting PRs

## Testing

Run tests (if implemented):

```bash
pytest
```

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**

   - Ensure MongoDB is running
   - Check `MONGODB_URI` in `.env`

2. **WebSocket Connection Failed**

   - Verify CORS settings
   - Check `CLIENT_URL` matches frontend URL

3. **Gemini API Error**

   - Verify `GEMINI_API_KEY` is valid
   - Check API quota limits

4. **Import Errors**
   - Ensure virtual environment is activated
   - Run `pip install -r requirements.txt`

## License

MIT

## Support

For issues and questions, please create an issue in the repository.
