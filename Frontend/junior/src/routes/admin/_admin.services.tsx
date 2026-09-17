import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { Code2, FileText, GraduationCap, Layers, Microscope, Pencil, Plus, Wrench } from "lucide-react";
import { toast } from "sonner";
import { PageTitle } from "@/components/layout/AppShell";
import { ErrorState } from "@/components/shared/States";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { catalogService } from "@/services";

const icons = { GraduationCap, Wrench, Code2, Layers, Microscope, FileText };

export const Route = createFileRoute("/admin/_admin/services")({
  head: () => ({ meta: [{ title: "Services — Admin · UniAssist" }] }),
  component: AdminServicesPage,
});

function AdminServicesPage() {
  const reduce = useReducedMotion();
  const { data: services, isLoading, isError, refetch } = useQuery({
    queryKey: ["catalog", "services"],
    queryFn: () => catalogService.services(),
  });

  const rise = (delay = 0) =>
    reduce ? {} : {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3, delay, ease: [0.22, 1, 0.36, 1] as const },
    };

  return (
    <>
      <PageTitle
        title="Services"
        description="Manage the service catalog available to students."
        action={
          <Button className="gap-1.5" onClick={() => toast.info("Add service — coming soon")}>
            <Plus className="size-4" aria-hidden /> Add service
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {[...Array(6)].map((_, i) => <div key={i} className="panel h-44 animate-pulse bg-muted/50" />)}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(services ?? []).map((s, i) => {
            const Icon = icons[s.icon as keyof typeof icons] ?? GraduationCap;
            return (
              <motion.article
                key={s.slug}
                {...rise(0.05 * i)}
                className="panel flex flex-col p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-teal">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <Switch
                    defaultChecked
                    aria-label={`Toggle ${s.name}`}
                    onCheckedChange={(v) => toast.info(`${s.name} ${v ? "enabled" : "disabled"}`)}
                  />
                </div>
                <h3 className="mt-3.5 text-[15.5px] font-bold">{s.name}</h3>
                <p className="mt-1 flex-1 text-[13.5px] leading-relaxed text-muted-foreground">{s.short}</p>

                <ul className="mt-3 space-y-1">
                  {s.includes.slice(0, 3).map((item) => (
                    <li key={item} className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
                      <span className="size-1.5 rounded-full bg-emerald/60 shrink-0" aria-hidden />
                      {item}
                    </li>
                  ))}
                  {s.includes.length > 3 && (
                    <li className="text-[12px] text-muted-foreground">+{s.includes.length - 3} more</li>
                  )}
                </ul>

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5"
                    onClick={() => toast.info(`Edit ${s.name} — coming soon`)}
                  >
                    <Pencil className="size-3.5" aria-hidden /> Edit
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
