import React from "react";
import { Ticket, TicketStatus } from "@/lib/types/ticket";
import { Check, Clock, ShieldCheck, Wrench, CheckCircle2, DollarSign } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface StatusTimelineProps {
  ticket: Ticket;
}

interface Step {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isCompleted: boolean;
  isCurrent: boolean;
}

export function StatusTimeline({ ticket }: StatusTimelineProps) {
  // Order: Submitted → Paid → Claimed → In Progress → Resolved
  const statusLevels: Record<TicketStatus, number> = {
    open: 1, // Submitted & Paid
    claimed: 2,
    in_progress: 3,
    resolved: 4,
    closed: 4,
  };

  const currentLevel = statusLevels[ticket.status] || 1;

  const steps: Step[] = [
    {
      id: "submitted",
      label: "Ticket Submitted",
      description: "Received by campus dispatch",
      icon: Clock,
      isCompleted: true,
      isCurrent: false,
    },
    {
      id: "paid",
      label: "Payment Confirmed",
      description: `${formatCurrency(ticket.amountPaid)} verified via Paystack`,
      icon: DollarSign,
      isCompleted: ticket.paymentStatus === "paid",
      isCurrent: ticket.status === "open" && ticket.paymentStatus === "paid",
    },
    {
      id: "claimed",
      label: "Claimed by Tech",
      description: ticket.assignedAgentId
        ? "Assigned to dedicated campus tech"
        : "Queued for next available tech",
      icon: ShieldCheck,
      isCompleted: currentLevel >= 2,
      isCurrent: currentLevel === 2,
    },
    {
      id: "in_progress",
      label: "Work in Progress",
      description: "Diagnostics and troubleshooting active",
      icon: Wrench,
      isCompleted: currentLevel >= 3,
      isCurrent: currentLevel === 3,
    },
    {
      id: "resolved",
      label: "Issue Resolved",
      description: ticket.resolvedAt ? "Solution verified" : "Pending final resolution",
      icon: CheckCircle2,
      isCompleted: currentLevel >= 4,
      isCurrent: currentLevel === 4,
    },
  ];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Resolution Milestones
        </h3>
        <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          Live Tracking
        </span>
      </div>

      <div className="relative pl-6 space-y-6">
        {/* Continuous Connecting Line */}
        <div className="absolute left-[11px] top-2 bottom-4 w-[2px] bg-slate-200" />

        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="relative flex items-start gap-3.5 group">
              {/* Node Indicator */}
              <div
                className={cn(
                  "absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all z-10",
                  step.isCompleted
                    ? "bg-emerald-600 text-white shadow-xs shadow-emerald-600/30"
                    : step.isCurrent
                    ? "bg-sky-600 text-white ring-4 ring-sky-100 animate-pulse"
                    : "bg-slate-100 border border-slate-300 text-slate-400"
                )}
              >
                {step.isCompleted ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <Icon className="w-3 h-3" />
                )}
              </div>

              {/* Step Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4
                    className={cn(
                      "text-xs font-semibold leading-none",
                      step.isCurrent
                        ? "text-sky-700 font-bold"
                        : step.isCompleted
                        ? "text-slate-900"
                        : "text-slate-400"
                    )}
                  >
                    {step.label}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
