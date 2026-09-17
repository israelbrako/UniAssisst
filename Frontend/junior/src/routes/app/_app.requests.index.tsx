import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { PageTitle } from "@/components/layout/AppShell";
import { RequestCard } from "@/components/requests/RequestCard";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/shared/States";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { requestsService } from "@/services";
import type { RequestStatus, Priority } from "@/types";

export const Route = createFileRoute("/app/_app/requests/")({
  head: () => ({ meta: [{ title: "My Requests — UniAssist" }] }),
  component: RequestsListPage,
});

const statusOptions: { value: RequestStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "QUOTED", label: "Quoted" },
  { value: "AWAITING_PAYMENT", label: "Awaiting payment" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "REVIEW", label: "Review" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const priorityOptions: { value: Priority | "ALL"; label: string }[] = [
  { value: "ALL", label: "All priorities" },
  { value: "URGENT", label: "Urgent" },
  { value: "HIGH", label: "High" },
  { value: "NORMAL", label: "Normal" },
  { value: "LOW", label: "Low" },
];

function RequestsListPage() {
  const reduce = useReducedMotion();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<RequestStatus | "ALL">("ALL");
  const [priority, setPriority] = useState<Priority | "ALL">("ALL");

  const { data: requests, isLoading, isError, refetch } = useQuery({
    queryKey: ["requests", "mine"],
    queryFn: () => requestsService.mine(),
  });

  const filtered = (requests ?? []).filter((r) => {
    const matchSearch =
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.reference.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === "ALL" || r.status === status;
    const matchPriority = priority === "ALL" || r.priority === priority;
    return matchSearch && matchStatus && matchPriority;
  });

  return (
    <>
      <PageTitle
        title="My Requests"
        description="Track and manage all your support requests."
        action={
          <Button asChild>
            <Link to="/app/requests/new">
              <Plus className="size-4" aria-hidden /> New request
            </Link>
          </Button>
        }
      />

      {/* Filters */}
      <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search by title or reference…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search requests"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as RequestStatus | "ALL")}>
          <SelectTrigger className="w-[180px]" aria-label="Filter by status">
            <SlidersHorizontal className="size-3.5 text-muted-foreground" aria-hidden />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={(v) => setPriority(v as Priority | "ALL")}>
          <SelectTrigger className="w-[160px]" aria-label="Filter by priority">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      {!isLoading && !isError && requests && (
        <p className="mb-4 text-[13.5px] text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "request" : "requests"}
          {status !== "ALL" || priority !== "ALL" || search ? " matching filters" : ""}
        </p>
      )}

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={search || status !== "ALL" || priority !== "ALL" ? "No matching requests" : "No requests yet"}
          description={
            search || status !== "ALL" || priority !== "ALL"
              ? "Try adjusting your filters."
              : "Start by telling us what you need help with."
          }
          action={
            !(search || status !== "ALL" || priority !== "ALL") ? (
              <Button asChild>
                <Link to="/app/requests/new">
                  <Plus className="size-4" aria-hidden /> New request
                </Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((r, i) => (
            <motion.div
              key={r.id}
              initial={reduce ? undefined : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.04 * i }}
            >
              <RequestCard request={r} />
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}
