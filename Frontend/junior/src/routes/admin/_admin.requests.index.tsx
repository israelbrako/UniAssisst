import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  UserPlus,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { PageTitle } from "@/components/layout/AppShell";
import { RequestStatusBadge, PriorityBadge } from "@/components/shared/StatusBadge";
import { EmptyState, ErrorState } from "@/components/shared/States";
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
import { formatDate, relativeTime } from "@/lib/format";
import type { RequestStatus, Priority } from "@/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/_admin/requests/")({
  head: () => ({ meta: [{ title: "Requests — Admin · UniAssist" }] }),
  component: AdminRequestsPage,
});

const PAGE_SIZE = 10;

type SortKey = "createdAt" | "deadline" | "priority" | "status" | "reference";
type SortDir = "asc" | "desc";

const priorityOrder: Record<Priority, number> = { URGENT: 4, HIGH: 3, NORMAL: 2, LOW: 1 };

const statusOptions: { value: RequestStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "QUOTED", label: "Quoted" },
  { value: "AWAITING_PAYMENT", label: "Awaiting payment" },
  { value: "PAID", label: "Paid" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "REVIEW", label: "Review" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REJECTED", label: "Rejected" },
];

const priorityOptions: { value: Priority | "ALL"; label: string }[] = [
  { value: "ALL", label: "All priorities" },
  { value: "URGENT", label: "Urgent" },
  { value: "HIGH", label: "High" },
  { value: "NORMAL", label: "Normal" },
  { value: "LOW", label: "Low" },
];

function AdminRequestsPage() {
  const reduce = useReducedMotion();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<RequestStatus | "ALL">("ALL");
  const [priority, setPriority] = useState<Priority | "ALL">("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const { data: requests, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "requests"],
    queryFn: () => requestsService.list(),
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
    setPage(1);
  }

  const filtered = useMemo(() => {
    if (!requests) return [];
    return requests
      .filter((r) => {
        const q = search.toLowerCase();
        const matchSearch =
          !q ||
          r.title.toLowerCase().includes(q) ||
          r.reference.toLowerCase().includes(q) ||
          r.studentName.toLowerCase().includes(q);
        const matchStatus = status === "ALL" || r.status === status;
        const matchPriority = priority === "ALL" || r.priority === priority;
        return matchSearch && matchStatus && matchPriority;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortKey === "createdAt") cmp = a.createdAt.localeCompare(b.createdAt);
        else if (sortKey === "deadline") cmp = a.deadline.localeCompare(b.deadline);
        else if (sortKey === "priority") cmp = priorityOrder[a.priority] - priorityOrder[b.priority];
        else if (sortKey === "reference") cmp = a.reference.localeCompare(b.reference);
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [requests, search, status, priority, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const SortBtn = ({ label, col }: { label: string; col: SortKey }) => (
    <button
      type="button"
      onClick={() => toggleSort(col)}
      className="flex items-center gap-1 hover:text-foreground transition-colors"
      aria-label={`Sort by ${label}`}
    >
      {label}
      <ArrowUpDown className={cn("size-3", sortKey === col ? "text-emerald" : "opacity-40")} aria-hidden />
    </button>
  );

  return (
    <>
      <PageTitle
        title="All Requests"
        description="Search, filter and manage every support request."
      />

      {/* Filters */}
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            placeholder="Search reference, title or student…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
            aria-label="Search requests"
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v as RequestStatus | "ALL"); setPage(1); }}>
          <SelectTrigger className="w-[180px]" aria-label="Filter by status">
            <SlidersHorizontal className="size-3.5 text-muted-foreground" aria-hidden />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={(v) => { setPriority(v as Priority | "ALL"); setPage(1); }}>
          <SelectTrigger className="w-[155px]" aria-label="Filter by priority">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Count */}
      {!isLoading && !isError && (
        <p className="mb-3 text-[13.5px] text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "request" : "requests"}
        </p>
      )}

      {isLoading ? (
        <div className="space-y-2" aria-busy="true">
          {[...Array(6)].map((_, i) => <div key={i} className="panel h-12 animate-pulse bg-muted/50" />)}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No requests found" description="Try adjusting your filters." />
      ) : (
        <>
          <motion.div
            initial={reduce ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="panel overflow-hidden p-0"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-[13.5px]" aria-label="Requests table">
                <thead>
                  <tr className="border-b border-border bg-secondary/60 text-left text-muted-foreground">
                    <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">
                      <SortBtn label="Reference" col="reference" />
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">Student</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Request</th>
                    <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">Category</th>
                    <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">
                      <SortBtn label="Priority" col="priority" />
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">Assigned to</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                    <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">
                      <SortBtn label="Deadline" col="deadline" />
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">
                      <SortBtn label="Created" col="createdAt" />
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((r, i) => (
                    <motion.tr
                      key={r.id}
                      initial={reduce ? undefined : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.03 * i }}
                      className="border-b border-border last:border-0 hover:bg-secondary/30"
                    >
                      <td className="px-4 py-3 font-mono text-[12px] font-bold text-emerald whitespace-nowrap">
                        {r.reference}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div>
                          <p className="font-medium">{r.studentName}</p>
                          <p className="text-[11.5px] text-muted-foreground">{r.studentId}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-[180px]">
                        <p className="truncate font-medium">{r.title}</p>
                      </td>
                      <td className="px-4 py-3 capitalize whitespace-nowrap text-muted-foreground">
                        {r.category.replace(/-/g, " ")}
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={r.priority} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.assignee ? (
                          <div className="flex items-center gap-1.5">
                            <span className="grid size-6 place-items-center rounded-full bg-accent text-[10.5px] font-bold text-accent-foreground">
                              {r.assignee.initials}
                            </span>
                            <span>{r.assignee.name}</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toast.info(`Assign dialog for ${r.reference} — coming in admin detail view`)}
                            className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-status-review hover:underline"
                          >
                            <UserPlus className="size-3.5" aria-hidden /> Assign
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <RequestStatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {formatDate(r.deadline)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {relativeTime(r.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Button asChild variant="outline" size="sm">
                          <Link to="/admin/requests/$id" params={{ id: r.id }}>
                            Open
                          </Link>
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-[13.5px]">
              <p className="text-muted-foreground">
                Page {page} of {totalPages} · {filtered.length} requests
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="size-4" aria-hidden />
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(p)}
                    aria-label={`Page ${p}`}
                    aria-current={p === page ? "page" : undefined}
                    className="min-w-[32px]"
                  >
                    {p}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight className="size-4" aria-hidden />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
