import { Link } from "@tanstack/react-router";
import { CalendarClock, ChevronRight } from "lucide-react";
import { PriorityBadge, RequestStatusBadge } from "@/components/shared/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { formatDate, relativeTime } from "@/lib/format";
import type { SupportRequest } from "@/types";

export function RequestCard({ request, basePath = "/app/requests" }: { request: SupportRequest; basePath?: string }) {
  return (
    <article className="panel group p-5 transition-colors hover:border-emerald/35">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold tracking-wide text-emerald">{request.reference}</p>
          <h3 className="mt-1 truncate text-[16.5px] font-semibold">{request.title}</h3>
          <p className="mt-1 text-[13.5px] text-muted-foreground">
            {request.category.replace("-", " ")} · updated {relativeTime(request.updatedAt)}
          </p>
        </div>
        <RequestStatusBadge status={request.status} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock className="size-3.5" aria-hidden />
          Due {formatDate(request.deadline)}
        </span>
        <PriorityBadge priority={request.priority} />
        {request.assignee ? (
          <span className="inline-flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-full bg-accent text-[10.5px] font-bold text-accent-foreground">
              {request.assignee.initials}
            </span>
            {request.assignee.name}
          </span>
        ) : (
          <span>Awaiting assignment</span>
        )}
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-[12.5px] text-muted-foreground">
          <span>Progress</span>
          <span className="font-semibold tabular-nums">{request.progress}%</span>
        </div>
        <Progress value={request.progress} className="h-1.5" />
      </div>

      <Link
        to={`${basePath}/$id`}
        params={{ id: request.id }}
        className="mt-4 inline-flex items-center gap-1 text-[14px] font-semibold text-emerald hover:underline"
      >
        View request
        <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </Link>
    </article>
  );
}
