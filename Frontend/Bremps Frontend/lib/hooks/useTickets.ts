"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { ticketStore } from "@/lib/store/ticketStore";
import { Ticket, TicketStatus } from "@/lib/types/ticket";

export interface TicketFilterOptions {
  categoryId?: string;
  status?: string;
  assignedAgentId?: string;
  searchQuery?: string;
}

export function useTickets(filters?: TicketFilterOptions) {
  const queryClient = useQueryClient();

  // Listen for local real-time broadcasts
  useEffect(() => {
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    };

    window.addEventListener("campus-tickets-updated", handleUpdate);
    return () => {
      window.removeEventListener("campus-tickets-updated", handleUpdate);
    };
  }, [queryClient]);

  const query = useQuery({
    queryKey: ["tickets", filters],
    queryFn: async () => {
      let tickets = ticketStore.getAllTickets();

      if (filters?.categoryId && filters.categoryId !== "all") {
        tickets = tickets.filter((t) => t.categoryId === filters.categoryId);
      }

      if (filters?.status && filters.status !== "all") {
        tickets = tickets.filter((t) => t.status === filters.status);
      }

      if (filters?.assignedAgentId) {
        tickets = tickets.filter((t) => t.assignedAgentId === filters.assignedAgentId);
      }

      if (filters?.searchQuery && filters.searchQuery.trim()) {
        const queryLower = filters.searchQuery.toLowerCase();
        tickets = tickets.filter(
          (t) =>
            t.title.toLowerCase().includes(queryLower) ||
            t.id.toLowerCase().includes(queryLower) ||
            t.student.name.toLowerCase().includes(queryLower) ||
            t.student.studentId.toLowerCase().includes(queryLower)
        );
      }

      return tickets;
    },
    initialData: [],
  });

  return query;
}

export function useTicket(id: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", id] });
    };

    window.addEventListener("campus-tickets-updated", handleUpdate);
    return () => {
      window.removeEventListener("campus-tickets-updated", handleUpdate);
    };
  }, [id, queryClient]);

  return useQuery({
    queryKey: ["ticket", id],
    queryFn: async () => {
      const ticket = ticketStore.getTicketById(id);
      return ticket || null;
    },
    enabled: Boolean(id),
    initialData: null,
  });
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: TicketStatus }) => {
      return ticketStore.updateStatus(ticketId, status);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket", variables.ticketId] });
    },
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Ticket, "id" | "createdAt" | "updatedAt">) => {
      return ticketStore.createTicket(data);
    },
    onSuccess: (newTicket) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket", newTicket.id] });
    },
  });
}
