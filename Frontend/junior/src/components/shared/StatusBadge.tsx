import { cn } from "@/lib/utils";
import { priorityLabels, priorityStyles, statusLabels, statusStyles } from "@/lib/status";
import type { Priority, RequestStatus } from "@/types";

export function RequestStatusBadge({ status, className }: { status: RequestStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap",
        statusStyles[status],
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {statusLabels[status]}
    </span>
  );
}

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11.5px] font-semibold",
        priorityStyles[priority],
        className,
      )}
    >
      {priorityLabels[priority]}
    </span>
  );
}
