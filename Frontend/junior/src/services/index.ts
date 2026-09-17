/**
 * Service abstractions over mock data.
 * Swap these bodies for real API calls later — the UI never changes.
 */
import {
  messages as mockMessages,
  requests as mockRequests,
  resources as mockResources,
  services as mockServices,
  student as mockStudent,
  team as mockTeam,
} from "./mock-data";
import type { Message, Resource, ServiceDefinition, StudentProfile, SupportRequest, TeamMember } from "@/types";

const delay = <T>(value: T, ms = 250): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

export const authService = {
  currentUser: (): Promise<StudentProfile> => delay(mockStudent),
  login: (email: string) => delay({ ok: true as const, email }),
  register: (data: Record<string, unknown>) => delay({ ok: true as const, data }),
  forgotPassword: (email: string) => delay({ ok: true as const, email }),
};

export const usersService = {
  profile: (): Promise<StudentProfile> => delay(mockStudent),
  students: () => delay(Array.from(new Map(mockRequests.map((r) => [r.studentId, r])).values())),
};

export const requestsService = {
  list: (): Promise<SupportRequest[]> => delay(mockRequests),
  mine: (): Promise<SupportRequest[]> =>
    delay(mockRequests.filter((r) => r.studentId === mockStudent.studentId)),
  byId: (id: string): Promise<SupportRequest | undefined> =>
    delay(mockRequests.find((r) => r.id === id || r.reference === id)),
  create: (payload: Record<string, unknown>) =>
    delay({ reference: `REQ-${10_483 + Math.floor(Math.random() * 400)}`, payload }, 700),
};

export const messagesService = {
  byRequest: (requestId: string, includeInternal = false): Promise<Message[]> =>
    delay(mockMessages.filter((m) => m.requestId === requestId && (includeInternal || m.kind !== "internal"))),
  threads: (): Promise<Message[]> => delay(mockMessages),
  send: (message: Omit<Message, "id" | "createdAt">) =>
    delay({ ...message, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, 150),
};

export const paymentsService = {
  list: () => delay(mockRequests.filter((r) => r.quote)),
  checkout: (requestId: string) => delay({ ok: true as const, requestId }, 800),
};

export const resourcesService = {
  list: (): Promise<Resource[]> => delay(mockResources),
  categories: () => delay([...new Set(mockResources.map((r) => r.category))]),
};

export const adminService = {
  team: (): Promise<TeamMember[]> => delay(mockTeam),
  metrics: () =>
    delay({
      totalRequests: mockRequests.length + 128,
      activeRequests: mockRequests.filter((r) =>
        ["IN_PROGRESS", "ASSIGNED", "UNDER_REVIEW"].includes(r.status),
      ).length,
      completedRequests: 96,
      pendingPayments: mockRequests.filter((r) => r.paymentStatus === "AWAITING").length,
      revenue: 48_250,
      workload: 68,
    }),
};

export const notificationsService = {
  preferences: () => delay({ email: true, sms: false, productUpdates: true, deadlineReminders: true }),
};

export const catalogService = {
  services: (): Promise<ServiceDefinition[]> => delay(mockServices),
};
