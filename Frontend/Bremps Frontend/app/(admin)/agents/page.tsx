"use client";

import React, { useState } from "react";
import { AGENTS, Agent } from "@/lib/constants/agents";
import { useTickets } from "@/lib/hooks/useTickets";
import { CategoryTag } from "@/components/tickets/CategoryTag";
import { Users2, Mail, Shield, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminAgentsPage() {
  const { data: tickets = [] } = useTickets();
  const [agentsList, setAgentsList] = useState<Agent[]>(AGENTS);

  const toggleAgentStatus = (agentId: string) => {
    setAgentsList((prev) =>
      prev.map((a) => {
        if (a.id === agentId) {
          const nextStatus = a.status === "online" ? "away" : "online";
          return { ...a, status: nextStatus };
        }
        return a;
      })
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          AURATECH Specialists ({AGENTS.length}-Person Team)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Monitor shift presence, current ticket workloads, and specialty categories.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {agentsList.map((agent) => {
          const assignedTickets = tickets.filter(
            (t) => t.assignedAgentId === agent.id && t.status !== "resolved" && t.status !== "closed"
          );
          const resolvedTickets = tickets.filter(
            (t) => t.assignedAgentId === agent.id && (t.status === "resolved" || t.status === "closed")
          );
          const agentRatings = tickets
            .filter((ticket) => ticket.assignedAgentId === agent.id && ticket.rating)
            .map((ticket) => ticket.rating?.score || 0);
          const averageRating = agentRatings.length
            ? agentRatings.reduce((total, score) => total + score, 0) / agentRatings.length
            : 0;

          return (
            <div
              key={agent.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5 flex flex-col justify-between"
            >
              <div>
                {/* Agent Header + Avatar */}
                <div className="flex items-start justify-between gap-3">
                  <div className="relative">
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100"
                    />
                    <span
                      className={cn(
                        "absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ring-2 ring-white",
                        agent.status === "online" ? "bg-emerald-500" : "bg-amber-500"
                      )}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleAgentStatus(agent.id)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer",
                      agent.status === "online"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    )}
                  >
                    {agent.status === "online" ? "● Online on Shift" : "○ On Break / Away"}
                  </button>
                </div>

                {/* Name & Role */}
                <div className="mt-3">
                  <h3 className="text-base font-bold text-slate-900">{agent.name}</h3>
                  <p className="text-xs text-sky-600 font-medium">{agent.role}</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3" />
                    <span>{agent.email}</span>
                  </p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                  {averageRating ? (
                    <>
                      <span className="text-xs font-bold text-slate-800">{averageRating.toFixed(2)} / 5.0</span>
                      <span className="text-[11px] text-slate-400">({agentRatings.length} review{agentRatings.length === 1 ? "" : "s"})</span>
                    </>
                  ) : (
                    <span className="text-[11px] text-slate-400">No reviews yet</span>
                  )}
                </div>

                {/* Workload metrics */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Active Queue
                    </span>
                    <span className="text-lg font-bold text-slate-900">
                      {assignedTickets.length}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Resolved Today
                    </span>
                    <span className="text-lg font-bold text-emerald-600">
                      {resolvedTickets.length}
                    </span>
                  </div>
                </div>

                {/* Specialty Categories */}
                <div className="mt-4 space-y-2">
                  <span className="text-[11px] uppercase font-bold text-slate-400 block">
                    Specialties
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.specialtyCategories.map((catId) => (
                      <CategoryTag key={catId} categoryId={catId} size="sm" />
                    ))}
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
