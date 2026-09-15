"use client";

import React, { useState } from "react";
import { CATEGORIES, HelpCategory } from "@/lib/constants/categories";
import { CategoryIcon } from "@/components/tickets/CategoryTag";
import { formatCurrency } from "@/lib/utils";
import { Tag, Save, Check, Clock, DollarSign } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<HelpCategory[]>(CATEGORIES);
  const [savedId, setSavedId] = useState<string | null>(null);

  const handlePriceChange = (id: string, newPrice: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, basePrice: newPrice } : c))
    );
  };

  const handleSlaChange = (id: string, newSla: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, slaHours: newSla } : c))
    );
  };

  const handleSave = (id: string) => {
    setSavedId(id);
    setTimeout(() => setSavedId(null), 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Category Pricing & SLA Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Modify GHS prices and targeted turnaround SLAs across the {CATEGORIES.length} AURATECH software services.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
          >
            {/* Category Info */}
            <div className="flex items-start gap-3.5 min-w-0 md:w-1/2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                <CategoryIcon categoryId={cat.id} className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{cat.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                  {cat.description}
                </p>
              </div>
            </div>

            {/* Price & SLA Controls */}
            <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
              {/* Base Price input */}
              <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Base Price (GHS)
                </label>
                <div className="relative w-28">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    value={cat.basePrice}
                    onChange={(e) => handlePriceChange(cat.id, parseFloat(e.target.value) || 0)}
                    className="w-full pl-6 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* SLA Hours input */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Target SLA
                </label>
                <div className="relative w-28">
                  <input
                    type="number"
                    value={cat.slaHours}
                    onChange={(e) => handleSlaChange(cat.id, parseInt(e.target.value) || 1)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    hrs
                  </span>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 md:pt-0">
                <button
                  type="button"
                  onClick={() => handleSave(cat.id)}
                  className="px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {savedId === cat.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Updated</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
