import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { Plus, Star, UserCheck, UserMinus, UserX } from "lucide-react";
import { toast } from "sonner";
import { PageTitle } from "@/components/layout/AppShell";
import { StatCard } from "@/components/shared/StatCard";
import { EmptyState, ErrorState } from "@/components/shared/States";
import { Button } from "@/components/ui/button";
import { adminService } from "@/services";
import type { TeamMember } from "@/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/_admin/team")({
  head: () => ({ meta: [{ title: "Team — Admin · UniAssist" }] }),
  component: AdminTeamPage,
});

const availabilityConfig: Record<TeamMember["availability"], { label: string; dot: string; text: string }> = {
  AVAILABLE: { label: "Available", dot: "bg-status-done", text: "text-status-done" },
  BUSY: { label: "Busy", dot: "bg-status-review", text: "text-status-review" },
  OFFLINE: { label: "Offline", dot: "bg-status-draft", text: "text-muted-foreground" },
};

function AdminTeamPage() {
  const reduce = useReducedMotion();
  const { data: team, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "team"],
    queryFn: () => adminService.team(),
  });

  const rise = (delay = 0) =>
    reduce ? {} : {
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] as const },
    };

  const available = (team ?? []).filter((m) => m.availability === "AVAILABLE").length;
  const busy = (team ?? []).filter((m) => m.availability === "BUSY").length;
  const totalCompleted = (team ?? []).reduce((a, m) => a + m.completedRequests, 0);

  return (
    <>
      <PageTitle
        title="Team"
        description="Manage support team members, availability and workload."
        action={
          <Button className="gap-1.5" onClick={() => toast.info("Add team member — coming soon")}>
            <Plus className="size-4" aria-hidden /> Add member
          </Button>
        }
      />

      {!isLoading && !isError && team && (
        <motion.div {...rise()} className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard label="Available" value={available} icon={UserCheck} hint="Ready to take requests" />
          <StatCard label="Busy" value={busy} icon={UserMinus} hint="At capacity" />
          <StatCard label="Total completed" value={totalCompleted} hint="Across all team members" />
        </motion.div>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true">
          {[...Array(4)].map((_, i) => <div key={i} className="panel h-52 animate-pulse bg-muted/50" />)}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !team?.length ? (
        <EmptyState title="No team members" description="Add your first team member to get started." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member, i) => {
            const av = availabilityConfig[member.availability];
            return (
              <motion.article
                key={member.id}
                {...rise(0.07 * i)}
                className="panel flex flex-col p-5"
              >
                {/* Avatar & availability */}
                <div className="flex items-start justify-between gap-2">
                  <span className="grid size-12 place-items-center rounded-full bg-ink text-[16px] font-extrabold text-mint">
                    {member.initials}
                  </span>
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11.5px] font-semibold", `border-current/20 bg-current/8 ${av.text}`)}>
                    <span className={cn("size-1.5 rounded-full", av.dot)} aria-hidden />
                    {av.label}
                  </span>
                </div>

                {/* Info */}
                <h3 className="mt-3 text-[15.5px] font-bold">{member.name}</h3>
                <p className="text-[13.5px] text-muted-foreground">{member.role}</p>
                <p className="mt-0.5 text-[12.5px] text-teal">{member.specialization}</p>

                {/* Stats */}
                <dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-secondary/60 p-3 text-center">
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Active</dt>
                    <dd className="mt-0.5 text-[18px] font-extrabold tabular-nums">{member.activeRequests}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Done</dt>
                    <dd className="mt-0.5 text-[18px] font-extrabold tabular-nums">{member.completedRequests}</dd>
                  </div>
                </dl>

                {/* Rating */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[13px]">
                    <Star className="size-3.5 fill-status-review text-status-review" aria-hidden />
                    <span className="font-semibold tabular-nums">{member.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">/ 5</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[12.5px] text-muted-foreground"
                    onClick={() => toast.info(`Edit ${member.name} — coming soon`)}
                  >
                    Edit
                  </Button>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </>
  );
}
