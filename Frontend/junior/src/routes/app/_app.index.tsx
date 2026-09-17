import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  FileStack,
  Plus,
  Sparkles,
} from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { StatsSkeleton, ListSkeleton, EmptyState, ErrorState } from "@/components/shared/States";
import { RequestCard } from "@/components/requests/RequestCard";
import { Button } from "@/components/ui/button";
import { requestsService } from "@/services";
import { student } from "@/services/mock-data";

export const Route = createFileRoute("/app/_app/")({
  head: () => ({ meta: [{ title: "Dashboard — UniAssist" }] }),
  component: StudentDashboard,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function StudentDashboard() {
  const reduce = useReducedMotion();
  const rise = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  const {
    data: requests,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["requests", "mine"],
    queryFn: () => requestsService.mine(),
  });

  const stats = requests
    ? [
        {
          label: "Active",
          value: requests.filter((r) => ["ASSIGNED", "IN_PROGRESS", "REVIEW"].includes(r.status)).length,
          icon: Sparkles,
          hint: "Currently being worked on",
        },
        {
          label: "Pending",
          value: requests.filter((r) =>
            ["SUBMITTED", "UNDER_REVIEW", "QUOTED", "AWAITING_PAYMENT"].includes(r.status),
          ).length,
          icon: Clock,
          hint: "Awaiting action",
        },
        {
          label: "Completed",
          value: requests.filter((r) => r.status === "COMPLETED").length,
          icon: CheckCircle2,
          hint: "All time",
        },
        {
          label: "Payments due",
          value: requests.filter((r) => r.paymentStatus === "AWAITING").length,
          icon: CreditCard,
          hint: "Awaiting payment",
        },
      ]
    : null;

  const recent = requests?.slice(0, 4) ?? [];

  return (
    <>
      {/* Header greeting */}
      <motion.div {...rise()} className="mb-8">
        <p className="text-[13px] font-semibold tracking-[0.16em] text-teal uppercase">
          {greeting()}
        </p>
        <h1 className="mt-1 text-[28px] font-extrabold tracking-tight sm:text-[34px]">
          {student.fullName.split(" ")[0]} 👋
        </h1>
        <p className="mt-1.5 text-[14.5px] text-muted-foreground">
          Here's what's happening with your requests.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div {...rise(0.06)}>
        {isLoading ? (
          <StatsSkeleton count={4} />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats?.map((s) => (
              <StatCard key={s.label} label={s.label} value={s.value} hint={s.hint} icon={s.icon} />
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick actions */}
      <motion.div {...rise(0.1)} className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/app/requests/new">
            <Plus className="size-4" aria-hidden /> New request
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/app/requests">
            <FileStack className="size-4" aria-hidden /> View all requests
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/app/messages">Messages</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/app/resources">Resources</Link>
        </Button>
      </motion.div>

      {/* Recent requests */}
      <motion.div {...rise(0.14)} className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[18px] font-bold">Recent requests</h2>
          <Link
            to="/app/requests"
            className="inline-flex items-center gap-1 text-[13.5px] font-semibold text-emerald hover:underline"
          >
            View all <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>

        {isLoading ? (
          <ListSkeleton rows={3} />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : recent.length === 0 ? (
          <EmptyState
            title="No requests yet"
            description="Start by telling us what you need help with."
            action={
              <Button asChild>
                <Link to="/app/requests/new">
                  <Plus className="size-4" aria-hidden /> New request
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recent.map((r) => (
              <RequestCard key={r.id} request={r} />
            ))}
          </div>
        )}
      </motion.div>

      {/* Awaiting payment banner */}
      {requests?.some((r) => r.paymentStatus === "AWAITING") && (
        <motion.div
          {...rise(0.18)}
          className="mt-6 rounded-xl border border-status-payment/30 bg-status-payment/8 p-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-status-payment">Payment required</p>
              <p className="mt-0.5 text-[13.5px] text-muted-foreground">
                You have {requests.filter((r) => r.paymentStatus === "AWAITING").length} request(s) awaiting payment before work can begin.
              </p>
            </div>
            <Button asChild size="sm" className="shrink-0">
              <Link to="/app/payments">
                <CreditCard className="size-4" aria-hidden /> Go to payments
              </Link>
            </Button>
          </div>
        </motion.div>
      )}
    </>
  );
}
