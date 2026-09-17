import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, CreditCard, Clock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { PageTitle } from "@/components/layout/AppShell";
import { EmptyState, ErrorState } from "@/components/shared/States";
import { RequestStatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { currency, formatDate } from "@/lib/format";
import { paymentsService } from "@/services";

export const Route = createFileRoute("/app/_app/payments")({
  head: () => ({ meta: [{ title: "Payments — UniAssist" }] }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const reduce = useReducedMotion();
  const { data: requests, isLoading, isError, refetch } = useQuery({
    queryKey: ["payments"],
    queryFn: () => paymentsService.list(),
  });

  const rise = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  const pending = (requests ?? []).filter((r) => r.paymentStatus === "AWAITING");
  const paid = (requests ?? []).filter((r) => r.paymentStatus === "PAID");
  const totalPaid = paid.reduce((acc, r) => acc + (r.quote?.total ?? 0), 0);

  return (
    <>
      <PageTitle title="Payments" description="Manage your quotes and payments." />

      {/* Summary cards */}
      {!isLoading && !isError && requests && (
        <motion.div {...rise()} className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="panel p-5">
            <p className="text-[12.5px] font-semibold uppercase tracking-wide text-muted-foreground">Pending</p>
            <p className="mt-3 text-3xl font-extrabold tabular-nums">{pending.length}</p>
            <p className="mt-1 text-[13px] text-muted-foreground">Awaiting payment</p>
          </div>
          <div className="panel p-5">
            <p className="text-[12.5px] font-semibold uppercase tracking-wide text-muted-foreground">Paid</p>
            <p className="mt-3 text-3xl font-extrabold tabular-nums">{paid.length}</p>
            <p className="mt-1 text-[13px] text-muted-foreground">Completed payments</p>
          </div>
          <div className="panel p-5">
            <p className="text-[12.5px] font-semibold uppercase tracking-wide text-muted-foreground">Total spent</p>
            <p className="mt-3 text-3xl font-extrabold tabular-nums">{currency(totalPaid)}</p>
            <p className="mt-1 text-[13px] text-muted-foreground">All time</p>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="panel h-20 animate-pulse bg-muted/50" />)}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <motion.div {...rise(0.08)}>
          <Tabs defaultValue="pending">
            <TabsList className="mb-5">
              <TabsTrigger value="pending">
                Pending
                {pending.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-status-payment/15 px-1.5 text-[11px] font-bold text-status-payment">
                    {pending.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-3">
              {pending.length === 0 ? (
                <EmptyState
                  title="No pending payments"
                  description="All your quotes have been settled."
                  icon={<CheckCircle2 className="size-5 text-emerald" aria-hidden />}
                />
              ) : (
                pending.map((req, i) => (
                  <motion.div
                    key={req.id}
                    {...rise(0.06 * i)}
                    className="panel p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[12px] font-bold text-emerald">{req.reference}</p>
                          <RequestStatusBadge status={req.status} />
                        </div>
                        <p className="mt-1 truncate text-[15.5px] font-semibold">{req.title}</p>
                        {req.quote && (
                          <p className="mt-1 text-[13.5px] text-muted-foreground">
                            {req.quote.summary} · Due {formatDate(req.deadline)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        {req.quote && (
                          <p className="text-[20px] font-extrabold tabular-nums text-foreground">
                            {currency(req.quote.total, req.quote.currency)}
                          </p>
                        )}
                        <Button
                          onClick={() => toast.info("Payment integration coming soon. This will redirect to Paystack.")}
                          className="gap-2"
                        >
                          <CreditCard className="size-4" aria-hidden /> Pay now
                        </Button>
                      </div>
                    </div>

                    {req.quote && (
                      <dl className="mt-4 grid grid-cols-3 gap-4 rounded-xl bg-secondary/50 p-3 text-[13px]">
                        <div>
                          <dt className="text-muted-foreground">Service</dt>
                          <dd className="font-semibold tabular-nums">{currency(req.quote.serviceAmount, req.quote.currency)}</dd>
                        </div>
                        {req.quote.discount > 0 && (
                          <div>
                            <dt className="text-muted-foreground">Discount</dt>
                            <dd className="font-semibold tabular-nums text-emerald">−{currency(req.quote.discount, req.quote.currency)}</dd>
                          </div>
                        )}
                        <div>
                          <dt className="text-muted-foreground">Delivery</dt>
                          <dd className="font-semibold">{req.quote.deliveryEstimate}</dd>
                        </div>
                      </dl>
                    )}

                    <div className="mt-3 flex justify-end">
                      <Link
                        to="/app/requests/$id"
                        params={{ id: req.id }}
                        className="text-[13px] font-semibold text-emerald hover:underline inline-flex items-center gap-1"
                      >
                        View request <ArrowRight className="size-3.5" aria-hidden />
                      </Link>
                    </div>
                  </motion.div>
                ))
              )}
            </TabsContent>

            <TabsContent value="paid" className="space-y-3">
              {paid.length === 0 ? (
                <EmptyState
                  title="No paid requests yet"
                  description="Completed payments will appear here."
                />
              ) : (
                paid.map((req, i) => (
                  <motion.div key={req.id} {...rise(0.06 * i)} className="panel p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[12px] font-bold text-emerald">{req.reference}</p>
                          <RequestStatusBadge status={req.status} />
                        </div>
                        <p className="mt-1 truncate text-[15.5px] font-semibold">{req.title}</p>
                        {req.quote && (
                          <p className="mt-1 text-[13px] text-muted-foreground">
                            Paid · {req.quote.deliveryEstimate}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {req.quote && (
                          <p className="text-[18px] font-extrabold tabular-nums">
                            {currency(req.quote.total, req.quote.currency)}
                          </p>
                        )}
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-status-done/25 bg-status-done/8 px-2.5 py-1 text-[12px] font-semibold text-status-done">
                          <CheckCircle2 className="size-3.5" aria-hidden /> Paid
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Link
                        to="/app/requests/$id"
                        params={{ id: req.id }}
                        className="text-[13px] font-semibold text-emerald hover:underline inline-flex items-center gap-1"
                      >
                        View request <ArrowRight className="size-3.5" aria-hidden />
                      </Link>
                    </div>
                  </motion.div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </>
  );
}
