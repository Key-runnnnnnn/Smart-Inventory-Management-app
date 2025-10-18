"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Package, DollarSign } from "lucide-react";
import { analyticsAPI } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ef4444",
  "#14b8a6",
];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<Record<string, any> | null>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [topItems, setTopItems] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [slowMoving, setSlowMoving] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [salesTrends, setSalesTrends] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [valueTrends, setValueTrends] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [turnoverData, setTurnoverData] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const [
        dashboardRes,
        topItemsRes,
        slowMovingRes,
        salesTrendsRes,
        valueTrendsRes,
        turnoverRes,
      ] = await Promise.all([
        analyticsAPI.getDashboard().catch((err) => {
          console.error("Dashboard API failed:", err);
          return { data: null };
        }),
        analyticsAPI.getTopItems().catch((err) => {
          console.error("Top Items API failed:", err);
          return { data: { items: [] } };
        }),
        analyticsAPI.getSlowMoving().catch((err) => {
          console.error("Slow Moving API failed:", err);
          return { data: [] };
        }),
        analyticsAPI.getSalesTrends().catch((err) => {
          console.error("Sales Trends API failed:", err);
          return { data: { trends: [] } };
        }),
        analyticsAPI.getValueTrends().catch((err) => {
          console.error("Value Trends API failed:", err);
          return { data: { trends: [] } };
        }),
        analyticsAPI.getTurnover().catch((err) => {
          console.error("Turnover API failed:", err);
          return { data: null };
        }),
      ]);

      console.log("Analytics Data:", {
        dashboard: dashboardRes.data,
        topItems: topItemsRes.data,
        slowMoving: slowMovingRes.data,
        salesTrends: salesTrendsRes.data,
        valueTrends: valueTrendsRes.data,
        turnover: turnoverRes.data,
      });

      console.log("Setting state:");
      console.log(
        "- Dashboard categoryDistribution:",
        dashboardRes.data?.categoryDistribution
      );
      console.log("- Top items array:", topItemsRes.data?.items);
      console.log("- Slow moving array:", slowMovingRes.data);
      console.log("- Sales trends array:", salesTrendsRes.data?.trends);
      console.log("- Value trends array:", valueTrendsRes.data?.trends);

      setDashboard(dashboardRes.data);
      setTopItems(topItemsRes.data?.items || []);
      setSlowMoving(slowMovingRes.data || []);
      setSalesTrends(salesTrendsRes.data?.trends || []);
      setValueTrends(valueTrendsRes.data?.trends || []);
      setTurnoverData(turnoverRes.data || null);

      console.log("State set complete");
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  // Prepare data for charts
  const categoryData =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dashboard?.categoryDistribution?.map((cat: any) => ({
      name: cat._id,
      value: cat.count,
      totalValue: cat.totalValue,
    })) || [];

  const topItemsChartData = (topItems || []).slice(0, 10).map((item) => ({
    name:
      item?.name?.length > 20
        ? item.name.substring(0, 20) + "..."
        : item?.name || "N/A",
    quantity: item?.quantity || 0,
    value: item?.stockValue || 0,
  }));

  // Turnover data is a single object, not an array - display as metrics

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Analytics & Insights
        </h1>
        <p className="text-gray-600 mt-1">
          Comprehensive analytics and performance metrics
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-lg shadow text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-indigo-100">Total Stock Value</p>
            <DollarSign className="w-8 h-8 text-indigo-200" />
          </div>
          <p className="text-3xl font-bold">
            {formatCurrency(dashboard?.overview?.totalStockValue || 0)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-purple-100">Total Items</p>
            <Package className="w-8 h-8 text-purple-200" />
          </div>
          <p className="text-3xl font-bold">
            {dashboard?.overview?.totalItems || 0}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-100">Top Performers</p>
            <TrendingUp className="w-8 h-8 text-green-200" />
          </div>
          <p className="text-3xl font-bold">{topItems.length}</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-lg shadow text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-red-100">Slow Moving</p>
            <TrendingDown className="w-8 h-8 text-red-200" />
          </div>
          <p className="text-3xl font-bold">{slowMoving.length}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Category Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry: unknown, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Performing Items */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top 10 Items by Value
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topItemsChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="value" fill="#6366f1" name="Stock Value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top and Slow Moving Items Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Items */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Top Performing Items
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topItems && topItems.length > 0 ? (
                  topItems.slice(0, 5).map((item) => (
                    <tr key={item._id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-500">{item.sku}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatCurrency(item.stockValue)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-8 text-center text-sm text-gray-500"
                    >
                      No top performing items data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Slow Moving Items */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Slow Moving Items
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Days
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {slowMoving && slowMoving.length > 0 ? (
                  slowMoving.slice(0, 5).map((item) => (
                    <tr key={item._id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-500">{item.sku}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.daysSinceLastTransaction || "N/A"} days
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-8 text-center text-sm text-gray-500"
                    >
                      No slow moving items data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
