"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Calendar,
  Package,
  Filter,
  RefreshCw,
} from "lucide-react";
import { Alert } from "@/types";
import { alertsAPI } from "@/lib/api";
import { getAlertSeverityColor, formatDate } from "@/lib/utils";
import socketClient from "@/lib/socket";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("");
  const [filterSeverity, setFilterSeverity] = useState<string>("");
  const [summary, setSummary] = useState({
    total: 0,
    lowStock: 0,
    nearExpiry: 0,
    expired: 0,
    overstock: 0,
  });

  useEffect(() => {
    fetchAlerts();
    fetchSummary();

    // Connect to WebSocket for real-time alerts
    socketClient.connect();

    socketClient.onAlertNew((alert) => {
      setAlerts((prev) => [alert as Alert, ...prev]);
      fetchSummary();
    });

    return () => {
      socketClient.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, filterSeverity]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      let response;

      if (filterType === "low-stock") {
        response = await alertsAPI.getLowStock();
      } else if (filterType === "near-expiry") {
        response = await alertsAPI.getNearExpiry();
      } else if (filterType === "expired") {
        response = await alertsAPI.getExpired();
      } else if (filterType === "overstock") {
        response = await alertsAPI.getOverstock();
      } else {
        response = await alertsAPI.getAll();
      }

      let alertsData = response.data.alerts || response.data;

      // Filter by severity if selected
      if (filterSeverity) {
        alertsData = alertsData.filter(
          (alert: Alert) => alert.severity === filterSeverity
        );
      }

      setAlerts(alertsData);
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await alertsAPI.getSummary();
      setSummary(response.data);
    } catch (error) {
      console.error("Failed to fetch summary:", error);
      setSummary({
        total: 0,
        lowStock: 0,
        nearExpiry: 0,
        expired: 0,
        overstock: 0,
      });
    }
  };

  const getAlertIcon = (type: string, severity: string) => {
    if (severity === "critical") {
      return <AlertTriangle className="w-5 h-5 text-red-600" />;
    } else if (severity === "warning") {
      return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    } else {
      return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "low-stock":
      case "overstock":
        return <Package className="w-4 h-4" />;
      case "near-expiry":
      case "expired":
        return <Calendar className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Alerts Center</h1>
        <p className="text-gray-600 mt-1">
          Monitor and manage inventory alerts
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Alerts</p>
          <p className="text-3xl font-bold text-gray-900">{summary.total}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <p className="text-sm text-gray-600">Low Stock</p>
          <p className="text-3xl font-bold text-red-600">{summary.lowStock}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600">Near Expiry</p>
          <p className="text-3xl font-bold text-yellow-600">
            {summary.nearExpiry}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
          <p className="text-sm text-gray-600">Expired</p>
          <p className="text-3xl font-bold text-orange-600">
            {summary.expired}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Overstock</p>
          <p className="text-3xl font-bold text-blue-600">
            {summary.overstock}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Types</option>
                <option value="low-stock">Low Stock</option>
                <option value="near-expiry">Near Expiry</option>
                <option value="expired">Expired</option>
                <option value="overstock">Overstock</option>
              </select>
            </div>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>

            <button
              onClick={fetchAlerts}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow">
          <div className="text-gray-500">Loading alerts...</div>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert, index) => {
            const severityColor = getAlertSeverityColor(alert.severity);

            return (
              <div
                key={`${alert.id}-${alert.item.id}-${index}`}
                className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                  alert.severity === "critical"
                    ? "border-red-500"
                    : alert.severity === "warning"
                    ? "border-yellow-500"
                    : "border-blue-500"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">
                      {getAlertIcon(alert.type, alert.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${severityColor}`}
                        >
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="flex items-center text-xs text-gray-500">
                          {getTypeIcon(alert.type)}
                          <span className="ml-1">
                            {alert.type.replace("-", " ").toUpperCase()}
                          </span>
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {alert.item.name}
                      </h3>
                      <p className="text-gray-700 mb-3">{alert.message}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">SKU</p>
                          <p className="font-medium text-gray-900">
                            {alert.item.sku}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Category</p>
                          <p className="font-medium text-gray-900">
                            {alert.item.category}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Current Stock</p>
                          <p className="font-medium text-gray-900">
                            {alert.item.currentQuantity} {alert.item.unit}
                          </p>
                        </div>
                        {alert.item.reorderLevel && (
                          <div>
                            <p className="text-gray-500">Reorder Level</p>
                            <p className="font-medium text-gray-900">
                              {alert.item.reorderLevel} {alert.item.unit}
                            </p>
                          </div>
                        )}
                        {alert.daysUntilExpiry !== undefined && (
                          <div>
                            <p className="text-gray-500">Days Until Expiry</p>
                            <p className="font-medium text-red-600">
                              {alert.daysUntilExpiry} days
                            </p>
                          </div>
                        )}
                        {alert.expiryDate && (
                          <div>
                            <p className="text-gray-500">Expiry Date</p>
                            <p className="font-medium text-gray-900">
                              {formatDate(alert.expiryDate)}
                            </p>
                          </div>
                        )}
                        {alert.stockDifference !== undefined && (
                          <div>
                            <p className="text-gray-500">Stock Difference</p>
                            <p className="font-medium text-gray-900">
                              {alert.stockDifference} {alert.item.unit}
                            </p>
                          </div>
                        )}
                        {alert.overstockPercentage !== undefined && (
                          <div>
                            <p className="text-gray-500">Overstock %</p>
                            <p className="font-medium text-gray-900">
                              {alert.overstockPercentage}%
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {formatDate(alert.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {alerts.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No alerts found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
