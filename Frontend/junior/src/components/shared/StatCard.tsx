import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "light",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "light" | "ink";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-5",
        tone === "ink"
          ? "border-mint/12 bg-ink-soft text-ivory"
          : "border-border bg-card shadow-[var(--shadow-panel)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={cn(
            "text-[12.5px] font-semibold tracking-wide uppercase",
            tone === "ink" ? "text-mint/60" : "text-muted-foreground",
          )}
        >
          {label}
        </p>
        {Icon && (
          <Icon
            className={cn("size-4 shrink-0", tone === "ink" ? "text-mint/70" : "text-emerald")}
            aria-hidden
          />
        )}
      </div>
      <p className="mt-3 text-3xl font-extrabold tracking-tight tabular-nums">{value}</p>
      {hint && (
        <p className={cn("mt-1 text-[13px]", tone === "ink" ? "text-ivory/55" : "text-muted-foreground")}>
          {hint}
        </p>
      )}
    </div>
  );
}
