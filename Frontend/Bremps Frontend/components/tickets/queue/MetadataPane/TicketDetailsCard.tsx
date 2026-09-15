import React from "react";
import { Ticket } from "@/lib/types/ticket";
import { CategoryTag } from "@/components/tickets/CategoryTag";
import { UrgencyDot } from "@/components/tickets/UrgencyDot";
import { getAgentById } from "@/lib/constants/agents";
import { formatCurrency } from "@/lib/utils";
import {
  FileCode2,
  Clock,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Tag,
  ShieldAlert,
} from "lucide-react";

interface TicketDetailsCardProps {
  ticket: Ticket;
}

export function TicketDetailsCard({ ticket }: TicketDetailsCardProps) {
  const agent = getAgentById(ticket.assignedAgentId);

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
        <FileCode2 className="w-3.5 h-3.5" />
        <span>Ticket Details</span>
      </div>

      <div className="space-y-2.5 text-xs">
        {/* Ticket ID & Created */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-slate-500">Ticket ID</span>
          <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
            {ticket.id}
          </span>
        </div>

        {/* Category */}
        <div className="flex items-center justify-between">
          <span className="text-slate-500 flex items-center gap-1">
            <Tag className="w-3 h-3 text-slate-400" /> Category
          </span>
          <CategoryTag categoryId={ticket.categoryId} />
        </div>

        {/* Urgency */}
        <div className="flex items-center justify-between">
          <span className="text-slate-500 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-slate-400" /> Urgency
          </span>
          <UrgencyDot urgency={ticket.urgency} showLabel />
        </div>

        {/* Payment Status */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-slate-500 flex items-center gap-1">
            <CreditCard className="w-3 h-3 text-slate-400" /> Payment
          </span>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-800">
              {formatCurrency(ticket.amountPaid)}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle className="w-2.5 h-2.5" /> Paid
            </span>
          </div>
        </div>

        {/* Payment Ref */}
        {ticket.paymentRef && (
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Reference</span>
            <span className="font-mono">{ticket.paymentRef}</span>
          </div>
        )}

        {/* Assigned Agent */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-slate-500">Assigned Tech</span>
          {agent ? (
            <div className="flex items-center gap-1.5">
              <img
                src={agent.avatar}
                alt={agent.name}
                className="w-4 h-4 rounded-full object-cover"
              />
              <span className="font-medium text-slate-800">{agent.name}</span>
            </div>
          ) : (
            <span className="text-slate-400 italic">Unassigned</span>
          )}
        </div>
      </div>
    </div>
  );
}
