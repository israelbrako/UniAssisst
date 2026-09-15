"use client";

import React, { useState } from "react";
import { Ticket } from "@/lib/types/ticket";
import { QueueFilters } from "./QueueFilters";
import { QueueItem } from "./QueueItem";
import { QueueEmptyState } from "./QueueEmptyState";

interface QueuePaneProps {
  tickets: Ticket[];
  selectedTicketId?: string;
  onSelectTicket: (ticketId: string) => void;
  isLoading?: boolean;
}

export function QueuePane({
  tickets,
  selectedTicketId,
  onSelectTicket,
  isLoading = false,
}: QueuePaneProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Calculate counts
  const ticketCountsByStatus: Record<string, number> = {
    open: tickets.filter((t) => t.status === "open").length,
    claimed: tickets.filter((t) => t.status === "claimed").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  };

  // Filtered tickets
  const filteredTickets = tickets.filter((ticket) => {
    if (selectedCategory !== "all" && ticket.categoryId !== selectedCategory) {
      return false;
    }
    if (selectedStatus !== "all" && ticket.status !== selectedStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ticket.title.toLowerCase().includes(q) ||
        ticket.id.toLowerCase().includes(q) ||
        ticket.student.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const isFiltered =
    selectedCategory !== "all" || selectedStatus !== "all" || searchQuery.trim().length > 0;

  const resetFilters = () => {
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSearchQuery("");
  };

  return (
    <div className="w-full h-full flex flex-col bg-white border-r border-slate-200 overflow-hidden">
      {/* Filters Header */}
      <QueueFilters
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        ticketCountsByStatus={ticketCountsByStatus}
      />

      {/* Ticket List Header Summary */}
      <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 font-medium flex items-center justify-between">
        <span>
          Showing <strong className="text-slate-700">{filteredTickets.length}</strong> tickets
        </span>
        {isFiltered && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-sky-600 hover:text-sky-700 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {isLoading ? (
          <div className="p-6 text-center text-xs text-slate-400">Loading tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <QueueEmptyState isFiltered={isFiltered} onResetFilters={resetFilters} />
        ) : (
          filteredTickets.map((ticket) => (
            <QueueItem
              key={ticket.id}
              ticket={ticket}
              isSelected={ticket.id === selectedTicketId}
              onSelect={onSelectTicket}
            />
          ))
        )}
      </div>
    </div>
  );
}
