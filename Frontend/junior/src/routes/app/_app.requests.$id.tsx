import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  MessageSquare,
  Paperclip,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageTitle } from "@/components/layout/AppShell";
import { RequestStatusBadge, PriorityBadge } from "@/components/shared/StatusBadge";
import { QuoteCard } from "@/components/requests/QuoteCard";
import { ChatWindow } from "@/components/messages/Chat";
import { ErrorState } from "@/components/shared/States";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatBytes, relativeTime } from "@/lib/format";
import { statusLabels } from "@/lib/status";
import { requestsService, messagesService } from "@/services";
import type { Message } from "@/types";

export const Route = createFileRoute("/app/_app/requests/$id")({
  head: () => ({ meta: [{ title: "Request — UniAssist" }] }),
  component: RequestDetailPage,
});

function RequestDetailPage() {
  const { id } = Route.useParams();
  const reduce = useReducedMotion();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  const {
    data: request,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["request", id],
    queryFn: () => requestsService.byId(id),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", id],
    queryFn: () => messagesService.byRequest(id),
    enabled: !!request,
  });

  const sendMutation = useMutation({
    mutationFn: (body: string) =>
      messagesService.send({
        requestId: id,
        authorId: "s1",
        authorName: "Alex Nyarko",
        body,
        kind: "student",
        read: false,
      }),
    onSuccess: (newMsg) => {
      qc.setQueryData<Message[]>(["messages", id], (prev = []) => [...prev, newMsg]);
    },
    onError: () => toast.error("Failed to send message"),
  });

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="panel h-24 animate-pulse bg-muted/50" />
        ))}
      </div>
    );
  }

  if (isError || !request) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  const rise = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <>
      {/* Back nav */}
      <Link
        to="/app/requests"
        className="mb-5 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden /> All requests
      </Link>

      {/* Header */}
      <motion.div {...rise()} className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[12.5px] font-bold tracking-wider text-emerald">{request.reference}</p>
          <h1 className="mt-1 text-[24px] font-extrabold leading-snug sm:text-[28px]">{request.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2.5">
            <RequestStatusBadge status={request.status} />
            <PriorityBadge priority={request.priority} />
            <span className="text-[13px] text-muted-foreground">
              Updated {relativeTime(request.updatedAt)}
            </span>
          </div>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="h-10">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="messages" className="gap-1.5">
            <MessageSquare className="size-3.5" aria-hidden />
            Messages
            {messages.length > 0 && (
              <span className="rounded-full bg-primary/15 px-1.5 text-[11px] font-bold text-primary">
                {messages.filter((m) => m.kind !== "system").length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* ── OVERVIEW ── */}
        <TabsContent value="overview" className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
            <div className="space-y-5">
              {/* Details card */}
              <motion.div {...rise(0.05)} className="panel p-5">
                <h2 className="mb-4 text-[15px] font-bold">Request details</h2>
                <dl className="space-y-3 text-[14px]">
                  {[
                    ["Category", request.category.replace(/-/g, " ")],
                    ["Description", request.description],
                    ...(request.course ? [["Course", request.course]] : []),
                    ...(request.department ? [["Department", request.department]] : []),
                    ...(request.technology ? [["Technology", request.technology]] : []),
                  ].map(([label, value]) => (
                    <div key={label} className="grid grid-cols-[120px_1fr] gap-3">
                      <dt className="font-semibold capitalize text-muted-foreground">{label}</dt>
                      <dd className="break-words leading-relaxed">{value}</dd>
                    </div>
                  ))}
                </dl>
              </motion.div>

              {/* Quote */}
              {request.quote && (
                <motion.div {...rise(0.08)}>
                  <QuoteCard
                    quote={request.quote}
                    onAccept={() => toast.success("Quote accepted")}
                    onDecline={() => toast.info("Quote declined")}
                    onPay={() => toast.info("Redirecting to payment…")}
                  />
                </motion.div>
              )}

              {/* Deliverables */}
              {request.deliverables.length > 0 && (
                <motion.div {...rise(0.1)} className="panel p-5">
                  <h2 className="mb-4 text-[15px] font-bold">Deliverables</h2>
                  <ul className="space-y-2.5" aria-label="Deliverables">
                    {request.deliverables.map((d) => (
                      <li key={d.id} className="flex items-center gap-3 rounded-lg border border-border bg-secondary/40 p-3">
                        <FileText className="size-4 shrink-0 text-emerald" aria-hidden />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13.5px] font-medium">{d.name}</p>
                          <p className="text-[12px] text-muted-foreground">{formatBytes(d.size)}</p>
                        </div>
                        <Button variant="ghost" size="sm" aria-label={`Download ${d.name}`}>
                          <Download className="size-4" aria-hidden />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-4">
              <motion.div {...rise(0.07)} className="panel p-5 space-y-4">
                <h2 className="text-[14px] font-bold">Request info</h2>
                <dl className="space-y-3 text-[13.5px]">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <dt className="text-muted-foreground">Due</dt>
                    <dd className="ml-auto font-semibold">{formatDate(request.deadline)}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="text-muted-foreground">Submitted</dt>
                    <dd className="ml-auto">{formatDate(request.createdAt)}</dd>
                  </div>
                  {request.assignee && (
                    <div className="border-t border-border pt-3">
                      <p className="text-[12.5px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Assigned to</p>
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-[12px] font-bold text-accent-foreground">
                          {request.assignee.initials}
                        </span>
                        <div>
                          <p className="text-[13.5px] font-semibold">{request.assignee.name}</p>
                          <p className="text-[12px] text-muted-foreground">{request.assignee.role}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </dl>
              </motion.div>

              {/* Payment status */}
              <motion.div {...rise(0.1)} className="panel p-4">
                <p className="text-[12.5px] font-semibold uppercase tracking-wider text-muted-foreground">Payment</p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`size-2 rounded-full ${
                      request.paymentStatus === "PAID"
                        ? "bg-status-done"
                        : request.paymentStatus === "AWAITING"
                        ? "bg-status-payment"
                        : "bg-status-draft"
                    }`}
                    aria-hidden
                  />
                  <p className="text-[14px] font-semibold capitalize">
                    {request.paymentStatus === "PAID"
                      ? "Paid"
                      : request.paymentStatus === "AWAITING"
                      ? "Awaiting payment"
                      : request.paymentStatus === "REFUNDED"
                      ? "Refunded"
                      : "Unpaid"}
                  </p>
                </div>
                {request.paymentStatus === "AWAITING" && (
                  <Button asChild size="sm" className="mt-3 w-full">
                    <Link to="/app/payments">Pay now</Link>
                  </Button>
                )}
              </motion.div>

              {/* Progress */}
              <motion.div {...rise(0.12)} className="panel p-4">
                <div className="flex items-center justify-between text-[13.5px]">
                  <span className="font-semibold">Progress</span>
                  <span className="font-bold tabular-nums text-emerald">{request.progress}%</span>
                </div>
                <div className="mt-2 overflow-hidden rounded-full bg-muted h-2">
                  <div
                    className="h-2 rounded-full bg-emerald transition-all duration-700"
                    style={{ width: `${request.progress}%` }}
                    role="progressbar"
                    aria-valuenow={request.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </motion.div>
            </aside>
          </div>
        </TabsContent>

        {/* ── MESSAGES ── */}
        <TabsContent value="messages">
          <ChatWindow
            messages={messages}
            onSend={(body) => sendMutation.mutate(body)}
            header={
              <div className="flex items-center justify-between">
                <p className="text-[14px] font-semibold">Request thread</p>
                {sendMutation.isPending && (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="Sending…" />
                )}
              </div>
            }
          />
        </TabsContent>

        {/* ── FILES ── */}
        <TabsContent value="files">
          <div className="panel p-5">
            <h2 className="mb-4 text-[15px] font-bold">Attached files</h2>
            {request.files.length === 0 ? (
              <p className="py-6 text-center text-[14px] text-muted-foreground">No files attached to this request.</p>
            ) : (
              <ul className="space-y-2.5" aria-label="Request files">
                {request.files.map((f) => (
                  <li key={f.id} className="flex items-center gap-3 rounded-lg border border-border bg-secondary/40 p-3.5">
                    <Paperclip className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium">{f.name}</p>
                      <p className="text-[12px] text-muted-foreground">{formatBytes(f.size)} · {f.type}</p>
                    </div>
                    <Button variant="outline" size="sm" aria-label={`Download ${f.name}`}>
                      <Download className="size-4 mr-1" aria-hidden /> Download
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>

        {/* ── HISTORY ── */}
        <TabsContent value="history">
          <div className="panel p-5">
            <h2 className="mb-5 text-[15px] font-bold">Status history</h2>
            <ol className="relative border-l border-border ml-3" aria-label="Request timeline">
              {[...request.history].reverse().map((event, i) => (
                <li key={i} className="mb-5 ml-5 last:mb-0">
                  <span className="absolute -left-1.5 flex size-3 items-center justify-center rounded-full border border-border bg-card">
                    <span className="size-1.5 rounded-full bg-emerald" aria-hidden />
                  </span>
                  <time className="mb-1 text-[12px] font-medium text-muted-foreground" dateTime={event.at}>
                    {formatDate(event.at, true)}
                  </time>
                  <p className="text-[14px] font-semibold">{statusLabels[event.status]}</p>
                  {event.note && <p className="mt-0.5 text-[13px] text-muted-foreground">{event.note}</p>}
                </li>
              ))}
            </ol>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
