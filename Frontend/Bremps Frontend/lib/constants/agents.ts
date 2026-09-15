export interface Agent {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  status: "online" | "away" | "busy";
  activeTicketsCount: number;
  resolvedTodayCount: number;
  rating: number;
  specialtyCategories: string[];
}

export const AGENTS: Agent[] = [
  {
    id: "agent-marcus",
    name: "Marcus Vance",
    role: "Software Development Specialist",
    email: "marcus.vance@campus-it.edu",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    status: "online",
    activeTicketsCount: 4,
    resolvedTodayCount: 7,
    rating: 4.9,
    specialtyCategories: ["wifi-network", "hardware-diagnostics"],
  },
  {
    id: "agent-sarah",
    name: "Sarah Lin",
    role: "Web & Database Systems Specialist",
    email: "sarah.lin@campus-it.edu",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    status: "online",
    activeTicketsCount: 3,
    resolvedTodayCount: 9,
    rating: 4.95,
    specialtyCategories: ["portal-lms", "account-2fa"],
  },
  {
    id: "agent-david",
    name: "David Kalu",
    role: "Linux & Windows Software Specialist",
    email: "david.kalu@campus-it.edu",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    status: "online",
    activeTicketsCount: 2,
    resolvedTodayCount: 6,
    rating: 4.85,
    specialtyCategories: ["software-os", "printing-peripherals"],
  },
];

export function getAgentById(id?: string): Agent | undefined {
  if (!id) return undefined;
  return AGENTS.find((a) => a.id === id);
}
