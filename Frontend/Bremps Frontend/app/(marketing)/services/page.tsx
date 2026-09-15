import React from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/constants/categories";
import { CategoryIcon } from "@/components/tickets/CategoryTag";
import { formatCurrency } from "@/lib/utils";
import { Clock, CheckCircle2, ArrowRight, ShieldCheck, LifeBuoy } from "lucide-react";

export default function ServicesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
          AURATECH Service Catalog
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Software Problem Support
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Choose from six focused software support categories. Every request includes dedicated technician assignment, live diagnostics, and post-resolution follow-up.
        </p>
      </div>

      {/* 6 Category Cards */}
      <div className="content-stagger grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className="interactive-lift bg-white p-6 rounded-2xl border border-slate-200 hover:border-sky-300 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <CategoryIcon categoryId={cat.id} className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">Standard Fee</span>
                  <span className="text-xl font-extrabold text-slate-900">
                    {formatCurrency(cat.basePrice)}
                  </span>
                </div>
              </div>

              <h2 className="text-base font-bold text-slate-900 mb-2">{cat.name}</h2>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">{cat.description}</p>

              <div className="space-y-2 mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Common Campus Scenarios
                </span>
                {cat.commonIssues.map((issue, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{cat.slaHours}h Response SLA</span>
              </span>

              <Link
                href="/new-ticket"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors shadow-xs"
              >
                <span>Book Service</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
