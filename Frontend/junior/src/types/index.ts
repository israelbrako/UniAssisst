export type RequestStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "QUOTED"
  | "AWAITING_PAYMENT"
  | "PAID"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "REVIEW"
  | "COMPLETED"
  | "CLOSED"
  | "CANCELLED"
  | "REJECTED"
  | "DISPUTED";

export type Priority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type ServiceCategory =
  | "tutoring"
  | "programming"
  | "technical-support"
  | "project-support"
  | "research-support"
  | "documentation";

export interface ServiceDefinition {
  slug: ServiceCategory;
  name: string;
  short: string;
  description: string;
  icon: string;
  includes: string[];
}

export interface RequestFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress?: number;
}

export interface Quote {
  id: string;
  summary: string;
  deliveryEstimate: string;
  serviceAmount: number;
  discount: number;
  total: number;
  currency: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialization: string;
  availability: "AVAILABLE" | "BUSY" | "OFFLINE";
  activeRequests: number;
  completedRequests: number;
  rating: number;
  initials: string;
}

export interface Message {
  id: string;
  requestId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
  kind: "student" | "support" | "system" | "internal";
  read?: boolean;
  attachment?: { name: string; size: number };
}

export interface StatusEvent {
  status: RequestStatus;
  at: string;
  note?: string;
}

export interface SupportRequest {
  id: string;
  reference: string;
  title: string;
  category: ServiceCategory;
  description: string;
  course?: string;
  department?: string;
  technology?: string;
  status: RequestStatus;
  priority: Priority;
  deadline: string;
  progress: number;
  assignee?: TeamMember;
  studentName: string;
  studentId: string;
  createdAt: string;
  updatedAt: string;
  files: RequestFile[];
  quote?: Quote;
  paymentStatus: "UNPAID" | "AWAITING" | "PAID" | "REFUNDED";
  deliverables: RequestFile[];
  history: StatusEvent[];
}

export interface StudentProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  university: string;
  department: string;
  level: string;
  studentId: string;
  initials: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  format: "PDF" | "Guide" | "Repo" | "Template" | "Video";
  size: string;
  updated: string;
}
