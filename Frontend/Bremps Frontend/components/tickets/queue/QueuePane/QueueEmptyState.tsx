import React from "react";
import { CheckCircle2, FilterX } from "lucide-react";

interface QueueEmptyStateProps {
  onResetFilters?: () => void;
  isFiltered?: boolean;
}

export function QueueEmptyState({ onResetFilters, isFiltered = false }: QueueEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center h-64">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        {isFiltered ? <FilterX className="w-6 h-6 text-slate-500" /> : <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
      </div>
      <h4 className="text-sm font-semibold text-slate-800 mb-1">
        {isFiltered ? "No matching tickets" : "All clear! Queue is empty"}
      </h4>
      <p className="text-xs text-slate-500 max-w-[200px] mb-4">
        {isFiltered
          ? "No tickets match your category or status filters."
          : "There are currently no active tickets needing attention."}
      </p>
      {isFiltered && onResetFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="text-xs text-sky-600 hover:text-sky-700 font-medium underline underline-offset-2"
        >
          Reset all filters
        </button>
      )}
    </div>
  );
}
