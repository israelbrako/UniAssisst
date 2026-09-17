import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { Search, ArrowRight, Users } from "lucide-react";
import { useState } from "react";
import { PageTitle } from "@/components/layout/AppShell";
import { EmptyState, ErrorState } from "@/components/shared/States";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { requestsService } from "@/services";

export const Route = createFileRoute("/admin/_admin/students")({
  head: () => ({ meta: [{ title: "Students — Admin · UniAssist" }] }),
  component: AdminStudentsPage,
});

function AdminStudentsPage() {
  const reduce = useReducedMotion();
  const [search, setSearch] = useState("");

  const { data: requests, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "requests"],
    queryFn: () => requestsService.list(),
  });

  // Derive unique students from requests
  const students = Object.values(
    (requests ?? []).reduce<Record<string, { name: string; studentId: string; requests: number; lastActive: string }>>((acc, r) => {
      if (!acc[r.studentId]) {
        acc[r.studentId] = { name: r.studentName, studentId: r.studentId, requests: 0, lastActive: r.updatedAt };
      }
      acc[r.studentId].requests++;
      if (r.updatedAt > acc[r.studentId].lastActive) acc[r.studentId].lastActive = r.updatedAt;
      return acc;
    }, {}),
  );

  const filtered = students.filter((s) =>
    !search ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.studentId.toLowerCase().includes(search.toLowerCase()),
  );

  const rise = (delay = 0) =>
    reduce ? {} : {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3, delay, ease: [0.22, 1, 0.36, 1] as const },
    };

  return (
    <>
      <PageTitle title="Students" description={`${students.length} registered students`} />

      <div className="mb-5 relative max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          placeholder="Search by name or student ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          aria-label="Search students"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2" aria-busy="true">
          {[...Array(5)].map((_, i) => <div key={i} className="panel h-14 animate-pulse bg-muted/50" />)}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No students found" description="Try adjusting your search." icon={<Users className="size-5" aria-hidden />} />
      ) : (
        <motion.div {...rise()} className="panel overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px]" aria-label="Students table">
              <thead>
                <tr className="border-b border-border bg-secondary/60 text-left text-muted-foreground">
                  {["Student", "Student ID", "Requests", "Last active", ""].map((h) => (
                    <th key={h} scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <motion.tr
                    key={s.studentId}
                    {...(reduce ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.03 * i } })}
                    className="border-b border-border last:border-0 hover:bg-secondary/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-8 place-items-center rounded-full bg-accent text-[12px] font-bold text-accent-foreground">
                          {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </span>
                        <span className="font-medium">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground">{s.studentId}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold">{s.requests}</span>
                      <span className="text-muted-foreground"> request{s.requests !== 1 ? "s" : ""}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(s.lastActive).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <Button asChild variant="ghost" size="sm">
                        <Link to="/admin/requests" search={{ student: s.studentId } as never}>
                          View requests <ArrowRight className="size-3.5 ml-1" aria-hidden />
                        </Link>
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </>
  );
}
