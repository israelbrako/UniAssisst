"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Ticket } from "@/lib/types/ticket";
import { StatusBadge } from "@/components/tickets/StatusBadge";
import { UrgencyDot } from "@/components/tickets/UrgencyDot";
import { CategoryTag } from "@/components/tickets/CategoryTag";
import { formatRelativeTime } from "@/lib/utils";
import { ArrowRight, Search, PlusCircle, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TicketListProps {
  tickets: Ticket[];
}

export function TicketList({ tickets }: TicketListProps) {
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("all");
  const [search, setSearch] = useState("");

  const filtered = tickets.filter((ticket) => {
    if (filter === "active" && (ticket.status === "resolved" || ticket.status === "closed")) {
      return false;
    }
    if (filter === "resolved" && ticket.status !== "resolved" && ticket.status !== "closed") {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        ticket.title.toLowerCase().includes(q) ||
        ticket.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              filter === "all" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
            )}
          >
            All Tickets ({tickets.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("active")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              filter === "active" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
            )}
          >
            Active ({tickets.filter((t) => t.status !== "resolved" && t.status !== "closed").length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("resolved")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              filter === "resolved" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
            )}
          >
            Resolved ({tickets.filter((t) => t.status === "resolved" || t.status === "closed").length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Grid of Ticket Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
          <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">No Tickets Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            You don't have any support requests in this view.
          </p>
          <Link
            href="/new-ticket"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit a New Ticket</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/ticket/${ticket.id}`}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {ticket.id}
                    </span>
                    <CategoryTag categoryId={ticket.categoryId} size="sm" />
                  </div>
                  <StatusBadge status={ticket.status} />
                </div>

                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2 mb-2">
                  {ticket.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                  {ticket.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <UrgencyDot urgency={ticket.urgency} />
                  <span>Updated {formatRelativeTime(ticket.updatedAt)}</span>
                </div>

                <span className="flex items-center gap-1 font-medium text-sky-600 group-hover:translate-x-0.5 transition-transform">
                  <span>Track Status</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
