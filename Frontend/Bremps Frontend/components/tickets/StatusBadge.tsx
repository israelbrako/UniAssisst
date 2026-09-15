import React from "react";
import { TicketStatus } from "@/lib/types/ticket";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: TicketStatus;
  className?: string;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  open: {
    label: "Open",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-600",
  },
  claimed: {
    label: "Claimed",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  in_progress: {
    label: "In Progress",
    bg: "bg-orange-50",
    text: "text-orange-900",
    border: "border-orange-200",
    dot: "bg-orange-600",
  },
  resolved: {
    label: "Resolved",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    dot: "bg-emerald-600",
  },
  closed: {
    label: "Closed",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    dot: "bg-slate-500",
  },
};

export function StatusBadge({ status, className, size = "sm" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.open;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors",
        config.bg,
        config.text,
        config.border,
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-xs sm:text-sm",
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dot)} />
      <span>{config.label}</span>
    </span>
  );
}
