"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LifeBuoy,
  Inbox,
  PlusCircle,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (pathname !== "/") return null;

  const closeDrawer = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="w-full px-3 sm:px-5 lg:px-7 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={isOpen}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="flex items-center gap-2 text-slate-900 group">
            <div className="w-8 h-8 rounded-lg bg-[linear-gradient(135deg,#4285f4,#7c4dff_58%,#e9427a)] flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 transition-all group-hover:brightness-95">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-base tracking-tight text-slate-900">AURATECH</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-600">TECHNOLOGY SUPPORT</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={cn(
              "rounded-lg px-3 py-2 text-xs font-semibold transition-colors hover:bg-sky-50 hover:text-sky-700",
              pathname === "/login" ? "bg-sky-50 text-sky-700" : "text-slate-600"
            )}
          >
            Login
          </Link>
          <Link
            href="/signup"
            className={cn(
              "rounded-lg border px-3 py-2 text-xs font-semibold transition-colors hover:bg-slate-50",
              pathname === "/signup"
                ? "border-slate-400 bg-slate-100 text-slate-900"
                : "border-slate-200 text-slate-700"
            )}
          >
            Register
          </Link>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-slate-950/45 transition-opacity duration-300",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={closeDrawer}
        aria-hidden={!isOpen}
      >
        <aside
          className={cn(
            "absolute left-0 top-0 flex h-[100dvh] w-[min(22rem,88vw)] flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-out",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(event) => event.stopPropagation()}
          aria-label="Main navigation"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-sky-700">AURATECH</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">TECHNOLOGY SUPPORT</p>
            </div>
            <button
              type="button"
              onClick={closeDrawer}
              aria-label="Close navigation menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-4 text-sm font-medium">
            <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Explore</p>
            <Link href="/services" className={cn("block rounded-lg px-3 py-2.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900", pathname === "/services" && "bg-sky-50 font-semibold text-sky-700")}>
              Services & Pricing
            </Link>
            <Link href="/about" className={cn("block rounded-lg px-3 py-2.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900", pathname === "/about" && "bg-sky-50 font-semibold text-sky-700")}>
              About Team
            </Link>
            <div className="my-4 border-t border-slate-100" />
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Workspaces</p>
            <Link href="/dashboard" className={cn("block rounded-lg px-3 py-2.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900", pathname.startsWith("/dashboard") && "bg-sky-50 font-semibold text-sky-700")}>
              My Dashboard
            </Link>
            <Link href="/queue" className={cn("flex items-center gap-2 rounded-lg px-3 py-2.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900", (pathname.startsWith("/queue") || pathname.startsWith("/my-tickets")) && "bg-sky-50 font-semibold text-sky-700")}>
              <Inbox className="h-4 w-4" /> Agent 3-Pane Desk
            </Link>
          </nav>

          <div className="shrink-0 border-t border-slate-200 bg-white p-4">
            <Link href="/new-ticket" className="flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-sky-600/20 transition-colors hover:bg-sky-700">
              <PlusCircle className="h-4 w-4" /> New Ticket
            </Link>
          </div>
        </aside>
      </div>

    </header>
  );
}
