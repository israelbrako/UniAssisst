"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ticketStore } from "@/lib/store/ticketStore";
import { Ticket } from "@/lib/types/ticket";

export function useClaimTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, agentId }: { ticketId: string; agentId: string }) => {
      const updated = ticketStore.claimTicket(ticketId, agentId);
      if (!updated) throw new Error("Ticket not found");
      return updated;
    },
    onMutate: async ({ ticketId, agentId }) => {
      // Cancel ongoing queries to avoid race conditions
      await queryClient.cancelQueries({ queryKey: ["tickets"] });
      await queryClient.cancelQueries({ queryKey: ["ticket", ticketId] });

      const previousTickets = queryClient.getQueryData<Ticket[]>(["tickets"]);
      const previousTicket = queryClient.getQueryData<Ticket>(["ticket", ticketId]);

      // Optimistically update tickets in cache
      queryClient.setQueriesData<Ticket[]>({ queryKey: ["tickets"] }, (old) => {
        if (!old) return [];
        return old.map((t) =>
          t.id === ticketId
            ? { ...t, assignedAgentId: agentId, status: t.status === "open" ? "claimed" : t.status }
            : t
        );
      });

      if (previousTicket) {
        queryClient.setQueryData<Ticket>(["ticket", ticketId], {
          ...previousTicket,
          assignedAgentId: agentId,
          status: previousTicket.status === "open" ? "claimed" : previousTicket.status,
        });
      }

      return { previousTickets, previousTicket };
    },
    onError: (_err, { ticketId }, context) => {
      if (context?.previousTickets) {
        queryClient.setQueryData(["tickets"], context.previousTickets);
      }
      if (context?.previousTicket) {
        queryClient.setQueryData(["ticket", ticketId], context.previousTicket);
      }
    },
    onSettled: (_data, _error, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
    },
  });
}
