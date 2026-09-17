import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { PageTitle } from "@/components/layout/AppShell";
import { StatCard } from "@/components/shared/StatCard";
import { EmptyState, ErrorState } from "@/components/shared/States";
import { RequestStatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { currency, formatDate } from "@/lib/format";
import { paymentsService } from "@/services";

export const Route = createFileRoute("/admin/_admin/payments")({
  head: () => ({ meta: [{ title: "Payments — Admin · UniAssist" }] }),
  component: AdminPaymentsPage,
});

function AdminPaymentsPage() {
  const reduce = useReducedMotion();
  const { data: requests, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "payments"],
    queryFn: () => paymentsService.list(),
  });

  const rise = (delay = 0) =>
    reduce ? {} : {
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] as const },
    };

  const awaiting = (requests ?? []).filter((r) => r.paymentStatus === "AWAITING");
  const paid = (requests ?? []).filter((r) => r.paymentStatus === "PAID");
  const totalRevenue = paid.reduce((acc, r) => acc + (r.quote?.total ?? 0), 0);
  const pendingValue = awaiting.reduce((acc, r) => acc + (r.quote?.total ?? 0), 0);

  return (
    <>
      <PageTitle title="Payments" description="Track quotes, payment status and revenue." />

      {!isLoading && !isError && (
        <motion.div {...rise()} className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard label="Total revenue" value={currency(totalRevenue)} icon={TrendingUp} hint="All paid requests" />
          <StatCard label="Pending" value={awaiting.length} icon={Clock} hint={`${currency(pendingValue)} outstanding`} />
          <StatCard label="Completed" value={paid.length} icon={CheckCircle2} hint="All time" />
        </motion.div>
      )}

      {isLoading ? (
        <div className="space-y-2" aria-busy="true">
          {[...Array(4)].map((_, i) => <div key={i} className="panel h-16 animate-pulse bg-muted/50" />)}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <motion.div {...rise(0.08)}>
          <Tabs defaultValue="awaiting">
            <TabsList className="mb-5">
              <TabsTrigger value="awaiting">
                Awaiting payment
                {awaiting.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-status-payment/15 px-1.5 text-[11px] font-bold text-status-payment">
                    {awaiting.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
            </TabsList>

            <TabsContent value="awaiting" className="space-y-3">
              {awaiting.length === 0 ? (
                <EmptyState title="No pending payments" description="All quotes have been paid." icon={<CheckCircle2 className="size-5 text-emerald" aria-hidden />} />
              ) : (
                <div className="panel overflow-hidden p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-[13.5px]" aria-label="Awaiting payment">
                      <thead>
                        <tr className="border-b border-border bg-secondary/60 text-left text-muted-foreground">
                          {["Reference", "Student", "Request", "Amount", "Status", "Deadline", ""].map((h) => (
                            <th key={h} scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {awaiting.map((r, i) => (
                          <motion.tr
                            key={r.id}
                            {...(reduce ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.04 * i } })}
                            className="border-b border-border last:border-0 hover:bg-secondary/30"
                          >
                            <td className="px-4 py-3 font-mono text-[12px] font-bold text-emerald">{r.reference}</td>
                            <td className="px-4 py-3 font-medium whitespace-nowrap">{r.studentName}</td>
                            <td className="px-4 py-3 max-w-[180px]"><p className="truncate">{r.title}</p></td>
                            <td className="px-4 py-3 font-bold tabular-nums whitespace-nowrap">
                              {r.quote ? currency(r.quote.total, r.quote.currency) : "—"}
                            </td>
                            <td className="px-4 py-3"><RequestStatusBadge status={r.status} /></td>
                            <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{formatDate(r.deadline)}</td>
                            <td className="px-4 py-3 flex gap-2">
                              <Button asChild variant="ghost" size="sm">
                                <Link to="/admin/requests/$id" params={{ id: r.id }}>View</Link>
                              </Button>
                              <Button size="sm" onClick={() => toast.info("Manual payment confirmation — coming soon")}>
                                Confirm paid
                              </Button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="paid">
              {paid.length === 0 ? (
                <EmptyState title="No paid requests yet" description="Completed payments will appear here." />
              ) : (
                <div className="panel overflow-hidden p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-[13.5px]" aria-label="Paid requests">
                      <thead>
                        <tr className="border-b border-border bg-secondary/60 text-left text-muted-foreground">
                          {["Reference", "Student", "Request", "Amount", "Status", "Paid on", ""].map((h) => (
                            <th key={h} scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {paid.map((r, i) => (
                          <motion.tr
                            key={r.id}
                            {...(reduce ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.04 * i } })}
                            className="border-b border-border last:border-0 hover:bg-secondary/30"
                          >
                            <td className="px-4 py-3 font-mono text-[12px] font-bold text-emerald">{r.reference}</td>
                            <td className="px-4 py-3 font-medium whitespace-nowrap">{r.studentName}</td>
                            <td className="px-4 py-3 max-w-[180px]"><p className="truncate">{r.title}</p></td>
                            <td className="px-4 py-3 font-bold tabular-nums whitespace-nowrap">
                              {r.quote ? currency(r.quote.total, r.quote.currency) : "—"}
                            </td>
                            <td className="px-4 py-3"><RequestStatusBadge status={r.status} /></td>
                            <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{formatDate(r.updatedAt)}</td>
                            <td className="px-4 py-3">
                              <Button asChild variant="ghost" size="sm">
                                <Link to="/admin/requests/$id" params={{ id: r.id }}>
                                  View <ArrowRight className="size-3.5 ml-1" aria-hidden />
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
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </>
  );
}
