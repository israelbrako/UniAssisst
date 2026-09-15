"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { AGENTS } from "@/lib/constants/agents";
import { useTickets } from "@/lib/hooks/useTickets";
import { Inbox, UserCheck, ShieldCheck, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function AgentSidebar() {
  const pathname = usePathname();
  const { activeAgent, setRole } = useAuth();
  const { data: allTickets = [] } = useTickets();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const openTickets = allTickets.filter((t) => t.status !== "resolved" && t.status !== "closed");
  const myTickets = allTickets.filter((t) => t.assignedAgentId === activeAgent.id && t.status !== "resolved");

  return (
    <aside className={cn(
      "relative flex shrink-0 flex-col border-r border-slate-800 bg-slate-900 text-slate-300 transition-[width] duration-300 ease-out",
      isCollapsed ? "w-[4.5rem]" : "w-56"
    )}>
      <button
        type="button"
        onClick={() => setIsCollapsed((collapsed) => !collapsed)}
        aria-label={isCollapsed ? "Expand agent sidebar" : "Collapse agent sidebar"}
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-5 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-400 shadow-lg transition-all hover:scale-110 hover:text-white"
      >
        {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Top Header */}
      <div className={cn(
        "flex min-h-[4.5rem] items-center border-b border-slate-800 transition-all duration-300",
        isCollapsed ? "justify-center px-2" : "justify-between p-4"
      )}>
        <div className={cn("flex items-center gap-2 overflow-hidden transition-all duration-300", isCollapsed && "justify-center")}>
          <div className="w-6 h-6 rounded-md bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
            IT
          </div>
          <span className={cn("whitespace-nowrap font-semibold text-sm text-white transition-all duration-300", isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>Agent Desk</span>
        </div>
        <span className={cn("whitespace-nowrap text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded transition-all duration-300", isCollapsed ? "hidden" : "block")}>
          Live
        </span>
      </div>

      {/* Nav Links */}
      <div className={cn("space-y-1 transition-all duration-300", isCollapsed ? "p-2" : "p-3")}>
        <div className={cn("overflow-hidden py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all duration-300", isCollapsed ? "h-0 px-0 opacity-0" : "h-auto px-3 opacity-100")}>
          Views
        </div>
        <Link
          href="/queue"
          className={cn(
            "flex items-center justify-between rounded-md py-2 text-xs font-medium transition-all",
            isCollapsed ? "justify-center px-2" : "px-3",
            pathname === "/queue"
              ? "bg-sky-600 text-white shadow-xs"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          )}
        >
          <div className="flex items-center gap-2.5">
            <Inbox className="w-4 h-4" />
            <span className={cn("overflow-hidden whitespace-nowrap transition-all duration-300", isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>All Queue</span>
          </div>
            <span
            className={cn(
              "px-1.5 py-0.2 rounded-full text-[10px] font-semibold",
              pathname === "/queue" ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-400"
            )}
          >
              {!isCollapsed && openTickets.length}
          </span>
        </Link>

        <Link
          href="/my-tickets"
          className={cn(
            "flex items-center justify-between rounded-md py-2 text-xs font-medium transition-all",
            isCollapsed ? "justify-center px-2" : "px-3",
            pathname === "/my-tickets"
              ? "bg-sky-600 text-white shadow-xs"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          )}
        >
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-4 h-4" />
            <span className={cn("overflow-hidden whitespace-nowrap transition-all duration-300", isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>Assigned to Me</span>
          </div>
          <span
            className={cn(
              "px-1.5 py-0.2 rounded-full text-[10px] font-semibold",
              pathname === "/my-tickets" ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-400"
            )}
          >
              {!isCollapsed && myTickets.length}
          </span>
        </Link>
      </div>

      {/* Active Agent Switcher (The 3-person team) */}
      <div className={cn("mt-auto border-t border-slate-800 transition-all duration-300", isCollapsed ? "p-2" : "p-3")}>
        <div className={cn("flex items-center justify-between overflow-hidden py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all duration-300", isCollapsed ? "h-0 px-0 opacity-0" : "h-auto px-3 opacity-100")}>
          <span>Active Agent</span>
          <span className="text-[10px] text-sky-400 font-mono">3 Techs</span>
        </div>
        <div className="space-y-1 mt-1">
          {AGENTS.map((agent) => {
            const isCurrent = agent.id === activeAgent.id;
            return (
              <button
                key={agent.id}
                type="button"
                onClick={() => setRole("agent", agent.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 rounded-lg py-2 text-left transition-all",
                  isCollapsed ? "justify-center px-2" : "px-2.5",
                  isCurrent
                    ? "bg-slate-800 border border-slate-700 text-white"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                )}
              >
                <div className="relative shrink-0">
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-slate-900" />
                </div>
                <div className={cn("min-w-0 flex-1 overflow-hidden transition-all duration-300", isCollapsed ? "w-0 flex-none opacity-0" : "w-auto opacity-100")}>
                  <div className="text-xs font-semibold truncate leading-tight flex items-center gap-1">
                    <span>{agent.name}</span>
                    {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{agent.role}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
