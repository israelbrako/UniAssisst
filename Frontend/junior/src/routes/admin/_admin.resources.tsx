import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { Download, FileText, GitBranch, Pencil, Plus, Search, Trash2, Video } from "lucide-react";
import { useState } from "react";
import type { ElementType } from "react";
import { toast } from "sonner";
import { PageTitle } from "@/components/layout/AppShell";
import { EmptyState, ErrorState } from "@/components/shared/States";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resourcesService } from "@/services";
import type { Resource } from "@/types";
import { cn } from "@/lib/utils";

const formatIcon: Record<Resource["format"], ElementType> = {
  PDF: FileText,
  Guide: FileText,
  Repo: GitBranch,
  Template: FileText,
  Video: Video,
};

const formatColor: Record<Resource["format"], string> = {
  PDF: "bg-status-danger/8 text-status-danger border-status-danger/20",
  Guide: "bg-teal/8 text-teal border-teal/20",
  Repo: "bg-status-quoted/8 text-status-quoted border-status-quoted/20",
  Template: "bg-emerald/8 text-emerald border-emerald/20",
  Video: "bg-status-payment/8 text-status-payment border-status-payment/20",
};

export const Route = createFileRoute("/admin/_admin/resources")({
  head: () => ({ meta: [{ title: "Resources — Admin · UniAssist" }] }),
  component: AdminResourcesPage,
});

function AdminResourcesPage() {
  const reduce = useReducedMotion();
  const [search, setSearch] = useState("");

  const { data: resources, isLoading, isError, refetch } = useQuery({
    queryKey: ["resources"],
    queryFn: () => resourcesService.list(),
  });

  const filtered = (resources ?? []).filter(
    (r) =>
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase()),
  );

  const rise = (delay = 0) =>
    reduce ? {} : {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3, delay, ease: [0.22, 1, 0.36, 1] as const },
    };

  return (
    <>
      <PageTitle
        title="Resources"
        description="Manage the resource library available to students."
        action={
          <Button className="gap-1.5" onClick={() => toast.info("Add resource — coming soon")}>
            <Plus className="size-4" aria-hidden /> Add resource
          </Button>
        }
      />

      <div className="mb-5 relative max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          placeholder="Search resources…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          aria-label="Search resources"
        />
      </div>

      {!isLoading && !isError && (
        <p className="mb-4 text-[13.5px] text-muted-foreground">{filtered.length} resources</p>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {[...Array(6)].map((_, i) => <div key={i} className="panel h-44 animate-pulse bg-muted/50" />)}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No resources found" description="Try adjusting your search or add a new resource." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r, i) => {
            const Icon = formatIcon[r.format];
            return (
              <motion.article
                key={r.id}
                {...rise(0.05 * i)}
                className="panel flex flex-col p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-teal">
                    <Icon className="size-4.5" aria-hidden />
                  </span>
                  <span className={cn("rounded-md border px-2 py-0.5 text-[11px] font-semibold", formatColor[r.format])}>
                    {r.format}
                  </span>
                </div>
                <h3 className="mt-3.5 text-[15px] font-bold leading-snug">{r.title}</h3>
                <p className="mt-1.5 flex-1 text-[13.5px] leading-relaxed text-muted-foreground">{r.description}</p>
                <p className="mt-2 text-[12px] text-muted-foreground">{r.category} · {r.size} · {r.updated}</p>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => toast.info(`Edit ${r.title} — coming soon`)}>
                    <Pencil className="size-3.5" aria-hidden /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" aria-label={`Download ${r.title}`}>
                    <Download className="size-4" aria-hidden />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-status-danger hover:text-status-danger" aria-label={`Delete ${r.title}`} onClick={() => toast.error("Delete requires confirmation — coming soon")}>
                    <Trash2 className="size-4" aria-hidden />
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
