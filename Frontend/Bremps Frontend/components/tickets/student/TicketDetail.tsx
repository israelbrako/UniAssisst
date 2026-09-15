"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Ticket, Attachment } from "@/lib/types/ticket";
import { StatusTimeline } from "./StatusTimeline";
import { MessageList } from "../queue/ConversationPane/MessageList";
import { MessageComposer } from "../queue/ConversationPane/MessageComposer";
import { StatusBadge } from "@/components/tickets/StatusBadge";
import { UrgencyDot } from "@/components/tickets/UrgencyDot";
import { CategoryTag } from "@/components/tickets/CategoryTag";
import { RatingStars } from "@/components/tickets/RatingStars";
import { useTicketMessages } from "@/lib/hooks/useTicketMessages";
import { getAgentById } from "@/lib/constants/agents";
import { ticketStore } from "@/lib/store/ticketStore";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { ArrowLeft, CreditCard, Shield, User, CheckCircle2, Star } from "lucide-react";

interface TicketDetailProps {
  ticket: Ticket;
}

export function TicketDetail({ ticket }: TicketDetailProps) {
  const { data: messages = [], sendMessage, isSending } = useTicketMessages(ticket.id);
  const [ratingSubmitted, setRatingSubmitted] = useState(Boolean(ticket.rating));
  const [userRating, setUserRating] = useState(ticket.rating?.score || 5);
  const [userFeedback, setUserFeedback] = useState(ticket.rating?.comment || "");

  const agent = getAgentById(ticket.assignedAgentId);

  const handleSendMessage = async (content: string, attachments?: Attachment[]) => {
    await sendMessage({
      senderType: "student",
      senderId: ticket.student.id,
      senderName: ticket.student.name,
      senderAvatar: ticket.student.avatar,
      content,
      attachments,
    });
  };

  const handleRate = (score: number) => {
    setUserRating(score);
    ticketStore.rateTicket(ticket.id, score, userFeedback);
    setRatingSubmitted(true);
  };

  const isResolved = ticket.status === "resolved" || ticket.status === "closed";

  return (
    <div className="space-y-4">
      {/* Back button + Ticket Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-slate-500">{ticket.id}</span>
              <CategoryTag categoryId={ticket.categoryId} size="sm" />
              <UrgencyDot urgency={ticket.urgency} showLabel />
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              {ticket.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={ticket.status} size="md" />
        </div>
      </div>

      {/* 2-PANE STUDENT LAYOUT: Conversation (left, wide) + Status Timeline (right, narrow) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT (Wide 2-cols): Original Description + Conversation */}
        <div className="lg:col-span-2 space-y-4">
          {/* Original Student Issue Summary */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Original Description</span>
              <span>Submitted {formatRelativeTime(ticket.createdAt)}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>

          {/* Rating Prompt if Resolved */}
          {isResolved && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Ticket Resolved! How did our tech do?</span>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <RatingStars
                  score={userRating}
                  interactive={!ratingSubmitted}
                  onRate={handleRate}
                  size="md"
                />
                <span className="text-xs text-emerald-800">
                  {ratingSubmitted ? "Thank you for your review!" : "Click stars to rate service"}
                </span>
              </div>
            </div>
          )}

          {/* Live Conversation Stream */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col min-h-[420px]">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>Direct Support Thread</span>
              <span className="text-[11px] text-slate-400">
                Live messages with AURATECH tech
              </span>
            </div>

            <div className="flex-1 overflow-y-auto">
              <MessageList messages={messages} />
            </div>

            {/* Student Message Composer */}
            <MessageComposer
              onSendMessage={handleSendMessage}
              isSending={isSending}
              placeholder="Reply to campus tech with additional info or question..."
            />
          </div>
        </div>

        {/* RIGHT (Narrow 1-col): Status Timeline & Metadata */}
        <div className="space-y-4">
          {/* Vertical Stepper: Submitted → Paid → Claimed → In Progress → Resolved */}
          <StatusTimeline ticket={ticket} />

          {/* Assigned Tech Info */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Assigned Specialist
            </h3>

            {agent ? (
              <div className="flex items-center gap-3">
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-sky-100"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{agent.name}</h4>
                  <p className="text-[11px] text-slate-500">{agent.role}</p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Next available technician will claim this ticket shortly.</span>
              </div>
            )}
          </div>

          {/* Payment Receipt */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Payment Verified
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Paystack Verified
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Amount Paid</span>
                <span className="font-bold text-slate-800">
                  {formatCurrency(ticket.amountPaid)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Billing Ref</span>
                <span className="font-mono text-slate-600">{ticket.paymentRef}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
