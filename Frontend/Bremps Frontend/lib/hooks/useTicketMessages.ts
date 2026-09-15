"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { ticketStore } from "@/lib/store/ticketStore";
import { TicketMessage } from "@/lib/types/ticket";
import { supabase } from "@/lib/supabase/client";

export function useTicketMessages(ticketId: string) {
  const queryClient = useQueryClient();

  // Supabase Realtime + Local fallback subscription
  useEffect(() => {
    if (!ticketId) return;

    // 1. Supabase Channel subscription (if live supabase configured)
    let channel: any;
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        channel = supabase
          .channel(`ticket_messages:${ticketId}`)
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "ticket_messages", filter: `ticket_id=eq.${ticketId}` },
            (payload) => {
              queryClient.setQueryData<TicketMessage[]>(["messages", ticketId], (old = []) => [
                ...old,
                payload.new as TicketMessage,
              ]);
            }
          )
          .subscribe();
      }
    } catch {
      // Ignored for offline/local simulation
    }

    // 2. Local reactive broadcast subscription
    const handleLocalUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ ticketId?: string; messages?: Record<string, TicketMessage[]> }>;
      if (customEvent.detail && (!customEvent.detail.ticketId || customEvent.detail.ticketId === ticketId)) {
        queryClient.invalidateQueries({ queryKey: ["messages", ticketId] });
      }
    };

    window.addEventListener("campus-messages-updated", handleLocalUpdate);

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      window.removeEventListener("campus-messages-updated", handleLocalUpdate);
    };
  }, [ticketId, queryClient]);

  const query = useQuery({
    queryKey: ["messages", ticketId],
    queryFn: async () => {
      return ticketStore.getMessages(ticketId);
    },
    enabled: Boolean(ticketId),
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: Omit<TicketMessage, "id" | "ticketId" | "createdAt">) => {
      return ticketStore.addMessage(ticketId, messageData);
    },
    onSuccess: (newMessage) => {
      queryClient.setQueryData<TicketMessage[]>(["messages", ticketId], (old = []) => [...old, newMessage]);
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
    },
  });

  return {
    ...query,
    sendMessage: sendMessageMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
  };
}
