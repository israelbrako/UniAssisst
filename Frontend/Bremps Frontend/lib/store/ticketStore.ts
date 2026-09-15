import { Ticket, TicketMessage, TicketStatus } from "@/lib/types/ticket";
import { INITIAL_TICKETS, INITIAL_MESSAGES } from "./mockData";

const STORAGE_KEY_TICKETS = "campus_it_tickets_v2";
const STORAGE_KEY_MESSAGES = "campus_it_messages_v2";

// In-memory singletons for SSR & fallback
let memoryTickets: Ticket[] = [...INITIAL_TICKETS];
let memoryMessages: Record<string, TicketMessage[]> = { ...INITIAL_MESSAGES };

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function loadTickets(): Ticket[] {
  if (!isBrowser()) return memoryTickets;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TICKETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(INITIAL_TICKETS));
      return INITIAL_TICKETS;
    }
    return JSON.parse(raw);
  } catch {
    return memoryTickets;
  }
}

function saveTickets(tickets: Ticket[]) {
  memoryTickets = tickets;
  if (isBrowser()) {
    try {
      localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(tickets));
      window.dispatchEvent(new CustomEvent("campus-tickets-updated", { detail: tickets }));
    } catch (e) {
      console.error("Failed to save tickets to localStorage", e);
    }
  }
}

function loadMessages(): Record<string, TicketMessage[]> {
  if (!isBrowser()) return memoryMessages;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MESSAGES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(INITIAL_MESSAGES));
      return INITIAL_MESSAGES;
    }
    return JSON.parse(raw);
  } catch {
    return memoryMessages;
  }
}

function saveMessages(messages: Record<string, TicketMessage[]>, updatedTicketId?: string) {
  memoryMessages = messages;
  if (isBrowser()) {
    try {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
      window.dispatchEvent(
        new CustomEvent("campus-messages-updated", {
          detail: { ticketId: updatedTicketId, messages },
        })
      );
    } catch (e) {
      console.error("Failed to save messages to localStorage", e);
    }
  }
}

export const ticketStore = {
  getAllTickets(): Ticket[] {
    return loadTickets();
  },

  getTicketById(id: string): Ticket | undefined {
    const tickets = loadTickets();
    return tickets.find((t) => t.id === id);
  },

  getMessages(ticketId: string): TicketMessage[] {
    const all = loadMessages();
    return all[ticketId] || [];
  },

  createTicket(newTicket: Omit<Ticket, "id" | "createdAt" | "updatedAt">): Ticket {
    const tickets = loadTickets();
    const id = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    const created: Ticket = {
      ...newTicket,
      id,
      createdAt: now,
      updatedAt: now,
    };

    saveTickets([created, ...tickets]);

    // Add initial student description as first message
    const messages = loadMessages();
    messages[id] = [
      {
        id: `msg-${Date.now()}`,
        ticketId: id,
        senderType: "student",
        senderId: created.student.id,
        senderName: created.student.name,
        senderAvatar: created.student.avatar,
        content: created.description,
        createdAt: now,
        attachments: created.attachments,
      },
    ];
    saveMessages(messages, id);

    return created;
  },

  claimTicket(ticketId: string, agentId: string): Ticket | undefined {
    const tickets = loadTickets();
    const index = tickets.findIndex((t) => t.id === ticketId);
    if (index === -1) return undefined;

    const ticket = tickets[index];
    const updated: Ticket = {
      ...ticket,
      assignedAgentId: agentId,
      status: ticket.status === "open" ? "claimed" : ticket.status,
      updatedAt: new Date().toISOString(),
    };

    tickets[index] = updated;
    saveTickets([...tickets]);
    return updated;
  },

  updateStatus(ticketId: string, status: TicketStatus): Ticket | undefined {
    const tickets = loadTickets();
    const index = tickets.findIndex((t) => t.id === ticketId);
    if (index === -1) return undefined;

    const ticket = tickets[index];
    const now = new Date().toISOString();
    const updated: Ticket = {
      ...ticket,
      status,
      updatedAt: now,
      resolvedAt: status === "resolved" ? now : ticket.resolvedAt,
    };

    tickets[index] = updated;
    saveTickets([...tickets]);
    return updated;
  },

  addMessage(
    ticketId: string,
    message: Omit<TicketMessage, "id" | "ticketId" | "createdAt">
  ): TicketMessage {
    const messages = loadMessages();
    const ticketMessages = messages[ticketId] || [];
    const now = new Date().toISOString();
    const newMsg: TicketMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      ticketId,
      createdAt: now,
    };

    messages[ticketId] = [...ticketMessages, newMsg];
    saveMessages(messages, ticketId);

    // Also update ticket updatedAt
    const tickets = loadTickets();
    const ticketIndex = tickets.findIndex((t) => t.id === ticketId);
    if (ticketIndex !== -1) {
      tickets[ticketIndex].updatedAt = now;
      saveTickets([...tickets]);
    }

    return newMsg;
  },

  rateTicket(ticketId: string, score: number, comment?: string): Ticket | undefined {
    const tickets = loadTickets();
    const index = tickets.findIndex((t) => t.id === ticketId);
    if (index === -1) return undefined;

    const ticket = tickets[index];
    const updated: Ticket = {
      ...ticket,
      rating: {
        score,
        comment,
        ratedAt: new Date().toISOString(),
      },
    };

    tickets[index] = updated;
    saveTickets([...tickets]);
    return updated;
  },

  resetDefaults() {
    saveTickets(INITIAL_TICKETS);
    saveMessages(INITIAL_MESSAGES);
  },
};
