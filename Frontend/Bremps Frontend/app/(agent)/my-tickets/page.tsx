"use client";

import React, { Suspense } from "react";
import { useTickets } from "@/lib/hooks/useTickets";
import { useAuth } from "@/lib/context/AuthContext";
import { TicketQueueShell } from "@/components/tickets/queue/TicketQueueShell";

function MyTicketsContent() {
  const { activeAgent } = useAuth();
  const { data: allTickets = [], isLoading } = useTickets();

  // Filter to tickets assigned to active agent
  const myTickets = allTickets.filter(
    (t) => t.assignedAgentId === activeAgent.id
  );

  return <TicketQueueShell tickets={myTickets} isLoading={isLoading} />;
}

export default function MyTicketsPage() {
  return (
    <Suspense
      fallback={
        <div className="h-full flex items-center justify-center text-xs text-slate-400">
          Loading My Tickets...
        </div>
      }
    >
      <MyTicketsContent />
    </Suspense>
  );
}
