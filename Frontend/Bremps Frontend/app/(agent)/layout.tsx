import React from "react";
import { AgentSidebar } from "@/components/layout/AgentSidebar";

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex min-h-0 overflow-hidden h-[calc(100dvh-3.5rem)]">
      {/* Persistent Left Nav / Agent Switcher */}
      <div className="hidden lg:flex">
        <AgentSidebar />
      </div>

      {/* Main Workspace (Holds the 3-Pane Shell) */}
      <main className="workspace-reveal flex-1 flex flex-col min-w-0 min-h-0 h-full overflow-auto lg:overflow-hidden bg-white">
        {children}
      </main>
    </div>
  );
}
