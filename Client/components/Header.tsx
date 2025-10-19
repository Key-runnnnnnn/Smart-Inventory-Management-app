"use client";

import { Bell, Search, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { alertsAPI } from "@/lib/api";

export default function Header() {
  const [alertCount, setAlertCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetchAlertSummary();
  }, []);

  const fetchAlertSummary = async () => {
    try {
      const response: { data: { total: number } } =
        (await alertsAPI.getSummary()) as { data: { total: number } };
      setAlertCount(response.data.total || 0);
    } catch (error) {
      console.error("Error fetching alert summary:", error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
        {/* Search */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4 ml-4">
          {/* Notifications */}
          <button
            onClick={() => router.push("/alerts")}
            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="View Alerts"
          >
            <Bell className="w-6 h-6" />
            {alertCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {alertCount > 9 ? "9+" : alertCount}
              </span>
            )}
          </button>

          {/* User menu */}
          <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              Admin
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
