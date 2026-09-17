import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Ban,
  CalendarClock,
  Check,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  MessageSquare,
  Paperclip,
  PenLine,
  StickyNote,
  UserCheck,
  X,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { PageTitle } from "@/components/layout/AppShell";
import { RequestStatusBadge, PriorityBadge } from "@/components/shared/StatusBadge";
import { QuoteCard } from "@/components/requests/QuoteCard";
import { ChatWindow } from "@/components/messages/Chat";
import { ErrorState } from "@/components/shared/States";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDate, formatBytes, relativeTime, currency } from "@/lib/format";
import { statusLabels } from "@/lib/status";
import { requestsService, messagesService, adminService } from "@/services";
import type { Message, RequestStatus } from "@/types";

export const Route = createFileRoute("/admin/_admin/requests/$id")({
  head: () => ({ meta: [{ title: "Request — Admin · UniAssist" }] }),
  component: AdminRequestDetailPage,
});

const quoteSchema = z.object({
  summary: z.string().min(3, "Required"),
  deliveryEstimate: z.string().min(1, "Required"),
  serviceAmount: z.coerce.number().min(1, "Enter amount"),
  discount: z.coerce.number().min(0).default(0),
  currency: z.string().default("GH₵"),
});
type QuoteFormValues = z.infer<typeof quoteSchema>;

const changeableStatuses: RequestStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "QUOTED",
  "AWAITING_PAYMENT",
  "PAID",
  "ASSIGNED",
  "IN_PROGRESS",
  "REVIEW",
  "COMPLETED",
  "CLOSED",
  "CANCELLED",
  "REJECTED",
];

function AdminRequestDetailPage() {
  const { id } = Route.useParams();
  const reduce = useReducedMotion();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] = useState("");
  const [newStatus, setNewStatus] = useState<RequestStatus>("IN_PROGRESS");
  const [internalNote, setInternalNote] = useState("");

  const { data: request, isLoading, isError, refetch } = useQuery({
    queryKey: ["request", id],
    queryFn: () => requestsService.byId(id),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", id, "admin"],
    queryFn: () => messagesService.byRequest(id, true), // include internal
    enabled: !!request,
  });

  const { data: team = [] } = useQuery({
    queryKey: ["admin", "team"],
    queryFn: () => adminService.team(),
  });

  const sendMutation = useMutation({
    mutationFn: (body: string) =>
      messagesService.send({
        requestId: id,
        authorId: "admin",
        authorName: "Support Team",
        body,
        kind: "support",
        read: true,
      }),
    onSuccess: (msg) => {
      qc.setQueryData<Message[]>(["messages", id, "admin"], (prev = []) => [...prev, msg]);
    },
    onError: () => toast.error("Failed to send message"),
  });

  const sendNoteMutation = useMutation({
    mutationFn: (body: string) =>
      messagesService.send({
        requestId: id,
        authorId: "admin",
        authorName: "Ops Manager",
        body,
        kind: "internal",
        read: true,
      }),
    onSuccess: (msg) => {
      qc.setQueryData<Message[]>(["messages", id, "admin"], (prev = []) => [...prev, msg]);
      setInternalNote("");
      toast.success("Internal note added");
    },
  });

  const quoteForm = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      summary: request?.title ?? "",
      deliveryEstimate: "3–5 days",
      serviceAmount: 0,
      discount: 0,
      currency: "GH₵",
    },
  });

  async function handleAssign() {
    if (!selectedTeamMember) { toast.error("Select a team member"); return; }
    await new Promise((r) => setTimeout(r, 400));
    toast.success("Request assigned successfully");
    setShowAssignDialog(false);
  }

  async function handleStatusChange() {
    await new Promise((r) => setTimeout(r, 400));
    toast.success(`Status changed to ${statusLabels[newStatus]}`);
    setShowStatusDialog(false);
  }

  async function handleQuoteSubmit(values: QuoteFormValues) {
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Quote issued to student");
    setShowQuoteDialog(false);
  }

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true">
        {[...Array(3)].map((_, i) => <div key={i} className="panel h-24 animate-pulse bg-muted/50" />)}
      </div>
    );
  }
  if (isError || !request) return <ErrorState onRetry={() => refetch()} />;

  const rise = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  const studentMessages = messages.filter((m) => m.kind !== "internal");
  const internalMessages = messages.filter((m) => m.kind === "internal");

  return (
    <>
      <Link
        to="/admin/requests"
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
              Student: <span className="font-semibold text-foreground">{request.studentName}</span>
            </span>
            <span className="text-[13px] text-muted-foreground">Updated {relativeTime(request.updatedAt)}</span>
          </div>
        </div>

        {/* Admin action bar */}
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowStatusDialog(true)}>
            <PenLine className="size-3.5" aria-hidden /> Change status
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowAssignDialog(true)}>
            <UserCheck className="size-3.5" aria-hidden /> Assign
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => setShowQuoteDialog(true)}>
            <FileText className="size-3.5" aria-hidden /> Create quote
          </Button>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="h-10 flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="messages" className="gap-1.5">
            <MessageSquare className="size-3.5" aria-hidden /> Messages
            {studentMessages.length > 0 && (
              <span className="rounded-full bg-primary/15 px-1.5 text-[11px] font-bold text-primary">
                {studentMessages.filter((m) => m.kind !== "system").length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="internal" className="gap-1.5">
            <StickyNote className="size-3.5" aria-hidden /> Internal notes
            {internalMessages.length > 0 && (
              <span className="rounded-full bg-status-review/15 px-1.5 text-[11px] font-bold text-status-review">
                {internalMessages.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* ── OVERVIEW ── */}
        <TabsContent value="overview" className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              {/* Details */}
              <motion.div {...rise(0.04)} className="panel p-5">
                <h2 className="mb-4 text-[15px] font-bold">Request details</h2>
                <dl className="space-y-3 text-[14px]">
                  {[
                    ["Student", `${request.studentName} (${request.studentId})`],
                    ["Category", request.category.replace(/-/g, " ")],
                    ["Description", request.description],
                    ...(request.course ? [["Course", request.course]] : []),
                    ...(request.department ? [["Department", request.department]] : []),
                    ...(request.technology ? [["Technology", request.technology]] : []),
                  ].map(([label, value]) => (
                    <div key={label} className="grid grid-cols-[130px_1fr] gap-3">
                      <dt className="font-semibold capitalize text-muted-foreground">{label}</dt>
                      <dd className="break-words leading-relaxed">{value}</dd>
                    </div>
                  ))}
                </dl>
              </motion.div>

              {/* Quote */}
              {request.quote && (
                <motion.div {...rise(0.07)}>
                  <QuoteCard
                    quote={request.quote}
                    onAccept={() => toast.info("Admin view — student accepts quote")}
                    onDecline={() => toast.info("Admin view — student declines quote")}
                    onPay={() => toast.info("Admin view — payment flow")}
                  />
                </motion.div>
              )}

              {/* Deliverables */}
              <motion.div {...rise(0.09)} className="panel p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-[15px] font-bold">Deliverables</h2>
                  <Button variant="outline" size="sm" onClick={() => toast.info("Upload deliverable — coming soon")}>
                    Upload
                  </Button>
                </div>
                {request.deliverables.length === 0 ? (
                  <p className="py-4 text-center text-[14px] text-muted-foreground">No deliverables uploaded yet.</p>
                ) : (
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
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-4">
              <motion.div {...rise(0.06)} className="panel p-5 space-y-3">
                <h2 className="text-[14px] font-bold">Request info</h2>
                <dl className="space-y-2.5 text-[13.5px]">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Submitted</dt>
                    <dd className="font-medium">{formatDate(request.createdAt)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="flex items-center gap-1 text-muted-foreground"><CalendarClock className="size-3.5" aria-hidden /> Due</dt>
                    <dd className="font-semibold">{formatDate(request.deadline)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Payment</dt>
                    <dd className={request.paymentStatus === "PAID" ? "font-semibold text-status-done" : "font-semibold text-status-payment"}>
                      {request.paymentStatus === "PAID" ? "Paid" : request.paymentStatus === "AWAITING" ? "Awaiting" : "Unpaid"}
                    </dd>
                  </div>
                  {request.quote && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Value</dt>
                      <dd className="font-semibold tabular-nums">{currency(request.quote.total, request.quote.currency)}</dd>
                    </div>
                  )}
                </dl>

                {/* Assignee */}
                <div className="border-t border-border pt-3">
                  <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Assigned to</p>
                  {request.assignee ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="grid size-8 place-items-center rounded-full bg-accent text-[12px] font-bold text-accent-foreground">
                          {request.assignee.initials}
                        </span>
                        <div>
                          <p className="text-[13px] font-semibold">{request.assignee.name}</p>
                          <p className="text-[11.5px] text-muted-foreground">{request.assignee.role}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setShowAssignDialog(true)} aria-label="Reassign">
                        <PenLine className="size-3.5" aria-hidden />
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" className="w-full gap-1.5" onClick={() => setShowAssignDialog(true)}>
                      <UserCheck className="size-3.5" aria-hidden /> Assign team member
                    </Button>
                  )}
                </div>
              </motion.div>

              {/* Progress */}
              <motion.div {...rise(0.09)} className="panel p-4">
                <div className="flex items-center justify-between text-[13.5px]">
                  <span className="font-semibold">Progress</span>
                  <span className="font-bold tabular-nums text-emerald">{request.progress}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
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

              {/* Quick actions */}
              <motion.div {...rise(0.11)} className="panel p-4 space-y-2">
                <p className="text-[12.5px] font-semibold uppercase tracking-wider text-muted-foreground">Quick actions</p>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => { setNewStatus("COMPLETED"); setShowStatusDialog(true); }}>
                  <CheckCircle2 className="size-3.5 text-status-done" aria-hidden /> Mark completed
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => { setNewStatus("REJECTED"); setShowStatusDialog(true); }}>
                  <X className="size-3.5 text-status-danger" aria-hidden /> Reject request
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => { setNewStatus("CANCELLED"); setShowStatusDialog(true); }}>
                  <Ban className="size-3.5 text-muted-foreground" aria-hidden /> Cancel request
                </Button>
              </motion.div>
            </aside>
          </div>
        </TabsContent>

        {/* ── MESSAGES (student-facing) ── */}
        <TabsContent value="messages">
          <ChatWindow
            messages={studentMessages}
            onSend={(body) => sendMutation.mutate(body)}
            header={
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-semibold">Student conversation</p>
                  <p className="text-[12.5px] text-muted-foreground">Visible to student and support team</p>
                </div>
                {sendMutation.isPending && <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="Sending…" />}
              </div>
            }
          />
        </TabsContent>

        {/* ── INTERNAL NOTES ── */}
        <TabsContent value="internal" className="space-y-4">
          <div className="rounded-xl border border-dashed border-status-review/40 bg-status-review/5 p-3">
            <p className="text-[12.5px] font-semibold text-status-review">
              Internal notes are visible to the support team only. Students cannot see these.
            </p>
          </div>

          <div className="panel p-4">
            <p className="mb-2 text-[14px] font-semibold">Add internal note</p>
            <Textarea
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Add a note for the team…"
              className="min-h-[90px] resize-y"
              aria-label="Internal note"
            />
            <Button
              size="sm"
              className="mt-2 gap-1.5"
              disabled={!internalNote.trim() || sendNoteMutation.isPending}
              onClick={() => sendNoteMutation.mutate(internalNote)}
            >
              {sendNoteMutation.isPending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <StickyNote className="size-3.5" aria-hidden />}
              Add note
            </Button>
          </div>

          {internalMessages.length === 0 ? (
            <p className="py-8 text-center text-[14px] text-muted-foreground">No internal notes yet.</p>
          ) : (
            <div className="space-y-3">
              {internalMessages.map((m) => (
                <div key={m.id} className="rounded-xl border border-dashed border-status-review/40 bg-status-review/6 p-4">
                  <p className="text-[11.5px] font-bold uppercase tracking-wide text-status-review">Internal note</p>
                  <p className="mt-1.5 text-[14px] leading-relaxed">{m.body}</p>
                  <p className="mt-2 text-[12px] text-muted-foreground">
                    {m.authorName} · {relativeTime(m.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── FILES ── */}
        <TabsContent value="files">
          <div className="panel p-5">
            <h2 className="mb-4 text-[15px] font-bold">Submitted files</h2>
            {request.files.length === 0 ? (
              <p className="py-6 text-center text-[14px] text-muted-foreground">No files submitted.</p>
            ) : (
              <ul className="space-y-2.5" aria-label="Submitted files">
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
            <ol className="relative ml-3 border-l border-border" aria-label="Request history">
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

      {/* ── Assign dialog ── */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign team member</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {team.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => setSelectedTeamMember(member.id)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                  selectedTeamMember === member.id
                    ? "border-emerald/50 bg-accent/60"
                    : "border-border hover:border-emerald/30"
                }`}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-[12px] font-bold text-accent-foreground">
                  {member.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{member.name}</p>
                  <p className="text-[13px] text-muted-foreground">{member.role} · {member.specialization}</p>
                </div>
                <span className={`text-[11.5px] font-semibold px-2 py-1 rounded-full ${
                  member.availability === "AVAILABLE"
                    ? "bg-status-done/10 text-status-done"
                    : member.availability === "BUSY"
                    ? "bg-status-review/10 text-status-review"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {member.availability}
                </span>
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={!selectedTeamMember}>
              <Check className="size-4" aria-hidden /> Confirm assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Status change dialog ── */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change request status</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-[14px] text-muted-foreground">
              Current status: <RequestStatusBadge status={request.status} />
            </p>
            <Select value={newStatus} onValueChange={(v) => setNewStatus(v as RequestStatus)}>
              <SelectTrigger aria-label="New status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {changeableStatuses.map((s) => (
                  <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>Cancel</Button>
            <Button onClick={handleStatusChange}>
              <Check className="size-4" aria-hidden /> Update status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create quote dialog ── */}
      <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create service quote</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={quoteForm.handleSubmit(handleQuoteSubmit)}
            className="space-y-4 py-2"
          >
            <div>
              <label className="text-[13.5px] font-medium" htmlFor="q-summary">Quote summary</label>
              <input
                id="q-summary"
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-ring"
                {...quoteForm.register("summary")}
                placeholder="e.g. Website Development Support"
              />
            </div>
            <div>
              <label className="text-[13.5px] font-medium" htmlFor="q-delivery">Estimated delivery</label>
              <input
                id="q-delivery"
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-ring"
                {...quoteForm.register("deliveryEstimate")}
                placeholder="e.g. 3–5 days"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[13.5px] font-medium" htmlFor="q-amount">Service amount (GH₵)</label>
                <input
                  id="q-amount"
                  type="number"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-ring"
                  {...quoteForm.register("serviceAmount")}
                  min={0}
                />
              </div>
              <div>
                <label className="text-[13.5px] font-medium" htmlFor="q-discount">Discount (GH₵)</label>
                <input
                  id="q-discount"
                  type="number"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-ring"
                  {...quoteForm.register("discount")}
                  min={0}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowQuoteDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={quoteForm.formState.isSubmitting}>
                {quoteForm.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <FileText className="size-4" aria-hidden />}
                Issue quote
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
