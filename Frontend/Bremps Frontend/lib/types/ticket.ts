export type TicketStatus = "open" | "claimed" | "in_progress" | "resolved" | "closed";
export type TicketUrgency = "low" | "normal" | "urgent";
export type PaymentStatus = "pending" | "paid" | "refunded";

export interface StudentInfo {
  id: string;
  name: string;
  email: string;
  studentId: string;
  program: string;
  phone: string;
  avatar?: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  url: string;
  type: "image" | "file";
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderType: "student" | "agent" | "system";
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  createdAt: string;
  attachments?: Attachment[];
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  urgency: TicketUrgency;
  status: TicketStatus;
  student: StudentInfo;
  assignedAgentId?: string;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  paymentRef?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  attachments: Attachment[];
  rating?: {
    score: number;
    comment?: string;
    ratedAt: string;
  };
}
