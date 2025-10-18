"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  TrendingUp,
  Calendar,
  DollarSign,
  Package,
} from "lucide-react";
import { reportsAPI, getApiBaseUrl } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

interface MonthlyReport {
  period: {
    month: number;
    year: number;
    monthName: string;
    startDate: string;
    endDate: string;
  };
  summary: Record<string, unknown>;
  sales: {
    totalRevenue: number;
    transactionCount: number;
    totalItemsSold: number;
  };
  purchases: {
    totalCost: number;
    transactionCount: number;
    totalItemsPurchased: number;
  };
  profitability: {
    grossProfit: number;
    margin: string;
  };
  currentInventoryValue: number;
  topSellingItems: Array<{
    item: { name: string; sku: string };
    quantity: number;
    revenue: number;
  }>;
  topItems: unknown[];
  transactions: unknown[];
}

interface ComparisonData {
  currentPeriod: {
    totalTransactions: number;
    totalValue: number;
    stockIn: number;
    stockOut: number;
    startDate: string;
    endDate: string;
    totalRevenue: number;
    totalQuantity: number;
    transactionCount: number;
  };
  comparisonPeriod: {
    totalTransactions: number;
    totalValue: number;
    stockIn: number;
    stockOut: number;
    startDate: string;
    endDate: string;
    totalRevenue: number;
    totalQuantity: number;
    transactionCount: number;
  };
  changes: {
    transactions: { value: number; percentage: number };
    value: { value: number; percentage: number };
    stockIn: { value: number; percentage: number };
    stockOut: { value: number; percentage: number };
    revenueChange: string;
    revenueChangeDelta: number;
    quantityChange: string;
    quantityChangeDelta: number;
  };
}

export default function ReportsPage() {
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(
    null
  );
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(
    null
  );
  const [selectedMonth, setSelectedMonth] = useState("");
  const [comparisonMonths, setComparisonMonths] = useState(3);

  useEffect(() => {
    // Set current month
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    setSelectedMonth(`${now.getFullYear()}-${month}`);
  }, []);

  const handleGenerateMonthlyReport = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!selectedMonth) return;

    try {
      setMonthlyLoading(true);
      const [year, month] = selectedMonth.split("-");
      const response = await reportsAPI.getMonthlyReport(
        Number(year),
        Number(month)
      );
      setMonthlyReport(response.data);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || "Failed to generate report");
    } finally {
      setMonthlyLoading(false);
    }
  };

  const handleGenerateComparison = async (e?: React.MouseEvent) => {
    console.log("handleGenerateComparison called"); // Debug

    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      setComparisonLoading(true);
      console.log("Comparison loading set to true"); // Debug

      // Calculate date ranges for comparison
      const now = new Date();
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month

      // Compare with previous period
      const compareEndDate = new Date(startDate);
      compareEndDate.setDate(compareEndDate.getDate() - 1); // Last day of previous month
      const compareStartDate = new Date(compareEndDate);
      compareStartDate.setMonth(
        compareStartDate.getMonth() - (comparisonMonths - 1)
      );
      compareStartDate.setDate(1); // First day of comparison period

      const params = {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        compareStartDate: compareStartDate.toISOString().split("T")[0],
        compareEndDate: compareEndDate.toISOString().split("T")[0],
      };

      console.log("Sales comparison params:", params); // Debug log

      const response = await reportsAPI.getSalesComparison(params);
      console.log("Sales comparison response:", response); // Debug

      setComparisonData(response.data);
      console.log("Comparison data set:", response.data); // Debug
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Sales comparison error:", error);
      alert(err.response?.data?.message || "Failed to generate comparison");
    } finally {
      setComparisonLoading(false);
      console.log("Comparison loading set to false"); // Debug
    }
  };

  const handleExportInventoryCSV = () => {
    const apiBaseUrl = getApiBaseUrl();
    window.open(`${apiBaseUrl}/reports/export/inventory/csv`, "_blank");
  };

  const handleExportInventoryPDF = () => {
    const apiBaseUrl = getApiBaseUrl();
    window.open(`${apiBaseUrl}/reports/export/inventory/pdf`, "_blank");
  };

  const handleExportTransactionsCSV = () => {
    const apiBaseUrl = getApiBaseUrl();
    window.open(`${apiBaseUrl}/reports/export/transactions/csv`, "_blank");
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Exports</h1>
        <p className="text-gray-600 mt-1">
          Generate reports and export inventory data
        </p>
      </div>

      {/* Quick Export Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Inventory Report
            </h3>
            <Package className="w-8 h-8 text-indigo-600" />
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Export complete inventory list with current stock levels
          </p>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleExportInventoryCSV}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              CSV
            </button>
            <button
              type="button"
              onClick={handleExportInventoryPDF}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Transaction History
            </h3>
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Export all stock transactions with complete details
          </p>
          <button
            type="button"
            onClick={handleExportTransactionsCSV}
            className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-lg shadow text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Quick Stats</h3>
            <TrendingUp className="w-8 h-8 text-indigo-200" />
          </div>
          <p className="text-sm text-indigo-100 mb-2">Reports Available</p>
          <p className="text-4xl font-bold">5+</p>
        </div>
      </div>

      {/* Monthly Report Generator */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-6 h-6 mr-2 text-indigo-600" />
          Monthly Performance Report
        </h2>

        <div className="flex items-end space-x-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Month
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="button"
            onClick={handleGenerateMonthlyReport}
            disabled={monthlyLoading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {monthlyLoading ? "Generating..." : "Generate Report"}
          </button>
        </div>

        {monthlyReport && (
          <div className="space-y-6">
            {/* Report Header */}
            <div className="border-b pb-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {monthlyReport.period.monthName} {monthlyReport.period.year}
              </h3>
              <p className="text-sm text-gray-500">
                {new Date(monthlyReport.period.startDate).toLocaleDateString()}{" "}
                - {new Date(monthlyReport.period.endDate).toLocaleDateString()}
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(monthlyReport.sales.totalRevenue)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {monthlyReport.sales.transactionCount} transactions
                </p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <DollarSign className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(monthlyReport.purchases.totalCost)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {monthlyReport.purchases.transactionCount} purchases
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Gross Profit</p>
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(monthlyReport.profitability.grossProfit)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Margin: {monthlyReport.profitability.margin}
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Inventory Value</p>
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(monthlyReport.currentInventoryValue)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Current stock value
                </p>
              </div>
            </div>

            {/* Items Sold/Purchased */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Items Sold: {monthlyReport.sales.totalItemsSold}
                </h4>
                <div className="text-sm text-gray-600">
                  From {monthlyReport.sales.transactionCount} sales transactions
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Items Purchased: {monthlyReport.purchases.totalItemsPurchased}
                </h4>
                <div className="text-sm text-gray-600">
                  From {monthlyReport.purchases.transactionCount} purchase
                  orders
                </div>
              </div>
            </div>

            {/* Top Selling Items */}
            {monthlyReport.topSellingItems &&
              monthlyReport.topSellingItems.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Top Selling Items
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Item
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            SKU
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Revenue
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {monthlyReport.topSellingItems.map(
                          (
                            item: {
                              item: { name: string; sku: string };
                              quantity: number;
                              revenue: number;
                            },
                            index: number
                          ) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {item.item.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.item.sku}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.quantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                {formatCurrency(item.revenue)}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
          </div>
        )}
      </div>

      {/* Sales Comparison */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-indigo-600" />
          Sales Comparison
        </h2>

        <div className="flex items-end space-x-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compare Last N Months
            </label>
            <select
              value={comparisonMonths}
              onChange={(e) => setComparisonMonths(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value={3}>Last 3 Months</option>
              <option value={6}>Last 6 Months</option>
              <option value={12}>Last 12 Months</option>
            </select>
          </div>
          <button
            type="button"
            onClick={handleGenerateComparison}
            disabled={comparisonLoading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {comparisonLoading ? "Loading..." : "Generate Comparison"}
          </button>
        </div>

        {comparisonData && (
          <div className="mt-6 space-y-6">
            {/* Current Period vs Comparison Period */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Period */}
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-lg text-white">
                <h4 className="text-lg font-semibold mb-4">Current Period</h4>
                <p className="text-sm text-indigo-100 mb-4">
                  {comparisonData.currentPeriod?.startDate} to{" "}
                  {comparisonData.currentPeriod?.endDate}
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-100">Total Revenue:</span>
                    <span className="text-2xl font-bold">
                      {formatCurrency(
                        comparisonData.currentPeriod?.totalRevenue || 0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-100">Total Quantity:</span>
                    <span className="text-xl font-semibold">
                      {comparisonData.currentPeriod?.totalQuantity || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-100">Transactions:</span>
                    <span className="text-xl font-semibold">
                      {comparisonData.currentPeriod?.transactionCount || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Comparison Period */}
              <div className="bg-gradient-to-br from-gray-500 to-gray-700 p-6 rounded-lg text-white">
                <h4 className="text-lg font-semibold mb-4">
                  Comparison Period
                </h4>
                <p className="text-sm text-gray-300 mb-4">
                  {comparisonData.comparisonPeriod?.startDate} to{" "}
                  {comparisonData.comparisonPeriod?.endDate}
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-200">Total Revenue:</span>
                    <span className="text-2xl font-bold">
                      {formatCurrency(
                        comparisonData.comparisonPeriod?.totalRevenue || 0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-200">Total Quantity:</span>
                    <span className="text-xl font-semibold">
                      {comparisonData.comparisonPeriod?.totalQuantity || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-200">Transactions:</span>
                    <span className="text-xl font-semibold">
                      {comparisonData.comparisonPeriod?.transactionCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Changes/Comparison */}
            {comparisonData.changes && (
              <div className="bg-white p-6 rounded-lg border-2 border-indigo-200">
                <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-6 h-6 mr-2 text-indigo-600" />
                  Performance Changes
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Revenue Change</p>
                    <p
                      className={`text-3xl font-bold ${
                        comparisonData.changes.revenueChangeDelta >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {comparisonData.changes.revenueChange}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {comparisonData.changes.revenueChangeDelta >= 0
                        ? "↑"
                        : "↓"}{" "}
                      {formatCurrency(
                        Math.abs(comparisonData.changes.revenueChangeDelta || 0)
                      )}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">
                      Quantity Change
                    </p>
                    <p
                      className={`text-3xl font-bold ${
                        comparisonData.changes.quantityChangeDelta >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {comparisonData.changes.quantityChange}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {comparisonData.changes.quantityChangeDelta >= 0
                        ? "↑"
                        : "↓"}{" "}
                      {Math.abs(
                        comparisonData.changes.quantityChangeDelta || 0
                      )}{" "}
                      units
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
