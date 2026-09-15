"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Users2, Tag, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AGENTS } from "@/lib/constants/agents";
import { CATEGORIES } from "@/lib/constants/categories";

export function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const links = [
    { href: "/overview", label: "Overview & Revenue", icon: BarChart3 },
    { href: "/agents", label: `Manage Agents (${AGENTS.length})`, icon: Users2 },
    { href: "/categories", label: `Service Pricing (${CATEGORIES.length})`, icon: Tag },
  ];

  return (
    <aside className={cn(
      "relative flex shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-300 ease-out",
      isCollapsed ? "w-[4.5rem]" : "w-60"
    )}>
      <button
        type="button"
        onClick={() => setIsCollapsed((collapsed) => !collapsed)}
        aria-label={isCollapsed ? "Expand admin sidebar" : "Collapse admin sidebar"}
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-5 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:scale-110 hover:text-indigo-700"
      >
        {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      <div className={cn(
        "flex min-h-[6.75rem] items-center border-b border-slate-100 transition-all duration-300",
        isCollapsed ? "justify-center px-2" : "gap-2 p-4"
      )}>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#4285f4,#7c4dff)] text-xs font-bold text-white shadow-sm">
          AT
        </div>
        <div className={cn("min-w-0 overflow-hidden transition-all duration-300", isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>
          <h2 className="whitespace-nowrap text-sm font-bold text-slate-900">Admin Portal</h2>
          <p className="whitespace-nowrap text-[11px] text-slate-500">AURATECH TECHNOLOGY SUPPORT</p>
        </div>
      </div>

      <nav className={cn("space-y-1 transition-all duration-300", isCollapsed ? "p-2" : "p-3")}>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center rounded-lg py-2 text-xs font-medium transition-all",
                isCollapsed ? "justify-center px-2" : "gap-2.5 px-3",
                isActive
                  ? "bg-purple-50 text-purple-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-purple-600" : "text-slate-400")} />
              <span className={cn("overflow-hidden whitespace-nowrap transition-all duration-300", isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={cn("mt-auto border-t border-slate-100 transition-all duration-300", isCollapsed ? "p-2" : "p-4")}>
        <Link
          href="/queue"
          className={cn("flex items-center text-xs text-slate-500 transition-colors hover:text-slate-900", isCollapsed ? "justify-center" : "gap-2")}
          title="Back to Agent Desk"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className={cn("overflow-hidden whitespace-nowrap transition-all duration-300", isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>Back to Agent Desk</span>
        </Link>
      </div>
    </aside>
  );
}
