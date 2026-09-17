import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { Download, FileText, GitBranch, Search, Video } from "lucide-react";
import { useState } from "react";
import type { ElementType } from "react";
import { PageTitle } from "@/components/layout/AppShell";
import { EmptyState, ErrorState } from "@/components/shared/States";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { resourcesService } from "@/services";
import type { Resource } from "@/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/_app/resources")({
  head: () => ({ meta: [{ title: "Resources — UniAssist" }] }),
  component: ResourcesPage,
});

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

function ResourcesPage() {
  const reduce = useReducedMotion();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const { data: resources, isLoading, isError, refetch } = useQuery({
    queryKey: ["resources"],
    queryFn: () => resourcesService.list(),
  });

  const { data: categories } = useQuery({
    queryKey: ["resources", "categories"],
    queryFn: () => resourcesService.categories(),
  });

  const allCategories = ["All", ...(categories ?? [])];

  const filtered = (resources ?? []).filter((r) => {
    const matchSearch =
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || r.category === category;
    return matchSearch && matchCat;
  });

  const rise = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.3, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <>
      <PageTitle
        title="Resources"
        description="Study guides, past questions, templates and reference material."
      />

      {/* Search + categories */}
      <div className="mb-6 space-y-3">
        <div className="relative max-w-md">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search resources…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search resources"
          />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {allCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full border px-3 py-1 text-[13px] font-medium transition-colors",
                category === cat
                  ? "border-emerald/50 bg-emerald/10 text-emerald"
                  : "border-border text-muted-foreground hover:border-emerald/30 hover:text-foreground",
              )}
              aria-pressed={category === cat}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="panel h-40 animate-pulse bg-muted/50" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No resources found"
          description="Try adjusting your search or category filter."
        />
      ) : (
        <>
          <p className="mb-4 text-[13.5px] text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "resource" : "resources"}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r, i) => {
              const Icon = formatIcon[r.format];
              return (
                <motion.article
                  key={r.id}
                  {...rise(0.05 * i)}
                  className="panel group flex flex-col p-5 transition-colors hover:border-emerald/35"
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
                  <p className="mt-1.5 flex-1 text-[13.5px] leading-relaxed text-muted-foreground">
                    {r.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                      <span>{r.size}</span>
                      <span aria-hidden>·</span>
                      <span>Updated {r.updated}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-emerald hover:text-emerald" aria-label={`Download ${r.title}`}>
                      <Download className="size-3.5" aria-hidden /> Download
                    </Button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
