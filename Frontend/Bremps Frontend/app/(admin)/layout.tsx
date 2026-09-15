import React from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex min-h-0 overflow-hidden h-[calc(100dvh-3.5rem)]">
      <div className="hidden lg:flex">
        <AdminSidebar />
      </div>
      <main className="min-w-0 flex-1 overflow-y-auto bg-slate-50/60 p-4 sm:p-6 lg:p-8">
        <div className="content-stagger mx-auto max-w-6xl space-y-6">{children}</div>
      </main>
    </div>
  );
}
