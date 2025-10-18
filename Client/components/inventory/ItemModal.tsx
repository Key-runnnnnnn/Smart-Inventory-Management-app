"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { InventoryItem, Category, Unit } from "@/types";

const itemSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  subCategory: z.string().optional(),
  unit: z.string().min(1, "Unit is required"),
  quantity: z.number().min(0, "Quantity must be 0 or greater"),
  reorderLevel: z.number().min(0, "Reorder level must be 0 or greater"),
  maxStockLevel: z.number().optional(),
  costPrice: z.number().min(0, "Cost price must be 0 or greater"),
  sellingPrice: z.number().min(0, "Selling price must be 0 or greater"),
  supplierName: z.string().optional(),
  supplierContact: z.string().optional(),
  warehouseLocation: z.string().optional(),
  rackNumber: z.string().optional(),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  manufacturingDate: z.string().optional(),
  status: z.enum(["active", "inactive", "discontinued"]),
});

type ItemFormData = z.infer<typeof itemSchema>;

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ItemFormData) => Promise<void>;
  item?: InventoryItem | null;
}

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

const units: Unit[] = [
  "pcs",
  "kg",
  "ltr",
  "box",
  "carton",
  "bag",
  "roll",
  "meter",
];

export default function ItemModal({
  isOpen,
  onClose,
  onSubmit,
  item,
}: ItemModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
  });

  useEffect(() => {
    if (item) {
      reset({
        sku: item.sku,
        name: item.name,
        description: item.description || "",
        category: item.category,
        subCategory: item.subCategory || "",
        unit: item.unit,
        quantity: item.quantity,
        reorderLevel: item.reorderLevel,
        maxStockLevel: item.maxStockLevel,
        costPrice: item.costPrice,
        sellingPrice: item.sellingPrice,
        supplierName: item.supplier?.name || "",
        supplierContact: item.supplier?.phone || "",
        warehouseLocation: item.warehouseLocation || "",
        rackNumber: item.rackNumber || "",
        batchNumber: item.batchNumber || "",
        expiryDate: item.expiryDate
          ? new Date(item.expiryDate).toISOString().split("T")[0]
          : "",
        manufacturingDate: item.manufacturingDate
          ? new Date(item.manufacturingDate).toISOString().split("T")[0]
          : "",
        status: item.status || "active",
      });
    } else {
      reset({
        quantity: 0,
        reorderLevel: 10,
        costPrice: 0,
        status: "active",
      });
    }
  }, [item, reset]);

  const handleFormSubmit = async (data: ItemFormData) => {
    await onSubmit(data);
    reset();
  };

  if (!isOpen) return null;

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

        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">
              {item ? "Edit Item" : "Add New Item"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    SKU *
                  </label>
                  <input
                    type="text"
                    {...register("sku")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  />
                  {errors.sku && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.sku.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name *
                  </label>
                  <input
                    type="text"
                    {...register("name")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    {...register("description")}
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  />
                </div>

                {/* Categorization */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category *
                  </label>
                  <select
                    {...register("category")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Sub Category
                  </label>
                  <input
                    type="text"
                    {...register("subCategory")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  />
                </div>

                {/* Stock Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Unit *
                  </label>
                  <select
                    {...register("unit")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  >
                    <option value="">Select Unit</option>
                    {units.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                  {errors.unit && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.unit.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    {...register("quantity", { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  />
                  {errors.quantity && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.quantity.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Reorder Level *
                  </label>
                  <input
                    type="number"
                    {...register("reorderLevel", { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  />
                  {errors.reorderLevel && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.reorderLevel.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Max Stock Level
                  </label>
                  <input
                    type="number"
                    {...register("maxStockLevel", { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  />
                </div>

                {/* Pricing */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Cost Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("costPrice", { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  />
                  {errors.costPrice && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.costPrice.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Selling Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("sellingPrice", { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  />
                  {errors.sellingPrice && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.sellingPrice.message}
                    </p>
                  )}
                </div>

                {/* Supplier Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Supplier Name
                  </label>
                  <input
                    type="text"
                    {...register("supplierName")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Supplier Contact
                  </label>
                  <input
                    type="text"
                    {...register("supplierContact")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  />
                </div>

                {/* Additional Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Warehouse Location
                  </label>
                  <input
                    type="text"
                    {...register("warehouseLocation")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Rack Number
                  </label>
                  <input
                    type="text"
                    {...register("rackNumber")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Batch Number
                  </label>
                  <input
                    type="text"
                    {...register("batchNumber")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Manufacturing Date
                  </label>
                  <input
                    type="date"
                    {...register("manufacturingDate")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    {...register("expiryDate")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Status *
                  </label>
                  <select
                    {...register("status")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="discontinued">Discontinued</option>
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.status.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : item ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
