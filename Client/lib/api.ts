import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Export the base URL for direct usage (e.g., file downloads)
export const getApiBaseUrl = () => API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Return the full response.data (which contains success, data, etc.)
    return response.data;
  },
  (error) => {
    // Better error handling
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const errorData = error.response.data;
      const message =
        errorData?.message || error.message || "An error occurred";

      // Only log in development
      if (process.env.NODE_ENV === "development") {
        console.error("API Error:", {
          status: error.response.status,
          message: message,
          data: errorData,
        });
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Network Error: No response received");
    } else {
      // Something happened in setting up the request
      console.error("Request Error:", error.message);
    }

    return Promise.reject(error);
  }
);

// ============= INVENTORY API =============

export const inventoryAPI = {
  getAll: (params?: Record<string, unknown>) =>
    apiClient.get("/inventory", { params }),
  getById: (id: string) => apiClient.get(`/inventory/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post("/inventory", data),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/inventory/${id}`, data),
  delete: (id: string) => apiClient.delete(`/inventory/${id}`),
  getLowStock: () => apiClient.get("/inventory/alerts/low-stock"),
  getExpiring: (days?: number) =>
    apiClient.get("/inventory/alerts/expiring", { params: { days } }),
  getStats: () => apiClient.get("/inventory/stats/summary"),
};

// ============= TRANSACTIONS API =============

export const transactionsAPI = {
  getAll: (params?: Record<string, unknown>) =>
    apiClient.get("/transactions", { params }),
  getByItem: (itemId: string) => apiClient.get(`/transactions/item/${itemId}`),
  stockIn: (data: Record<string, unknown>) =>
    apiClient.post("/transactions/stock-in", data),
  stockOut: (data: Record<string, unknown>) =>
    apiClient.post("/transactions/stock-out", data),
  adjustment: (data: Record<string, unknown>) =>
    apiClient.post("/transactions/adjustment", data),
  getStats: (params?: Record<string, unknown>) =>
    apiClient.get("/transactions/stats/summary", { params }),
};

// ============= ANALYTICS API =============

export const analyticsAPI = {
  getDashboard: () => apiClient.get("/analytics/dashboard"),
  getTopItems: (params?: Record<string, unknown>) =>
    apiClient.get("/analytics/top-items", { params }),
  getSlowMoving: (params?: Record<string, unknown>) =>
    apiClient.get("/analytics/slow-moving", { params }),
  getTurnover: (params?: Record<string, unknown>) =>
    apiClient.get("/analytics/turnover", { params }),
  getSalesTrends: (params?: Record<string, unknown>) =>
    apiClient.get("/analytics/sales-trends", { params }),
  getValueTrends: () => apiClient.get("/analytics/value-trends"),
};

// ============= ALERTS API =============

export const alertsAPI = {
  getAll: () => apiClient.get("/alerts"),
  getSummary: () => apiClient.get("/alerts/summary"),
  getLowStock: () => apiClient.get("/alerts/low-stock"),
  getNearExpiry: (days?: number) =>
    apiClient.get("/alerts/near-expiry", { params: { days } }),
  getExpired: () => apiClient.get("/alerts/expired"),
  getOverstock: () => apiClient.get("/alerts/overstock"),
};

// ============= FORECAST API =============

export const forecastAPI = {
  getItemForecast: (itemId: string, days?: number) =>
    apiClient.get(`/forecast/item/${itemId}`, { params: { days } }),
  getRestockSuggestions: (query: string) =>
    apiClient.post("/forecast/restock-suggestions", { query }),
  getBatchForecast: (params?: Record<string, unknown>) =>
    apiClient.get("/forecast/batch", { params }),
  getEOQ: (itemId: string, annualDemand?: number) =>
    apiClient.get(`/forecast/eoq/${itemId}`, { params: { annualDemand } }),
  getHistory: (itemId: string, days?: number) =>
    apiClient.get(`/forecast/history/${itemId}`, { params: { days } }),
};

// ============= REPORTS API =============

export const reportsAPI = {
  exportInventoryCSV: (params?: Record<string, unknown>) => {
    const queryString = new URLSearchParams(
      params as Record<string, string>
    ).toString();
    return `${API_BASE_URL}/reports/export/inventory/csv?${queryString}`;
  },
  exportInventoryPDF: (params?: Record<string, unknown>) => {
    const queryString = new URLSearchParams(
      params as Record<string, string>
    ).toString();
    return `${API_BASE_URL}/reports/export/inventory/pdf?${queryString}`;
  },
  exportTransactionsCSV: (params?: Record<string, unknown>) => {
    const queryString = new URLSearchParams(
      params as Record<string, string>
    ).toString();
    return `${API_BASE_URL}/reports/export/transactions/csv?${queryString}`;
  },
  getMonthlyReport: (year: number, month: number) =>
    apiClient.get("/reports/monthly", { params: { year, month } }),
  getSalesComparison: (params: Record<string, unknown>) =>
    apiClient.get("/reports/sales-comparison", { params }),
};

export default apiClient;
