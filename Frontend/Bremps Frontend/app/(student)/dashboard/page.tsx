"use client";

import React from "react";
import Link from "next/link";
import { useTickets } from "@/lib/hooks/useTickets";
import { useAuth } from "@/lib/context/AuthContext";
import { TicketList } from "@/components/tickets/student/TicketList";
import { PlusCircle, LifeBuoy, Clock, CheckCircle2, ShieldAlert } from "lucide-react";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const { data: tickets = [], isLoading } = useTickets();

  const activeCount = tickets.filter(
    (t) => t.status !== "resolved" && t.status !== "closed"
  ).length;
  const resolvedCount = tickets.filter(
    (t) => t.status === "resolved" || t.status === "closed"
  ).length;
  const userInitials = user.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "ST";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Student Welcome Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg">
            {userInitials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                Welcome Back {user.name || "there"} 😊
              </h1>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                {user.studentId || "Student ID pending"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              AURATECH • Student Self-Service Portal
            </p>
          </div>
        </div>

        <Link
          href="/new-ticket"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs shadow-sky-600/20 transition-all cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Submit Support Request</span>
        </Link>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Active Requests</span>
            <h3 className="text-lg font-bold text-slate-900">{activeCount}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Resolved Cases</span>
            <h3 className="text-lg font-bold text-slate-900">{resolvedCount}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <LifeBuoy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Campus Desk Status</span>
            <h3 className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              All 3 Techs Online
            </h3>
          </div>
        </div>
      </div>

      {/* Simplified Single-Pane Ticket List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">
            My Support Tickets
          </h2>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading your tickets...</div>
        ) : (
          <TicketList tickets={tickets} />
        )}
      </div>
    </div>
  );
}
