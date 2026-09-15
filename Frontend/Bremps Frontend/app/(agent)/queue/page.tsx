"use client";

import React, { Suspense } from "react";
import { useTickets } from "@/lib/hooks/useTickets";
import { TicketQueueShell } from "@/components/tickets/queue/TicketQueueShell";

function QueueContent() {
  const { data: tickets = [], isLoading } = useTickets();

  return <TicketQueueShell tickets={tickets} isLoading={isLoading} />;
}

export default function AgentQueuePage() {
  return (
    <Suspense
      fallback={
        <div className="h-full flex items-center justify-center text-xs text-slate-400">
          Loading 3-Pane Desk...
        </div>
      }
    >
      <QueueContent />
    </Suspense>
  );
}
