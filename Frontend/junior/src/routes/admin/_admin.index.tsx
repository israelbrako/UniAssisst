import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  CreditCard,
  FileStack,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { PageTitle } from "@/components/layout/AppShell";
import { StatCard } from "@/components/shared/StatCard";
import { StatsSkeleton, ErrorState } from "@/components/shared/States";
import { RequestStatusBadge, PriorityBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { adminService, requestsService } from "@/services";
import { formatDate, currency, relativeTime } from "@/lib/format";

export const Route = createFileRoute("/admin/_admin/")({
  head: () => ({ meta: [{ title: "Admin Overview — UniAssist" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const reduce = useReducedMotion();

  const { data: metrics, isLoading: metricsLoading, isError: metricsError } = useQuery({
    queryKey: ["admin", "metrics"],
    queryFn: () => adminService.metrics(),
  });

  const { data: requests, isLoading: reqLoading } = useQuery({
    queryKey: ["admin", "requests"],
    queryFn: () => requestsService.list(),
  });

  const rise = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  const recent = (requests ?? []).slice(0, 6);

  return (
    <>
      <PageTitle title="Operations Overview" description="Platform-wide activity and team workload." />

      {/* Metrics */}
      {metricsLoading ? (
        <StatsSkeleton count={6} />
      ) : metricsError || !metrics ? (
        <ErrorState />
      ) : (
        <motion.div
          {...rise()}
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          <StatCard label="Total requests" value={metrics.totalRequests} icon={FileStack} hint="All time" />
          <StatCard label="Active requests" value={metrics.activeRequests} icon={Zap} hint="Currently in progress" />
          <StatCard label="Completed" value={metrics.completedRequests} icon={CheckCircle2} hint="All time" />
          <StatCard label="Pending payments" value={metrics.pendingPayments} icon={Clock} hint="Awaiting payment" />
          <StatCard label="Revenue" value={currency(metrics.revenue)} icon={TrendingUp} hint="All time" />
          <StatCard label="Team workload" value={`${metrics.workload}%`} icon={BarChart3} hint="Average utilisation" />
        </motion.div>
      )}

      {/* Recent requests table */}
      <motion.section {...rise(0.1)} className="mt-10" aria-labelledby="recent-requests-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="recent-requests-heading" className="text-[18px] font-bold">Recent requests</h2>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to="/admin/requests">
              View all <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </Button>
        </div>

        {reqLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="panel h-14 animate-pulse bg-muted/50" />
            ))}
          </div>
        ) : (
          <div className="panel overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-[13.5px]" aria-label="Recent requests">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-left">
                    {["Reference", "Student", "Request", "Category", "Priority", "Assigned to", "Status", "Deadline", ""].map((h) => (
                      <th key={h} scope="col" className="px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r, i) => (
                    <motion.tr
                      key={r.id}
                      {...(reduce ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.04 * i } })}
                      className="border-b border-border last:border-0 hover:bg-secondary/30"
                    >
                      <td className="px-4 py-3 font-mono text-[12px] font-bold text-emerald whitespace-nowrap">
                        {r.reference}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-medium">{r.studentName}</span>
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="truncate font-medium">{r.title}</p>
                      </td>
                      <td className="px-4 py-3 capitalize whitespace-nowrap text-muted-foreground">
                        {r.category.replace(/-/g, " ")}
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={r.priority} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {r.assignee?.name ?? <span className="text-status-review">Unassigned</span>}
                      </td>
                      <td className="px-4 py-3">
                        <RequestStatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {formatDate(r.deadline)}
                      </td>
                      <td className="px-4 py-3">
                        <Button asChild variant="ghost" size="sm">
                          <Link to="/admin/requests/$id" params={{ id: r.id }}>
                            View
                          </Link>
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.section>

      {/* Quick links */}
      <motion.div {...rise(0.16)} className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { to: "/admin/team", label: "Team management", icon: Users, hint: "Manage availability & workload" },
          { to: "/admin/payments", label: "Payments", icon: CreditCard, hint: "Pending and completed payments" },
          { to: "/admin/students", label: "Students", icon: Users, hint: "Registered student accounts" },
          { to: "/admin/analytics", label: "Analytics", icon: BarChart3, hint: "Platform performance data" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="panel group flex items-start gap-3.5 p-4 transition-colors hover:border-emerald/35"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-teal">
                <Icon className="size-4.5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold">{item.label}</p>
                <p className="mt-0.5 text-[12.5px] text-muted-foreground">{item.hint}</p>
              </div>
              <ArrowRight className="size-4 shrink-0 self-center text-muted-foreground transition-transform group-hover:translate-x-0.5 ml-auto" aria-hidden />
            </Link>
          );
        })}
      </motion.div>
    </>
  );
}
