"use client";

import React from "react";
import { Ticket, TicketStatus } from "@/lib/types/ticket";
import { StatusBadge } from "@/components/tickets/StatusBadge";
import { useUpdateTicketStatus } from "@/lib/hooks/useTickets";
import { useClaimTicket } from "@/lib/hooks/useClaimTicket";
import { useAuth } from "@/lib/context/AuthContext";
import { CheckCircle2, UserCheck, Shield, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusControlProps {
  ticket: Ticket;
}

export function StatusControl({ ticket }: StatusControlProps) {
  const { user, activeAgent } = useAuth();
  const updateStatusMutation = useUpdateTicketStatus();
  const claimMutation = useClaimTicket();

  const statuses: { id: TicketStatus; label: string; desc: string }[] = [
    { id: "open", label: "Open", desc: "Awaiting review or unassigned" },
    { id: "claimed", label: "Claimed", desc: "Assigned to a specific tech" },
    { id: "in_progress", label: "In Progress", desc: "Currently investigating / working on fix" },
    { id: "resolved", label: "Resolved", desc: "Issue verified fixed with student" },
    { id: "closed", label: "Closed", desc: "Archived ticket" },
  ];

  const handleStatusChange = (newStatus: TicketStatus) => {
    updateStatusMutation.mutate({ ticketId: ticket.id, status: newStatus });
  };

  const handleClaim = () => {
    claimMutation.mutate({
      ticketId: ticket.id,
      agentId: user.agentDetails?.id || activeAgent.id,
    });
  };

  const isAssignedToMe = ticket.assignedAgentId === (user.agentDetails?.id || activeAgent.id);

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Shield className="w-3.5 h-3.5" />
          <span>Status & Triage</span>
        </div>
        <StatusBadge status={ticket.status} />
      </div>

      {/* Claim Ticket Action */}
      {!ticket.assignedAgentId && (
        <button
          type="button"
          onClick={handleClaim}
          disabled={claimMutation.isPending}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
        >
          <UserCheck className="w-4 h-4" />
          <span>{claimMutation.isPending ? "Claiming..." : "Claim Ticket as Tech"}</span>
        </button>
      )}

      {/* Status Transition Selector */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-slate-500">Update Ticket Lifecycle</label>
        <div className="relative">
          <select
            value={ticket.status}
            onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
            disabled={updateStatusMutation.isPending}
            className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer"
          >
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label} — {s.desc}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Quick Action Pills */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
        {ticket.status !== "in_progress" && ticket.status !== "resolved" && (
          <button
            type="button"
            onClick={() => handleStatusChange("in_progress")}
            className="flex-1 py-1.5 px-2 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-medium text-center transition-colors"
          >
            Start Progress
          </button>
        )}
        {ticket.status !== "resolved" && (
          <button
            type="button"
            onClick={() => handleStatusChange("resolved")}
            className="flex-1 py-1.5 px-2 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-semibold text-center transition-colors flex items-center justify-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mark Resolved</span>
          </button>
        )}
      </div>
    </div>
  );
}
