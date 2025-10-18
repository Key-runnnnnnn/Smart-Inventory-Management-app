"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { InventoryItem, TransactionReason } from "@/types";

const stockTransactionSchema = z.object({
  quantity: z.number().min(1, "Quantity must be at least 1"),
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().optional(),
  partyName: z.string().optional(),
  partyContact: z.string().optional(),
  referenceNumber: z.string().optional(),
  unitCost: z.number().optional(),
});

type StockTransactionFormData = z.infer<typeof stockTransactionSchema>;

interface StockTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StockTransactionFormData) => Promise<void>;
  item: InventoryItem | null;
  type: "in" | "out";
}

const stockInReasons: TransactionReason[] = [
  "Purchase",
  "Return from Customer",
  "Production",
  "Transfer In",
  "Adjustment",
  "Other",
];

const stockOutReasons: TransactionReason[] = [
  "Sale",
  "Return to Supplier",
  "Damaged",
  "Expired",
  "Transfer Out",
  "Adjustment",
  "Other",
];

export default function StockTransactionModal({
  isOpen,
  onClose,
  onSubmit,
  item,
  type,
}: StockTransactionModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StockTransactionFormData>({
    resolver: zodResolver(stockTransactionSchema),
  });

  const handleFormSubmit = async (data: StockTransactionFormData) => {
    await onSubmit(data);
    reset();
  };

  if (!isOpen || !item) return null;

  const reasons = type === "in" ? stockInReasons : stockOutReasons;
  const title = type === "in" ? "Stock In" : "Stock Out";
  const buttonColor =
    type === "in"
      ? "bg-green-600 hover:bg-green-700"
      : "bg-orange-600 hover:bg-orange-700";

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

        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {item.name} ({item.sku})
              </p>
              <p className="text-sm text-gray-500">
                Current Stock: {item.quantity} {item.unit}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Quantity *
                </label>
                <input
                  type="number"
                  {...register("quantity", { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  placeholder={`Enter quantity in ${item.unit}`}
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.quantity.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Reason *
                </label>
                <select
                  {...register("reason")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                >
                  <option value="">Select Reason</option>
                  {reasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
                {errors.reason && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.reason.message}
                  </p>
                )}
              </div>

              {type === "in" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Unit Cost
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("unitCost", { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    placeholder="Cost per unit"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Party Name
                </label>
                <input
                  type="text"
                  {...register("partyName")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  placeholder={
                    type === "in" ? "Supplier name" : "Customer name"
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Party Contact
                </label>
                <input
                  type="text"
                  {...register("partyContact")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  placeholder="Phone or email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Reference Number
                </label>
                <input
                  type="text"
                  {...register("referenceNumber")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  placeholder="Invoice/PO number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  {...register("notes")}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  placeholder="Additional notes..."
                />
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
                className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${buttonColor} disabled:opacity-50`}
              >
                {isSubmitting ? "Processing..." : `Confirm ${title}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
