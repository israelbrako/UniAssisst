"use client";

import React, { useEffect, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Ticket } from "@/lib/types/ticket";
import { QueuePane } from "./QueuePane/QueuePane";
import { ConversationPane } from "./ConversationPane/ConversationPane";
import { MetadataPane } from "./MetadataPane/MetadataPane";

interface TicketQueueShellProps {
  tickets: Ticket[];
  isLoading?: boolean;
}

export function TicketQueueShell({ tickets, isLoading = false }: TicketQueueShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get active ticket from URL query param: ?ticket=abc123
  const activeTicketParam = searchParams.get("ticket");

  // Determine active ticket object
  const activeTicket = useMemo(() => {
    if (!tickets.length) return null;
    if (activeTicketParam) {
      const found = tickets.find((t) => t.id === activeTicketParam);
      if (found) return found;
    }
    // Default to first ticket if none specified or not found
    return tickets[0];
  }, [tickets, activeTicketParam]);

  // Sync default selection into URL if missing
  useEffect(() => {
    if (tickets.length > 0 && !activeTicketParam && activeTicket) {
      router.replace(`${pathname}?ticket=${activeTicket.id}`, { scroll: false });
    }
  }, [tickets, activeTicketParam, activeTicket, router, pathname]);

  const handleSelectTicket = (ticketId: string) => {
    router.push(`${pathname}?ticket=${ticketId}`, { scroll: false });
  };

  return (
    <div className="w-full min-h-full flex flex-col overflow-y-auto lg:h-full lg:flex-row lg:overflow-hidden">
      {/* 1. Left Pane: 280px fixed width queue */}
      <div className="h-80 w-full shrink-0 lg:h-full lg:w-[300px] xl:w-[320px]">
        <QueuePane
          tickets={tickets}
          selectedTicketId={activeTicket?.id}
          onSelectTicket={handleSelectTicket}
          isLoading={isLoading}
        />
      </div>

      {/* 2. Middle Pane: 1fr fluid conversation thread (only one that scrolls) */}
      <div className="h-[70vh] min-h-[32rem] w-full shrink-0 min-w-0 lg:h-full lg:flex-1">
        <ConversationPane ticket={activeTicket} />
      </div>

      {/* 3. Right Pane: 320px fixed metadata sidebar */}
      <div className="min-h-[30rem] w-full shrink-0 lg:h-full lg:w-[320px] xl:w-[340px]">
        <MetadataPane ticket={activeTicket} />
      </div>
    </div>
  );
}
