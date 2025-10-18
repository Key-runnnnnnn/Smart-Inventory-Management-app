# Inventory Management System - Frontend

This is a [Next.js](https://nextjs.org) project for managing inventory, stock transactions, analytics, and forecasting.

## Features

- 📦 **Inventory Management** - Track items, stock levels, and details
- 🔄 **Stock Transactions** - Handle stock in/out operations
- 📊 **Analytics Dashboard** - View sales trends, turnover rates, and insights
- 🚨 **Real-time Alerts** - Get notified for low stock, expiring items, and overstock
- 📈 **AI-Powered Forecasting** - Predict demand and get restock suggestions
- 📑 **Reports & Exports** - Generate reports and export data (CSV, PDF)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend server running (see Server folder)

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables:**

   The `.env.local` file is already configured for local development:

   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   ```

   For production deployment, update `.env.production` with your actual backend URL.

   📖 **See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for detailed configuration guide.**

3. **Run the development server:**

   ```bash
   npm run dev
   ```

4. **Open the application:**

   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server (uses `.env.local`)
- `npm run build` - Build for production (uses `.env.production`)
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Environment Configuration

### Local Development

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### Production

Update `.env.production`:

```bash
NEXT_PUBLIC_API_URL=https://your-production-api.com/api
NEXT_PUBLIC_SOCKET_URL=https://your-production-api.com
```

**Important:** All `NEXT_PUBLIC_*` variables are exposed to the browser.

## Project Structure

```
Client/
├── app/                    # Next.js App Router pages
│   ├── inventory/         # Inventory management page
│   ├── transactions/      # Stock transactions page
│   ├── analytics/         # Analytics dashboard
│   ├── alerts/           # Alerts and notifications
│   ├── forecasting/      # AI forecasting page
│   └── reports/          # Reports and exports
├── components/            # Reusable React components
│   ├── inventory/        # Inventory-specific components
│   ├── Header.tsx        # Navigation header
│   └── Sidebar.tsx       # Navigation sidebar
├── lib/                  # Utility libraries
│   ├── api.ts           # API client and endpoints
│   ├── socket.ts        # WebSocket client
│   └── utils.ts         # Helper functions
├── types/               # TypeScript type definitions
└── public/             # Static assets

```

## Technology Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Forms:** React Hook Form + Zod validation
- **API Client:** Axios
- **Real-time:** Socket.io Client
- **Icons:** Lucide React

## Deployment

### Deploy on Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_SOCKET_URL`
4. Deploy!

### Deploy on Netlify

1. Build the project:

   ```bash
   npm run build
   ```

2. Deploy the `out` folder or connect your Git repository

3. Add environment variables in Netlify dashboard

### Deploy on Custom Server

1. Build the application:

   ```bash
   npm run build
   ```

2. Start the production server:

   ```bash
   npm start
   ```

3. Use PM2 or similar process manager:
   ```bash
   pm2 start npm --name "inventory-frontend" -- start
   ```

## Environment Variables

All environment variables must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser.

| Variable                 | Description          | Example                     |
| ------------------------ | -------------------- | --------------------------- |
| `NEXT_PUBLIC_API_URL`    | Backend API base URL | `http://localhost:5000/api` |
| `NEXT_PUBLIC_SOCKET_URL` | WebSocket server URL | `http://localhost:5000`     |

## Features Overview

### 1. Inventory Management

- Add, edit, view, and delete inventory items
- Track stock levels, pricing, and supplier information
- Filter by category and search by name/SKU
- Real-time stock status indicators

### 2. Stock Transactions

- Record stock in/out operations
- Track transaction history
- Filter by date, item, and transaction type
- View detailed transaction information

### 3. Analytics Dashboard

- Sales trends and charts
- Top-performing items
- Slow-moving inventory analysis
- Inventory turnover rates
- Value trends over time

### 4. Alerts System

- Low stock warnings
- Near-expiry and expired items
- Overstock notifications
- Real-time alert updates via WebSocket

### 5. AI Forecasting

- Demand prediction using Google Gemini AI
- Restock suggestions and recommendations
- Historical trend analysis
- Interactive AI chat assistant

### 6. Reports & Exports

- Monthly sales reports
- Sales comparison (period-over-period)
- Export inventory data (CSV, PDF)
- Export transaction history

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Socket.io Client](https://socket.io/docs/v4/client-api/)

## Support

For issues or questions:

1. Check [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for configuration help
2. Review browser console for errors
3. Verify backend server is running and accessible

## License

This project is part of an Inventory Management System.
