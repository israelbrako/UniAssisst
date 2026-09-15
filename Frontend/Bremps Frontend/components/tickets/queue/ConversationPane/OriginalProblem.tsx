import React, { useState } from "react";
import { Ticket } from "@/lib/types/ticket";
import { CategoryTag } from "@/components/tickets/CategoryTag";
import { UrgencyDot } from "@/components/tickets/UrgencyDot";
import { StatusBadge } from "@/components/tickets/StatusBadge";
import { formatRelativeTime } from "@/lib/utils";
import { FileText, Image as ImageIcon, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface OriginalProblemProps {
  ticket: Ticket;
}

export function OriginalProblem({ ticket }: OriginalProblemProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-amber-50/40 border-b border-amber-200/60 p-4 transition-all shrink-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0">
            !
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                Original Student Request
              </span>
              <span className="text-xs font-mono text-slate-400">({ticket.id})</span>
            </div>
            <h2 className="text-sm sm:text-base font-semibold text-slate-900 mt-0.5 leading-snug">
              {ticket.title}
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-amber-800/80 hover:text-amber-900 p-1 rounded-md hover:bg-amber-100/50 flex items-center gap-1 transition-colors shrink-0"
        >
          <span className="hidden sm:inline text-[11px] font-medium">
            {isExpanded ? "Collapse" : "Expand"}
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-2.5 pl-7 space-y-2.5 animate-fade-in">
          {/* Problem Body */}
          <div className="text-xs sm:text-sm text-slate-700 bg-white/80 p-3 rounded-lg border border-amber-200/50 leading-relaxed whitespace-pre-wrap">
            {ticket.description}
          </div>

          {/* Attachments if any */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-0.5">
              <span className="text-[11px] font-medium text-slate-500">Attachments:</span>
              {ticket.attachments.map((att) => (
                <a
                  key={att.id}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-slate-200 text-xs text-slate-700 hover:text-sky-600 hover:border-sky-300 transition-colors shadow-2xs"
                >
                  {att.type === "image" ? (
                    <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span className="truncate max-w-[140px]">{att.name}</span>
                  <span className="text-[10px] text-slate-400">({att.size})</span>
                </a>
              ))}
            </div>
          )}

          {/* Quick Context Bar */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <div className="flex items-center gap-2">
              <span>Submitted by <strong className="text-slate-800">{ticket.student.name}</strong></span>
              <span>•</span>
              <span>{formatRelativeTime(ticket.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <UrgencyDot urgency={ticket.urgency} showLabel />
              <StatusBadge status={ticket.status} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
