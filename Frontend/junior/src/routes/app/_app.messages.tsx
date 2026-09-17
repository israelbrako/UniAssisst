import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageTitle } from "@/components/layout/AppShell";
import { ChatWindow } from "@/components/messages/Chat";
import { RequestStatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState, ErrorState } from "@/components/shared/States";
import { messagesService, requestsService } from "@/services";
import { relativeTime } from "@/lib/format";
import type { Message, SupportRequest } from "@/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/_app/messages")({
  head: () => ({ meta: [{ title: "Messages — UniAssist" }] }),
  component: MessagesPage,
});

function MessagesPage() {
  const reduce = useReducedMotion();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<SupportRequest | null>(null);

  const { data: requests, isLoading: reqLoading, isError: reqError } = useQuery({
    queryKey: ["requests", "mine"],
    queryFn: () => requestsService.mine(),
  });

  useEffect(() => {
    if (!selected && requests && requests.length > 0) setSelected(requests[0]);
  }, [requests, selected]);

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", selected?.id],
    queryFn: () => messagesService.byRequest(selected!.id),
    enabled: !!selected,
  });

  const sendMutation = useMutation({
    mutationFn: (body: string) =>
      messagesService.send({
        requestId: selected!.id,
        authorId: "s1",
        authorName: "Alex Nyarko",
        body,
        kind: "student",
        read: false,
      }),
    onSuccess: (msg) => {
      qc.setQueryData<Message[]>(["messages", selected?.id], (prev = []) => [...prev, msg]);
    },
    onError: () => toast.error("Failed to send message"),
  });

  const rise = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  const activeRequests = requests?.filter((r) =>
    !["DRAFT", "CLOSED", "CANCELLED", "REJECTED"].includes(r.status),
  ) ?? [];

  return (
    <>
      <PageTitle title="Messages" description="Communicate with your support team." />

      {reqError ? (
        <ErrorState />
      ) : reqLoading ? (
        <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="panel h-16 animate-pulse bg-muted/50" />
            ))}
          </div>
          <div className="panel h-[560px] animate-pulse bg-muted/50" />
        </div>
      ) : activeRequests.length === 0 ? (
        <EmptyState
          title="No active conversations"
          description="Messages appear here once you have an active request assigned to a support member."
          icon={<MessageSquare className="size-5" aria-hidden />}
          action={
            <Link
              to="/app/requests/new"
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-[13.5px] font-semibold text-primary-foreground hover:bg-primary/90"
            >
              New request
            </Link>
          }
        />
      ) : (
        <motion.div {...rise()} className="grid gap-4 lg:grid-cols-[300px_1fr]">
          {/* Thread list */}
          <nav aria-label="Message threads" className="space-y-1.5">
            {activeRequests.map((req) => (
              <button
                key={req.id}
                type="button"
                onClick={() => setSelected(req)}
                className={cn(
                  "w-full rounded-xl border p-3.5 text-left transition-colors",
                  selected?.id === req.id
                    ? "border-emerald/40 bg-accent/60"
                    : "border-border bg-card hover:border-emerald/20 hover:bg-accent/30",
                )}
                aria-current={selected?.id === req.id ? "true" : undefined}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11.5px] font-bold text-emerald">{req.reference}</p>
                    <p className="mt-0.5 truncate text-[13.5px] font-semibold">{req.title}</p>
                  </div>
                  <RequestStatusBadge status={req.status} className="shrink-0 text-[10.5px]" />
                </div>
                <p className="mt-1.5 text-[12px] text-muted-foreground">
                  {req.assignee ? req.assignee.name : "Awaiting assignment"} · {relativeTime(req.updatedAt)}
                </p>
              </button>
            ))}
          </nav>

          {/* Chat window */}
          <div>
            {selected ? (
              <ChatWindow
                messages={messages}
                onSend={(body) => sendMutation.mutate(body)}
                header={
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11.5px] font-bold text-emerald">{selected.reference}</p>
                      <p className="truncate text-[14px] font-semibold">{selected.title}</p>
                    </div>
                    <Link
                      to="/app/requests/$id"
                      params={{ id: selected.id }}
                      className="shrink-0 text-[13px] font-semibold text-emerald hover:underline"
                    >
                      View request
                    </Link>
                  </div>
                }
              />
            ) : (
              <EmptyState
                title="Select a conversation"
                description="Choose a request from the left to view its messages."
              />
            )}
          </div>
        </motion.div>
      )}
    </>
  );
}
