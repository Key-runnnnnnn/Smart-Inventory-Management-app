"use client";

import React, { useState, useEffect } from "react";
import {
  Brain,
  TrendingUp,
  Send,
  Package,
  RefreshCw,
  Search,
} from "lucide-react";
import { forecastAPI, inventoryAPI } from "@/lib/api";
import { InventoryItem, Forecast } from "@/types";
import { formatCurrency } from "@/lib/utils";

export default function ForecastingPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showNewBadge, setShowNewBadge] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      // Fetch all items without pagination limit
      const response = await inventoryAPI.getAll({ limit: 1000 });
      setItems(response.data.items || response.data);
    } catch (error) {
      console.error("Failed to fetch items:", error);
    }
  };

  const handleForecast = async () => {
    if (!selectedItem) return;

    try {
      setLoading(true);
      const response = await forecastAPI.getItemForecast(selectedItem.id, 30);
      setForecast(response.data);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Forecast error:", error);
      alert(
        err.response?.data?.message ||
          "Failed to generate forecast. Check console for details."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAIQuery = async () => {
    if (!aiQuery.trim()) return;

    try {
      setAiLoading(true);
      setAiResponse("");
      setShowNewBadge(false);
      const response = await forecastAPI.getRestockSuggestions(aiQuery);
      setAiResponse(
        response.data.response ||
          response.data.suggestions ||
          "No response received"
      );
      setShowNewBadge(true);
      setTimeout(() => setShowNewBadge(false), 3000);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("AI Suggestions error:", error);
      setAiResponse(
        err.response?.data?.message ||
          "Failed to get AI suggestions. Please try again."
      );
    } finally {
      setAiLoading(false);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "increasing") {
      return <TrendingUp className="w-5 h-5 text-green-600" />;
    } else if (trend === "decreasing") {
      return (
        <TrendingUp className="w-5 h-5 text-red-600 transform rotate-180" />
      );
    } else {
      return (
        <TrendingUp className="w-5 h-5 text-gray-600 transform rotate-0" />
      );
    }
  };

  // Helper function to format text with bold markdown
  const formatText = (text: string) => {
    if (!text.includes("**")) {
      return text;
    }

    const parts = text.split("**");
    return (
      <>
        {parts.map((part, i) =>
          i % 2 === 1 ? (
            <strong
              key={i}
              className="font-bold text-indigo-900 bg-indigo-50 px-1 rounded"
            >
              {part}
            </strong>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            AI Forecasting & Insights
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered demand forecasting and restock suggestions
          </p>
        </div>
        <button
          onClick={() => setShowAIModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Brain className="w-5 h-5" />
          <span className="font-semibold">Open AI Assistant</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Item Selection & Forecast */}
        <div className="space-y-6">
          {/* Item Selection */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Select Item for Forecast
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedItem?.id || ""}
                onChange={(e) => {
                  const item = items.find((i) => i.id === e.target.value);
                  setSelectedItem(item || null);
                  setForecast(null);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select an item...</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.sku}) - {item.quantity} {item.unit}
                  </option>
                ))}
              </select>
            </div>

            {selectedItem && (
              <div className="mt-4">
                <button
                  onClick={handleForecast}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Brain className="w-5 h-5 mr-2" />
                  {loading ? "Generating..." : "Generate Forecast"}
                </button>
              </div>
            )}
          </div>

          {/* Forecast Results */}
          {forecast && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-indigo-600" />
                AI Forecast Results
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Predicted Demand</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {forecast.forecast?.predictedDemand || 0} {forecast.unit}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Daily Average</p>
                  <p className="text-2xl font-bold text-green-600">
                    {forecast.forecast?.dailyAverageForecast?.toFixed(1) ||
                      "0.0"}{" "}
                    {forecast.unit}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Reorder Quantity</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {forecast.forecast?.recommendedReorderQuantity || 0}{" "}
                    {forecast.unit}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Reorder Point</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {forecast.forecast?.recommendedReorderPoint || 0}{" "}
                    {forecast.unit}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Confidence:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getConfidenceColor(
                      forecast.forecast?.confidence || "medium"
                    )}`}
                  >
                    {(forecast.forecast?.confidence || "medium").toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Trend:</span>
                  {getTrendIcon(forecast.forecast?.trend || "stable")}
                  <span className="font-semibold text-gray-900">
                    {forecast.forecast?.trend || "stable"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Seasonality:</span>
                  <span className="font-semibold text-gray-900">
                    {forecast.forecast?.seasonalityDetected
                      ? "Detected"
                      : "None"}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Brain className="w-4 h-4 mr-2" />
                    AI Insights
                  </h3>
                  <p className="text-sm text-gray-700">
                    {forecast.forecast?.insights || "No insights available"}
                  </p>
                </div>

                {forecast.forecast?.risks && (
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Risks & Considerations
                    </h3>
                    <p className="text-sm text-gray-700">
                      {forecast.forecast.risks}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Historical Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Sales</p>
                    <p className="font-semibold text-gray-900">
                      {forecast.statistics?.totalSales || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Avg Daily Sales</p>
                    <p className="font-semibold text-gray-900">
                      {forecast.statistics?.avgDailySales || "0.0"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">7-Day Average</p>
                    <p className="font-semibold text-gray-900">
                      {forecast.statistics?.sma7 || "0.0"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">30-Day Average</p>
                    <p className="font-semibold text-gray-900">
                      {forecast.statistics?.sma30 || "0.0"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-6 relative overflow-hidden flex-shrink-0">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                    backgroundSize: "32px 32px",
                  }}
                ></div>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        AI Assistant
                      </h2>
                      <p className="text-sm text-purple-100">
                        Powered by Gemini 2.0 Flash
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAIModal(false)}
                    className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-base text-purple-50 leading-relaxed">
                  Get intelligent insights about your inventory restocking needs
                </p>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 min-h-[450px]">
                {aiResponse ? (
                  <div className="space-y-3 animate-fadeIn">
                    {/* AI Response Badge */}
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-900">
                          AI Assistant
                        </p>
                        <p className="text-xs text-gray-500">Just now</p>
                      </div>
                    </div>

                    {/* Formatted Response */}
                    <div className="prose prose-sm max-w-none pl-10">
                      {aiResponse.split("\n").map((line, index) => {
                        const trimmedLine = line.trim();

                        if (!trimmedLine) {
                          return <div key={index} className="h-2" />;
                        }

                        // Numbered lists
                        if (/^\d+\./.test(trimmedLine)) {
                          const content = trimmedLine.replace(/^\d+\.\s*/, "");
                          const number = trimmedLine.match(/^\d+/)?.[0];
                          return (
                            <div
                              key={index}
                              className="flex items-start mb-3 group"
                            >
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs mr-3 flex-shrink-0 mt-0.5 shadow-md group-hover:shadow-lg transition-shadow">
                                {number}
                              </span>
                              <span className="flex-1 leading-relaxed text-gray-700">
                                {formatText(content)}
                              </span>
                            </div>
                          );
                        }
                        // Bullet points
                        else if (/^[-*•]/.test(trimmedLine)) {
                          const content = trimmedLine.substring(1).trim();
                          return (
                            <div
                              key={index}
                              className="flex items-start mb-2 ml-2"
                            >
                              <span className="text-indigo-500 mr-3 mt-1.5 font-bold text-lg leading-none">
                                •
                              </span>
                              <span className="flex-1 leading-relaxed text-gray-700">
                                {formatText(content)}
                              </span>
                            </div>
                          );
                        }
                        // Section headers
                        else if (
                          trimmedLine.endsWith(":") &&
                          trimmedLine.length < 60 &&
                          !trimmedLine.includes("**")
                        ) {
                          return (
                            <h4
                              key={index}
                              className="font-bold text-gray-900 mt-5 mb-3 text-base border-l-4 border-indigo-500 pl-3 bg-indigo-50 py-2 rounded-r"
                            >
                              {trimmedLine}
                            </h4>
                          );
                        }
                        // Regular paragraphs
                        else {
                          return (
                            <p
                              key={index}
                              className="mb-2 leading-relaxed text-gray-700"
                            >
                              {formatText(trimmedLine)}
                            </p>
                          );
                        }
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                      <Brain className="w-8 h-8 text-indigo-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      Ready to assist you!
                    </p>
                    <p className="text-xs text-gray-500 mb-4 max-w-xs">
                      Ask me anything about your inventory. Here are some
                      examples:
                    </p>
                    <div className="space-y-2 w-full">
                      {[
                        "Which items need restocking urgently?",
                        "What's the optimal reorder quantity?",
                        "Show me slow-moving inventory",
                        "Forecast demand for next month",
                      ].map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => setAiQuery(suggestion)}
                          className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-lg text-xs text-gray-700 hover:text-indigo-700 transition-all duration-200"
                        >
                          💡 {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-gray-200 flex-shrink-0">
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && !aiLoading && handleAIQuery()
                    }
                    placeholder="Type your question here..."
                    className="w-full px-5 py-4 pr-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-base transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={aiLoading}
                  />
                  {aiQuery && !aiLoading && (
                    <button
                      onClick={() => setAiQuery("")}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAIQuery}
                  disabled={aiLoading || !aiQuery.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-3 font-semibold text-base"
                >
                  {aiLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Thinking...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send</span>
                    </>
                  )}
                </button>
              </div>
              {aiLoading && (
                <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600">
                  <div className="flex space-x-1">
                    <div
                      className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                  <span>AI is analyzing your inventory data...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
