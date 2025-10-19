"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Download, RefreshCw } from "lucide-react";
import { InventoryItem, Category } from "@/types";
import { inventoryAPI, getApiBaseUrl } from "@/lib/api";
import InventoryTable from "@/components/inventory/InventoryTable";
import ItemModal from "@/components/inventory/ItemModal";
import StockTransactionModal from "@/components/inventory/StockTransactionModal";
import ItemDetailsModal from "@/components/inventory/ItemDetailsModal";
import { transactionsAPI } from "@/lib/api";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showItemModal, setShowItemModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stockModalType, setStockModalType] = useState<"in" | "out">("in");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
  });

  const categories: Category[] = [
    "Electronics",
    "Furniture",
    "Clothing",
    "Food & Beverage",
    "Raw Materials",
    "Finished Goods",
    "Office Supplies",
    "Other",
  ];

  useEffect(() => {
    fetchItems();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory, currentPage]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      };
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;

      const response = await inventoryAPI.getAll(params);

      // The axios interceptor returns response.data, which has this structure:
      // { success: true, count: 10, total: 20, page: 1, pages: 2, data: [...] }
      const responseData = response as any;

      setItems(responseData.data || []);
      setTotalPages(responseData.pages || 1);
      setTotalItems(responseData.total || 0);
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await inventoryAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      // Set default values on error
      setStats({
        total: 0,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0,
      });
    }
  };

  const handleAddItem = () => {
    setSelectedItem(null);
    setShowItemModal(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowItemModal(true);
  };

  const handleViewItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const handleStockIn = (item: InventoryItem) => {
    setSelectedItem(item);
    setStockModalType("in");
    setShowStockModal(true);
  };

  const handleStockOut = (item: InventoryItem) => {
    setSelectedItem(item);
    setStockModalType("out");
    setShowStockModal(true);
  };

  const handleItemSubmit = async (data: Record<string, unknown>) => {
    try {
      // Transform data before sending
      const transformedData = {
        ...data,
        // Ensure numeric fields are properly converted
        quantity: Number(data.quantity) || 0,
        reorderLevel: Number(data.reorderLevel) || 10,
        maxStockLevel: data.maxStockLevel
          ? Number(data.maxStockLevel)
          : undefined,
        costPrice: Number(data.costPrice) || 0,
        sellingPrice: Number(data.sellingPrice) || 0,
      };

      if (selectedItem) {
        await inventoryAPI.update(selectedItem._id, transformedData);
        alert("Item updated successfully!");
      } else {
        await inventoryAPI.create(transformedData);
        alert("Item created successfully!");
      }
      setShowItemModal(false);
      fetchItems();
      fetchStats();
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string; error?: string } };
      };
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to save item";

      console.error("Error saving item:", error);
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleStockTransactionSubmit = async (
    data: Record<string, unknown>
  ) => {
    if (!selectedItem) return;

    try {
      // Transform data to match backend expectations
      const payload: Record<string, unknown> = {
        itemId: selectedItem._id,
        quantity: Number(data.quantity) || 1,
        reason: data.reason,
        notes: data.notes || "",
        referenceNumber: data.referenceNumber || "",
        invoiceNumber: data.invoiceNumber || "",
        performedBy: data.performedBy || "System",
      };

      // Add party information if provided
      if (data.partyName || data.partyContact) {
        payload.party = {
          name: data.partyName || "",
          type: data.partyType || "other",
          contact: data.partyContact || "",
        };
      }

      // Add unit price for stock-in transactions
      if (stockModalType === "in" && data.unitPrice) {
        payload.unitPrice = Number(data.unitPrice);
      }

      // Add unit price for stock-out sales
      if (stockModalType === "out" && data.reason === "sale") {
        payload.unitPrice = selectedItem.sellingPrice; // Use item's selling price
      }

      console.log("Submitting transaction:", payload); // Debug log

      if (stockModalType === "in") {
        await transactionsAPI.stockIn(payload);
        alert("Stock added successfully!");
      } else {
        await transactionsAPI.stockOut(payload);
        alert("Stock removed successfully!");
      }

      setShowStockModal(false);
      fetchItems();
      fetchStats();
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string; error?: string } };
      };
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to process transaction";

      console.error("Error processing transaction:", error);
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleExport = () => {
    try {
      const apiBaseUrl = getApiBaseUrl();
      window.open(`${apiBaseUrl}/reports/export/inventory/csv`, "_blank");
    } catch {
      alert("Failed to export inventory");
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Inventory Management
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your inventory items and stock levels
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Items</p>
          <p className="text-3xl font-bold text-gray-900">
            {loading ? (
              <span className="animate-pulse bg-gray-300 h-8 w-16 block rounded"></span>
            ) : (
              stats.total || 0
            )}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600">In Stock</p>
          <p className="text-3xl font-bold text-green-600">
            {loading ? (
              <span className="animate-pulse bg-gray-300 h-8 w-16 block rounded"></span>
            ) : (
              stats.inStock || 0
            )}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600">Low Stock</p>
          <p className="text-3xl font-bold text-yellow-600">
            {loading ? (
              <span className="animate-pulse bg-gray-300 h-8 w-16 block rounded"></span>
            ) : (
              stats.lowStock || 0
            )}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600">Out of Stock</p>
          <p className="text-3xl font-bold text-red-600">
            {loading ? (
              <span className="animate-pulse bg-gray-300 h-8 w-16 block rounded"></span>
            ) : (
              stats.outOfStock || 0
            )}
          </p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={fetchItems}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>

            <button
              onClick={handleExport}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-5 h-5 mr-2" />
              Export
            </button>

            <button
              onClick={handleAddItem}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Item
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <>
          <InventoryTable
            items={items}
            onEdit={handleEditItem}
            onView={handleViewItem}
            onStockIn={handleStockIn}
            onStockOut={handleStockOut}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white p-4 rounded-lg shadow mt-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, totalItems)}
                  </span>{" "}
                  of <span className="font-medium">{totalItems}</span> results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <div className="flex items-center space-x-1">
                    {[...Array(totalPages)].map((_, idx) => {
                      const pageNum = idx + 1;
                      // Show first page, last page, current page, and pages around current
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 &&
                          pageNum <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 border rounded-md text-sm font-medium ${
                              currentPage === pageNum
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        pageNum === currentPage - 2 ||
                        pageNum === currentPage + 2
                      ) {
                        return (
                          <span key={pageNum} className="px-2 text-gray-500">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <ItemModal
        isOpen={showItemModal}
        onClose={() => setShowItemModal(false)}
        onSubmit={handleItemSubmit}
        item={selectedItem}
      />

      <StockTransactionModal
        isOpen={showStockModal}
        onClose={() => setShowStockModal(false)}
        onSubmit={handleStockTransactionSubmit}
        item={selectedItem}
        type={stockModalType}
      />

      <ItemDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        item={selectedItem}
      />
    </div>
  );
}
