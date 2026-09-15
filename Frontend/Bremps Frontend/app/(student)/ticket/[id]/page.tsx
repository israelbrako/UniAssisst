"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useTicket } from "@/lib/hooks/useTickets";
import { TicketDetail } from "@/components/tickets/student/TicketDetail";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function StudentTicketDetailPage() {
  const params = useParams<{ id: string }>();
  const ticketId = params.id;

  const { data: ticket, isLoading } = useTicket(ticketId);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-xs text-slate-400">
        Loading ticket {ticketId}...
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900">Ticket Not Found</h2>
        <p className="text-xs text-slate-500">
          We couldn't find a support ticket with ID &ldquo;{ticketId}&rdquo;.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <TicketDetail ticket={ticket} />
    </div>
  );
}
