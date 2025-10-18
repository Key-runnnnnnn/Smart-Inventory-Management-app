"use client";

import { useEffect, useState } from "react";
import { analyticsAPI, alertsAPI } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  Package,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface DashboardAnalytics {
  overview: {
    totalStockValue: number;
    totalItems: number;
    lowStockCount: number;
    totalQuantity: number;
    outOfStockCount: number;
    overstockCount: number;
  };
  categoryDistribution?: Array<{
    category: string;
    count: number;
    value: number;
  }>;
}

interface DashboardAlerts {
  total: number;
  critical: number;
  warning: number;
  info: number;
  lowStock: number;
  nearExpiry: number;
  expired: number;
}

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [alerts, setAlerts] = useState<DashboardAlerts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [analyticsData, alertsData] = await Promise.all([
        analyticsAPI.getDashboard(),
        alertsAPI.getSummary(),
      ]);
      setAnalytics(analyticsData.data);
      setAlerts(alertsData.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = [
    {
      name: "Total Stock Value",
      value: formatCurrency(analytics?.overview?.totalStockValue || 0),
      icon: DollarSign,
      color: "bg-blue-500",
      textColor: "text-blue-600",
    },
    {
      name: "Total Items",
      value: analytics?.overview?.totalItems || 0,
      icon: Package,
      color: "bg-green-500",
      textColor: "text-green-600",
    },
    {
      name: "Low Stock Alerts",
      value: analytics?.overview?.lowStockCount || 0,
      icon: AlertTriangle,
      color: "bg-orange-500",
      textColor: "text-orange-600",
    },
    {
      name: "Total Quantity",
      value: analytics?.overview?.totalQuantity || 0,
      icon: TrendingUp,
      color: "bg-purple-500",
      textColor: "text-purple-600",
    },
  ];

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back! Here&apos;s your inventory overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Stock Status
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Out of Stock</span>
              <span className="text-sm font-semibold text-red-600">
                {analytics?.overview?.outOfStockCount || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Low Stock</span>
              <span className="text-sm font-semibold text-orange-600">
                {analytics?.overview?.lowStockCount || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Overstock</span>
              <span className="text-sm font-semibold text-blue-600">
                {analytics?.overview?.overstockCount || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Alert Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Low Stock</span>
              <span className="text-sm font-semibold text-orange-600">
                {alerts?.lowStock || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Near Expiry</span>
              <span className="text-sm font-semibold text-yellow-600">
                {alerts?.nearExpiry || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Expired</span>
              <span className="text-sm font-semibold text-red-600">
                {alerts?.expired || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Categories
          </h3>
          <div className="space-y-3">
            {analytics?.categoryDistribution?.slice(0, 3).map((cat) => (
              <div
                key={cat.category}
                className="flex justify-between items-center"
              >
                <span className="text-sm text-gray-600">{cat.category}</span>
                <span className="text-sm font-semibold text-gray-900">
                  {cat.count} items
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Package className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Add Item</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ArrowUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Stock In</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ArrowDown className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Stock Out</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">View Reports</p>
          </button>
        </div>
      </div>
    </div>
  );
}
