"use client";

import React, { useEffect, useRef } from "react";
import { TicketMessage } from "@/lib/types/ticket";
import { formatRelativeTime } from "@/lib/utils";
import { FileText, Image as ImageIcon, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageListProps {
  messages: TicketMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {messages.map((msg) => {
        const isAgent = msg.senderType === "agent";
        const isSystem = msg.senderType === "system";

        if (isSystem) {
          return (
            <div key={msg.id} className="flex items-center justify-center my-2">
              <span className="text-[11px] text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                {msg.content} • {formatRelativeTime(msg.createdAt)}
              </span>
            </div>
          );
        }

        return (
          <div
            key={msg.id}
            className={cn(
              "flex gap-3 max-w-[85%] group",
              isAgent ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            {/* Avatar */}
            <div className="shrink-0 mt-1">
              {msg.senderAvatar ? (
                <img
                  src={msg.senderAvatar}
                  alt={msg.senderName}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-2xs"
                />
              ) : (
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shadow-2xs",
                    isAgent ? "bg-sky-600 text-white" : "bg-slate-200 text-slate-700"
                  )}
                >
                  {msg.senderName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Bubble & Metadata */}
            <div className="space-y-1">
              <div
                className={cn(
                  "flex items-center gap-2 text-[11px]",
                  isAgent ? "justify-end text-slate-500" : "text-slate-500"
                )}
              >
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  {msg.senderName}
                  {isAgent && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded">
                      <Shield className="w-2.5 h-2.5" /> Agent
                    </span>
                  )}
                </span>
                <span>•</span>
                <span>{formatRelativeTime(msg.createdAt)}</span>
              </div>

              <div
                className={cn(
                  "p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs whitespace-pre-wrap",
                  isAgent
                    ? "bg-sky-600 text-white rounded-tr-xs"
                    : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs"
                )}
              >
                {msg.content}

                {/* Bubble Attachments */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-white/20 space-y-1.5">
                    {msg.attachments.map((att) => (
                      <div
                        key={att.id}
                        className={cn(
                          "flex items-center gap-2 text-xs p-1.5 rounded",
                          isAgent ? "bg-sky-700/60 text-sky-100" : "bg-slate-50 text-slate-700"
                        )}
                      >
                        {att.type === "image" ? (
                          <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span className="truncate">{att.name}</span>
                        <span className="text-[10px] opacity-75">({att.size})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
