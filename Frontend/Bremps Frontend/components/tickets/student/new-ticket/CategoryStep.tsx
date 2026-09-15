"use client";

import React from "react";
import { CATEGORIES, HelpCategory } from "@/lib/constants/categories";
import { CategoryIcon } from "@/components/tickets/CategoryTag";
import { formatCurrency } from "@/lib/utils";
import { Check, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryStepProps {
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  onNext: () => void;
}

export function CategoryStep({
  selectedCategoryId,
  onSelectCategory,
  onNext,
}: CategoryStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-1">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          Select Help Category
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Choose the service category that best matches your campus IT issue. Pricing and technician assignment are customized per category.
        </p>
      </div>

      {/* 6 Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={cn(
                "p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between group",
                isSelected
                  ? "border-sky-600 bg-sky-50/40 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
              )}
            >
              {/* Popular badge */}
              {cat.popular && (
                <span className="absolute -top-2.5 right-4 inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                  <Sparkles className="w-2.5 h-2.5 text-amber-600" /> Popular
                </span>
              )}

              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                      isSelected
                        ? "bg-sky-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 group-hover:bg-slate-200"
                    )}
                  >
                    <CategoryIcon categoryId={cat.id} className="w-5 h-5" />
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-medium">Starting at</span>
                    <span className="text-base font-bold text-slate-900">
                      {formatCurrency(cat.basePrice)}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1.5 group-hover:text-sky-600 transition-colors">
                  {cat.name}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  {cat.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Avg {cat.slaHours}h SLA</span>
                </span>

                <div
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center border transition-all",
                    isSelected
                      ? "bg-sky-600 border-sky-600 text-white"
                      : "border-slate-300 group-hover:border-slate-400"
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={onNext}
          disabled={!selectedCategoryId}
          className={cn(
            "px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs",
            selectedCategoryId
              ? "bg-sky-600 hover:bg-sky-700 text-white cursor-pointer shadow-sky-600/20"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          )}
        >
          Continue to Describe Issue →
        </button>
      </div>
    </div>
  );
}
