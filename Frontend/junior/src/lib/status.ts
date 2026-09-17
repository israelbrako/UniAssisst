import type { Priority, RequestStatus } from "@/types";

export const statusLabels: Record<RequestStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  QUOTED: "Quoted",
  AWAITING_PAYMENT: "Awaiting payment",
  PAID: "Paid",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In progress",
  REVIEW: "Review",
  COMPLETED: "Completed",
  CLOSED: "Closed",
  CANCELLED: "Cancelled",
  REJECTED: "Rejected",
  DISPUTED: "Disputed",
};

/** Token-backed classes. Status is never communicated by colour alone — label + dot always present. */
export const statusStyles: Record<RequestStatus, string> = {
  DRAFT: "text-status-draft border-status-draft/25 bg-status-draft/8",
  SUBMITTED: "text-status-submitted border-status-submitted/25 bg-status-submitted/8",
  UNDER_REVIEW: "text-status-review border-status-review/30 bg-status-review/10",
  QUOTED: "text-status-quoted border-status-quoted/25 bg-status-quoted/8",
  AWAITING_PAYMENT: "text-status-payment border-status-payment/30 bg-status-payment/10",
  PAID: "text-status-paid border-status-paid/25 bg-status-paid/8",
  ASSIGNED: "text-teal border-teal/25 bg-teal/8",
  IN_PROGRESS: "text-status-progress border-status-progress/25 bg-status-progress/10",
  REVIEW: "text-status-quoted border-status-quoted/25 bg-status-quoted/8",
  COMPLETED: "text-status-done border-status-done/25 bg-status-done/8",
  CLOSED: "text-status-draft border-status-draft/25 bg-status-draft/8",
  CANCELLED: "text-status-draft border-status-draft/25 bg-status-draft/8",
  REJECTED: "text-status-danger border-status-danger/25 bg-status-danger/8",
  DISPUTED: "text-status-danger border-status-danger/25 bg-status-danger/8",
};

export const priorityLabels: Record<Priority, string> = {
  LOW: "Low",
  NORMAL: "Normal",
  HIGH: "High",
  URGENT: "Urgent",
};

export const priorityStyles: Record<Priority, string> = {
  LOW: "text-muted-foreground border-border bg-muted",
  NORMAL: "text-teal border-teal/25 bg-teal/8",
  HIGH: "text-status-review border-status-review/30 bg-status-review/10",
  URGENT: "text-status-danger border-status-danger/30 bg-status-danger/10",
};
