"use client";

import React from "react";
import {
  X,
  Package,
  DollarSign,
  MapPin,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { InventoryItem } from "@/types";
import { formatCurrency, formatDate, getStockStatusColor } from "@/lib/utils";

interface ItemDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}

export default function ItemDetailsModal({
  isOpen,
  onClose,
  item,
}: ItemDetailsModalProps) {
  if (!isOpen || !item) return null;

  const stockColor = getStockStatusColor(item.stockStatus || "in-stock");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">Item Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            {/* Basic Information */}
            <div className="mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-2xl font-bold text-gray-900">
                    {item.name}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">SKU: {item.sku}</p>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-2">
                      {item.description}
                    </p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full ${stockColor}`}
                >
                  {item.stockStatus}
                </span>
              </div>
            </div>

            {/* Stock Information */}
            <div className="mb-6">
              <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Package className="w-4 h-4 mr-2" />
                Stock Information
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Current Stock</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {item.quantity} {item.unit}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Reorder Level</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {item.reorderLevel} {item.unit}
                  </p>
                </div>
                {item.maxStockLevel && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Max Stock</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {item.maxStockLevel} {item.unit}
                    </p>
                  </div>
                )}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Stock Value</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(item.stockValue)}
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="mb-6">
              <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Pricing
              </h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Cost Price</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(item.costPrice)}
                  </p>
                </div>
                {item.sellingPrice && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Selling Price</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(item.sellingPrice)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Category Information */}
            <div className="mb-6">
              <h5 className="text-sm font-semibold text-gray-700 mb-3">
                Category
              </h5>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="text-sm font-medium text-gray-900">
                    {item.category}
                  </p>
                </div>
                {item.subCategory && (
                  <div>
                    <p className="text-xs text-gray-500">Sub Category</p>
                    <p className="text-sm font-medium text-gray-900">
                      {item.subCategory}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Supplier Information */}
            {item.supplier && (
              <div className="mb-6">
                <h5 className="text-sm font-semibold text-gray-700 mb-3">
                  Supplier Information
                </h5>
                <div className="grid grid-cols-2 gap-4">
                  {item.supplier.name && (
                    <div>
                      <p className="text-xs text-gray-500">Supplier Name</p>
                      <p className="text-sm font-medium text-gray-900">
                        {item.supplier.name}
                      </p>
                    </div>
                  )}
                  {item.supplier.phone && (
                    <div>
                      <p className="text-xs text-gray-500">Contact</p>
                      <p className="text-sm font-medium text-gray-900">
                        {item.supplier.phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location */}
            {item.warehouseLocation && (
              <div className="mb-6">
                <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Location
                </h5>
                <p className="text-sm text-gray-900">
                  {item.warehouseLocation}
                  {item.rackNumber && ` - Rack: ${item.rackNumber}`}
                </p>
              </div>
            )}

            {/* Batch & Expiry Information */}
            {(item.batchNumber ||
              item.manufacturingDate ||
              item.expiryDate) && (
              <div className="mb-6">
                <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Batch & Expiry
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {item.batchNumber && (
                    <div>
                      <p className="text-xs text-gray-500">Batch Number</p>
                      <p className="text-sm font-medium text-gray-900">
                        {item.batchNumber}
                      </p>
                    </div>
                  )}
                  {item.manufacturingDate && (
                    <div>
                      <p className="text-xs text-gray-500">
                        Manufacturing Date
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(item.manufacturingDate)}
                      </p>
                    </div>
                  )}
                  {item.expiryDate && (
                    <div>
                      <p className="text-xs text-gray-500">Expiry Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(item.expiryDate)}
                      </p>
                      {item.expiryStatus && item.expiryStatus !== "valid" && (
                        <span className="inline-flex items-center mt-1 text-xs text-red-600">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {item.expiryStatus}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="mb-4 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <p>Created: {formatDate(item.createdAt)}</p>
                </div>
                <div>
                  <p>Last Updated: {formatDate(item.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-between pt-4 border-t">
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  item.status === "active"
                    ? "bg-green-100 text-green-800"
                    : item.status === "discontinued"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {item.status?.toUpperCase() || "ACTIVE"}
              </span>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
