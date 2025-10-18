"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from "lucide-react";
import { StockTransaction } from "@/types";
import { transactionsAPI } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [stats, setStats] = useState({
    totalIn: 0,
    totalOut: 0,
    totalAdjustments: 0,
    totalValue: 0,
  });

  useEffect(() => {
    fetchTransactions();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterType]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterType) params.type = filterType;

      const response = await transactionsAPI.getAll(params);
      setTransactions(response.data.transactions || response.data);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await transactionsAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "in":
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case "out":
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <RefreshCw className="w-5 h-5 text-blue-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      in: "bg-green-100 text-green-800",
      out: "bg-red-100 text-red-800",
      adjustment: "bg-blue-100 text-blue-800",
    };
    return badges[type as keyof typeof badges] || "bg-gray-100 text-gray-800";
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const item =
      typeof transaction.itemId === "object" ? transaction.itemId : null;
    const itemName = item?.name || "";
    const itemSku = item?.sku || "";
    return (
      itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itemSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reason.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-600 mt-1">
          View all stock transactions history
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Stock In</p>
          <p className="text-3xl font-bold text-green-600">{stats.totalIn}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Stock Out</p>
          <p className="text-3xl font-bold text-red-600">{stats.totalOut}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600">Adjustments</p>
          <p className="text-3xl font-bold text-blue-600">
            {stats.totalAdjustments}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Value</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(stats.totalValue)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Types</option>
                <option value="in">Stock In</option>
                <option value="out">Stock Out</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>

            <button
              onClick={fetchTransactions}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Party
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => {
                  const item =
                    typeof transaction.itemId === "object"
                      ? transaction.itemId
                      : null;

                  return (
                    <tr key={transaction._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(transaction.transactionDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.sku}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getTypeIcon(transaction.type)}
                          <span
                            className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadge(
                              transaction.type
                            )}`}
                          >
                            {transaction.type.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.type === "out" && "-"}
                        {transaction.quantity}
                        <span className="text-xs text-gray-500 ml-1">
                          ({transaction.previousQuantity} →{" "}
                          {transaction.newQuantity})
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.party?.name || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transaction.totalAmount
                          ? formatCurrency(transaction.totalAmount)
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No transactions found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
