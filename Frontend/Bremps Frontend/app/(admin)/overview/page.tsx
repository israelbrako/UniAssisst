"use client";

import React from "react";
import { useTickets } from "@/lib/hooks/useTickets";
import { CATEGORIES } from "@/lib/constants/categories";
import { AGENTS } from "@/lib/constants/agents";
import { CategoryTag } from "@/components/tickets/CategoryTag";
import { StatusBadge } from "@/components/tickets/StatusBadge";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import {
  DollarSign,
  Inbox,
  Clock,
  Star,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";

export default function AdminOverviewPage() {
  const { data: tickets = [] } = useTickets();

  // Metrics calculation
  const totalRevenue = tickets.reduce((acc, t) => acc + (t.amountPaid || 0), 0);
  const totalVolume = tickets.length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length;
  const activeCount = totalVolume - resolvedCount;
  const resolvedTickets = tickets.filter((ticket) => ticket.resolvedAt);
  const averageResolutionHours = resolvedTickets.length
    ? resolvedTickets.reduce((total, ticket) => {
        const created = new Date(ticket.createdAt).getTime();
        const resolved = new Date(ticket.resolvedAt || ticket.updatedAt).getTime();
        return total + Math.max(0, resolved - created) / (1000 * 60 * 60);
      }, 0) / resolvedTickets.length
    : 0;
  const ratedTickets = tickets.filter((ticket) => ticket.rating);
  const averageRating = ratedTickets.length
    ? ratedTickets.reduce((total, ticket) => total + (ticket.rating?.score || 0), 0) / ratedTickets.length
    : 0;

  // Category counts
  const categoryStats = CATEGORIES.map((cat) => {
    const catTickets = tickets.filter((t) => t.categoryId === cat.id);
    const catRevenue = catTickets.reduce((acc, t) => acc + (t.amountPaid || 0), 0);
    return {
      ...cat,
      count: catTickets.length,
      revenue: catRevenue,
      percent: totalVolume > 0 ? Math.round((catTickets.length / totalVolume) * 100) : 0,
    };
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Operations & Revenue Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time analytics for AURATECH support volume, revenue, and SLA performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Ready
          </span>
        </div>
      </div>

      {/* KPI Cards (Revenue, Volume, Avg Resolution Time, Rating) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {formatCurrency(totalRevenue)}
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> {totalRevenue > 0 ? "Active" : "Awaiting data"}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">From AURATECH ticket payments</p>
        </div>

        {/* 2. Total Volume */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ticket Volume
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{totalVolume}</span>
            <span className="text-xs font-medium text-slate-500">
              ({activeCount} active, {resolvedCount} resolved)
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Handled by the {AGENTS.length}-person AURATECH team</p>
        </div>

        {/* 3. Avg Resolution Time */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Avg Resolution Time
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{averageResolutionHours ? `${averageResolutionHours.toFixed(1)} hrs` : "--"}</span>
            <span className="text-xs font-semibold text-slate-500">{resolvedTickets.length ? "From resolved tickets" : "Awaiting data"}</span>
          </div>
          <p className="text-[11px] text-slate-400">Based on resolved software requests</p>
        </div>

        {/* 4. Student Rating */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Student CSAT
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{averageRating ? `${averageRating.toFixed(2)} / 5.0` : "--"}</span>
            <span className="text-xs font-semibold text-slate-500">{ratedTickets.length ? `${ratedTickets.length} review${ratedTickets.length === 1 ? "" : "s"}` : "Awaiting reviews"}</span>
          </div>
          <p className="text-[11px] text-slate-400">Based on post-resolution surveys</p>
        </div>
      </div>

      {/* Category Breakdown & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Volume & Revenue Breakdown (2-cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Category Volume & Revenue</h2>
              <p className="text-xs text-slate-500">Distribution across the {CATEGORIES.length} AURATECH software services</p>
            </div>
          </div>

          <div className="space-y-3.5">
            {categoryStats.map((cat) => (
              <div key={cat.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CategoryTag categoryId={cat.id} />
                    <span className="text-slate-500 font-medium">({cat.count} tickets)</span>
                  </div>
                  <div className="flex items-center gap-3 font-semibold text-slate-800">
                    <span>{formatCurrency(cat.revenue)}</span>
                    <span className="text-slate-400 text-[11px] w-8 text-right font-mono">
                      {cat.percent}%
                    </span>
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-600 rounded-full transition-all"
                    style={{ width: `${cat.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Ticket Triage Stream (1-col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent AURATECH Tickets</h2>
              <p className="text-xs text-slate-500">Latest submissions</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {tickets.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No tickets have been submitted yet.</p>
            ) : tickets.slice(0, 5).map((t) => (
              <div key={t.id} className="py-2.5 space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold text-xs text-slate-900 truncate">
                    {t.student.name}
                  </span>
                  <StatusBadge status={t.status} size="sm" />
                </div>
                <p className="text-xs text-slate-600 line-clamp-1">{t.title}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-mono">{t.id}</span>
                  <span>{formatRelativeTime(t.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
