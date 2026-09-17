import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import { PageTitle } from "@/components/layout/AppShell";
import { StatCard } from "@/components/shared/StatCard";
import { ErrorState } from "@/components/shared/States";
import { adminService, requestsService } from "@/services";
import { currency } from "@/lib/format";
import { TrendingUp, CheckCircle2, Clock, Zap } from "lucide-react";

export const Route = createFileRoute("/admin/_admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Admin · UniAssist" }] }),
  component: AdminAnalyticsPage,
});

// Brand colors for charts
const CHART_COLORS = ["#00B894", "#007A6E", "#19D3C5", "#7FFFD4", "#062F2C"];

const monthlyData = [
  { month: "Apr", requests: 18, revenue: 5400 },
  { month: "May", requests: 24, revenue: 7200 },
  { month: "Jun", requests: 31, revenue: 9800 },
  { month: "Jul", requests: 27, revenue: 8100 },
  { month: "Aug", requests: 35, revenue: 11500 },
  { month: "Sep", requests: 42, revenue: 13750 },
];

const categoryData = [
  { name: "Programming", value: 38 },
  { name: "Project Support", value: 25 },
  { name: "Technical", value: 18 },
  { name: "Research", value: 10 },
  { name: "Academic", value: 6 },
  { name: "Documentation", value: 3 },
];

const statusData = [
  { name: "In Progress", value: 12 },
  { name: "Completed", value: 96 },
  { name: "Under Review", value: 8 },
  { name: "Awaiting Payment", value: 4 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg text-[13px]">
      {label && <p className="mb-1.5 font-semibold">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="flex items-center gap-2">
          <span className="size-2 rounded-full inline-block" style={{ background: p.color }} />
          {p.name}: <span className="font-bold">{p.name === "Revenue" ? `GH₵ ${p.value.toLocaleString()}` : p.value}</span>
        </p>
      ))}
    </div>
  );
};

function AdminAnalyticsPage() {
  const reduce = useReducedMotion();
  const { data: metrics, isLoading, isError } = useQuery({
    queryKey: ["admin", "metrics"],
    queryFn: () => adminService.metrics(),
  });

  const rise = (delay = 0) =>
    reduce ? {} : {
      initial: { opacity: 0, y: 14 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] as const },
    };

  if (isError) return <ErrorState />;

  return (
    <>
      <PageTitle title="Analytics" description="Platform performance, request trends and revenue." />

      {/* KPIs */}
      {!isLoading && metrics && (
        <motion.div {...rise()} className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total revenue" value={currency(metrics.revenue)} icon={TrendingUp} hint="All time" />
          <StatCard label="Total requests" value={metrics.totalRequests} icon={Zap} hint="All time" />
          <StatCard label="Completed" value={metrics.completedRequests} icon={CheckCircle2} hint="Successful completions" />
          <StatCard label="Team workload" value={`${metrics.workload}%`} icon={Clock} hint="Average utilisation" />
        </motion.div>
      )}

      {/* Monthly trends */}
      <motion.div {...rise(0.08)} className="mb-6 panel p-5">
        <h2 className="mb-5 text-[15px] font-bold">Monthly trends</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
            <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line yAxisId="left" type="monotone" dataKey="requests" name="Requests" stroke={CHART_COLORS[0]} strokeWidth={2.5} dot={{ r: 4, fill: CHART_COLORS[0] }} />
            <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke={CHART_COLORS[2]} strokeWidth={2.5} dot={{ r: 4, fill: CHART_COLORS[2] }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Requests by category */}
        <motion.div {...rise(0.12)} className="panel p-5">
          <h2 className="mb-5 text-[15px] font-bold">Requests by category</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={categoryData} layout="vertical" margin={{ left: 24 }}>
              <XAxis type="number" tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Requests" radius={[0, 4, 4, 0]}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Status distribution */}
        <motion.div {...rise(0.14)} className="panel p-5">
          <h2 className="mb-5 text-[15px] font-bold">Request status distribution</h2>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <ul className="flex-1 space-y-2.5">
              {statusData.map((d, i) => (
                <li key={d.name} className="flex items-center justify-between text-[13px]">
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} aria-hidden />
                    {d.name}
                  </span>
                  <span className="font-semibold tabular-nums">{d.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </>
  );
}
