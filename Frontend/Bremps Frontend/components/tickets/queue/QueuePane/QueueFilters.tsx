"use client";

import React from "react";
import { CATEGORIES } from "@/lib/constants/categories";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface QueueFiltersProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  ticketCountsByStatus: Record<string, number>;
}

export function QueueFilters({
  selectedCategory,
  onSelectCategory,
  selectedStatus,
  onSelectStatus,
  searchQuery,
  onSearchChange,
  ticketCountsByStatus,
}: QueueFiltersProps) {
  const statuses = [
    { id: "all", label: "All Active" },
    { id: "open", label: "Open" },
    { id: "claimed", label: "Claimed" },
    { id: "in_progress", label: "In Progress" },
    { id: "resolved", label: "Resolved" },
  ];

  return (
    <div className="p-3 border-b border-slate-200 bg-white space-y-2.5">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter by name, ID, or issue..."
          className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:bg-white transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Status Segmented Buttons */}
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
        {statuses.map((status) => {
          const isSelected = selectedStatus === status.id;
          const count =
            status.id === "all"
              ? Object.values(ticketCountsByStatus).reduce((a, b) => a + b, 0)
              : ticketCountsByStatus[status.id] || 0;

          return (
            <button
              key={status.id}
              type="button"
              onClick={() => onSelectStatus(status.id)}
              className={cn(
                "px-2 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1",
                isSelected
                  ? "bg-slate-900 text-white font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              <span>{status.label}</span>
              <span
                className={cn(
                  "text-[9px] px-1 rounded-full font-mono",
                  isSelected ? "bg-slate-700 text-white" : "bg-slate-200/80 text-slate-600"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Filter Chips (6 categories) */}
      <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
        <button
          type="button"
          onClick={() => onSelectCategory("all")}
          className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap border transition-colors",
            selectedCategory === "all"
              ? "bg-sky-50 text-sky-700 border-sky-300 font-semibold"
              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
          )}
        >
          All Categories
        </button>

        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap border transition-colors",
                isSelected
                  ? "bg-sky-50 text-sky-700 border-sky-300 font-semibold"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              )}
            >
              {cat.shortName}
            </button>
          );
        })}
      </div>
    </div>
  );
}
