"use client";

import React, { useState } from "react";
import { CANNED_RESPONSES, CannedResponse } from "@/lib/constants/cannedResponses";
import { CATEGORIES } from "@/lib/constants/categories";
import { Sparkles, X, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CannedResponsesProps {
  categoryId?: string;
  onSelect: (responseContent: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function CannedResponses({
  categoryId,
  onSelect,
  isOpen,
  onClose,
}: CannedResponsesProps) {
  const [filterCategory, setFilterCategory] = useState<string>(categoryId || "all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = CANNED_RESPONSES.filter((cr) => {
    if (filterCategory === "all") return true;
    return cr.categoryId === filterCategory;
  });

  const handleInsert = (cr: CannedResponse) => {
    setCopiedId(cr.id);
    onSelect(cr.content);
    setTimeout(() => {
      onClose();
      setCopiedId(null);
    }, 200);
  };

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 mx-4 bg-white border border-slate-200 rounded-xl shadow-xl z-30 overflow-hidden animate-fade-in max-h-80 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Insert Canned Response</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-100 overflow-x-auto no-scrollbar bg-slate-50/50">
        <button
          type="button"
          onClick={() => setFilterCategory("all")}
          className={cn(
            "px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap transition-colors",
            filterCategory === "all"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-200"
          )}
        >
          All ({CANNED_RESPONSES.length})
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setFilterCategory(cat.id)}
            className={cn(
              "px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap transition-colors",
              filterCategory === cat.id
                ? "bg-sky-600 text-white font-semibold"
                : "text-slate-600 hover:bg-slate-200"
            )}
          >
            {cat.shortName}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="overflow-y-auto divide-y divide-slate-100 p-1">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No canned responses for this category.
          </div>
        ) : (
          filtered.map((cr) => (
            <button
              key={cr.id}
              type="button"
              onClick={() => handleInsert(cr)}
              className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 transition-colors group flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-800 group-hover:text-sky-600 flex items-center gap-1.5">
                  <span>{cr.title}</span>
                  {copiedId === cr.id && (
                    <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-bold">
                      <Check className="w-3 h-3" /> Inserted
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                  {cr.content}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 shrink-0 mt-1" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
