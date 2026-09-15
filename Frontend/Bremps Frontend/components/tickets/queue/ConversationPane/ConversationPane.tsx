"use client";

import React from "react";
import { Ticket, Attachment } from "@/lib/types/ticket";
import { OriginalProblem } from "./OriginalProblem";
import { MessageList } from "./MessageList";
import { MessageComposer } from "./MessageComposer";
import { useTicketMessages } from "@/lib/hooks/useTicketMessages";
import { useAuth } from "@/lib/context/AuthContext";
import { Inbox } from "lucide-react";

interface ConversationPaneProps {
  ticket?: Ticket | null;
}

export function ConversationPane({ ticket }: ConversationPaneProps) {
  const { user, activeAgent } = useAuth();
  const ticketId = ticket?.id || "";

  const { data: messages = [], sendMessage, isSending, isLoading } = useTicketMessages(ticketId);

  if (!ticket) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
          <Inbox className="w-7 h-7 text-slate-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-700">No Ticket Selected</h3>
        <p className="text-xs text-slate-400 max-w-xs mt-1">
          Select a ticket from the queue on the left to view the thread, student history, and metadata.
        </p>
      </div>
    );
  }

  const handleSendMessage = async (content: string, attachments?: Attachment[]) => {
    await sendMessage({
      senderType: "agent",
      senderId: user.id || activeAgent.id,
      senderName: user.name || activeAgent.name,
      senderAvatar: user.avatar || activeAgent.avatar,
      content,
      attachments,
    });
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-slate-50/30 overflow-hidden relative">
      {/* 1. PINNED CARD AT TOP: The student's initial description, never scrolls away */}
      <OriginalProblem ticket={ticket} />

      {/* 2. THE THREAD: Middle pane is the only one that scrolls independently */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoading ? (
          <div className="p-6 text-center text-xs text-slate-400">Loading conversation...</div>
        ) : (
          <MessageList messages={messages} />
        )}
      </div>

      {/* 3. MESSAGE COMPOSER: Bottom fixed bar */}
      <MessageComposer
        categoryId={ticket.categoryId}
        onSendMessage={handleSendMessage}
        isSending={isSending}
      />
    </div>
  );
}
