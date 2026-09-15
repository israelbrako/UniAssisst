import React from "react";
import { TicketUrgency } from "@/lib/types/ticket";
import { cn } from "@/lib/utils";

interface UrgencyDotProps {
  urgency: TicketUrgency;
  className?: string;
  showLabel?: boolean;
}

const URGENCY_CONFIG: Record<TicketUrgency, { label: string; dot: string; text: string; bg: string }> = {
  low: {
    label: "Low",
    dot: "bg-slate-400",
    text: "text-slate-600",
    bg: "bg-slate-50 border-slate-200",
  },
  normal: {
    label: "Normal",
    dot: "bg-amber-500",
    text: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
  },
  urgent: {
    label: "Urgent",
    dot: "bg-rose-500 animate-pulse",
    text: "text-rose-700 font-semibold",
    bg: "bg-rose-50 border-rose-200",
  },
};

export function UrgencyDot({ urgency, className, showLabel = false }: UrgencyDotProps) {
  const config = URGENCY_CONFIG[urgency] || URGENCY_CONFIG.normal;

  if (showLabel) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border font-medium",
          config.bg,
          config.text,
          className
        )}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
        <span>{config.label}</span>
      </span>
    );
  }

  return (
    <span
      title={`Urgency: ${config.label}`}
      className={cn("inline-block w-2.5 h-2.5 rounded-full shrink-0", config.dot, className)}
    />
  );
}
