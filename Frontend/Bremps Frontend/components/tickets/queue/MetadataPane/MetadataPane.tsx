"use client";

import React from "react";
import { Ticket } from "@/lib/types/ticket";
import { StudentInfoCard } from "./StudentInfoCard";
import { TicketDetailsCard } from "./TicketDetailsCard";
import { StatusControl } from "./StatusControl";
import { AttachmentsList } from "./AttachmentsList";
import { SlidersHorizontal } from "lucide-react";

interface MetadataPaneProps {
  ticket?: Ticket | null;
}

export function MetadataPane({ ticket }: MetadataPaneProps) {
  if (!ticket) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-white border-l border-slate-200">
        <SlidersHorizontal className="w-8 h-8 text-slate-300 mb-2" />
        <p className="text-xs">Ticket metadata will appear here when selected.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50/60 border-l border-slate-200 p-4 space-y-4">
      {/* Status & LifeCycle Controls */}
      <StatusControl ticket={ticket} />

      {/* Ticket Details (Category, Urgency, Payment) */}
      <TicketDetailsCard ticket={ticket} />

      {/* Student Profile Card */}
      <StudentInfoCard student={ticket.student} />

      {/* Attachments */}
      <AttachmentsList attachments={ticket.attachments} />
    </div>
  );
}
