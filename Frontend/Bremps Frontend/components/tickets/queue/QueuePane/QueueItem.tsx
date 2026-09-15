import React from "react";
import { Ticket } from "@/lib/types/ticket";
import { UrgencyDot } from "@/components/tickets/UrgencyDot";
import { CategoryTag } from "@/components/tickets/CategoryTag";
import { StatusBadge } from "@/components/tickets/StatusBadge";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface QueueItemProps {
  ticket: Ticket;
  isSelected: boolean;
  onSelect: (ticketId: string) => void;
}

export function QueueItem({ ticket, isSelected, onSelect }: QueueItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(ticket.id)}
      className={cn(
        "w-full text-left p-3 border-b border-slate-100 transition-all cursor-pointer relative",
        isSelected
          ? "bg-sky-50/70 border-l-4 border-l-sky-600 pl-2.5"
          : "hover:bg-slate-50 border-l-4 border-l-transparent"
      )}
    >
      {/* Row 1: Student Name + Urgency Dot + Time */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <UrgencyDot urgency={ticket.urgency} />
          <span className="font-semibold text-xs text-slate-900 truncate">
            {ticket.student.name}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 shrink-0">
          {formatRelativeTime(ticket.createdAt)}
        </span>
      </div>

      {/* Row 2: Ticket Title Snippet */}
      <h4 className="text-xs text-slate-700 font-medium line-clamp-1 mb-1.5 leading-snug">
        {ticket.title}
      </h4>

      {/* Row 3: Category Tag + Ticket ID / Status */}
      <div className="flex items-center justify-between gap-1.5">
        <CategoryTag categoryId={ticket.categoryId} size="sm" />
        <span className="text-[10px] font-mono text-slate-400 font-medium">
          {ticket.id}
        </span>
      </div>
    </button>
  );
}
