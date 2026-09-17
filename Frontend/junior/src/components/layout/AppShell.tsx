import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  CreditCard,
  FileStack,
  LayoutDashboard,
  LibraryBig,
  LogOut,
  type LucideIcon,
  Menu,
  MessageSquare,
  Search,
  Settings,
  UserRound,
  Users,
  Wallet,
  BarChart3,
  Wrench,
  Layers,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: LucideIcon };

export const studentNav: NavItem[] = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/requests", label: "Requests", icon: FileStack },
  { to: "/app/messages", label: "Messages", icon: MessageSquare },
  { to: "/app/payments", label: "Payments", icon: CreditCard },
  { to: "/app/resources", label: "Resources", icon: LibraryBig },
  { to: "/app/profile", label: "Profile", icon: UserRound },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

export const adminNav: NavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/requests", label: "Requests", icon: FileStack },
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/payments", label: "Payments", icon: Wallet },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare },
  { to: "/admin/team", label: "Team", icon: UserRound },
  { to: "/admin/services", label: "Services", icon: Layers },
  { to: "/admin/resources", label: "Resources", icon: LibraryBig },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function NavList({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const active = item.to === pathname || (item.to !== "/app" && item.to !== "/admin" && pathname.startsWith(item.to));
        return (
          <li key={item.to}>
            <Link
              to={item.to}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14.5px] font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-mint"
                  : "text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <item.icon className="size-4 shrink-0" aria-hidden />
              <span className="truncate">{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AppShell({
  children,
  variant,
  user,
  role,
}: {
  children: ReactNode;
  variant: "student" | "admin";
  user: { name: string; initials: string };
  role: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = variant === "student" ? studentNav : adminNav;
  const bottomItems = items.slice(0, 4);

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="sticky top-0 hidden h-dvh w-[252px] shrink-0 flex-col bg-sidebar px-4 py-5 lg:flex">
        <Logo tone="dark" />
        <nav className="mt-7 flex-1 overflow-y-auto" aria-label="Main">
          <p className="px-3 pb-2 text-[11px] font-semibold tracking-[0.18em] text-sidebar-foreground/35 uppercase">
            {variant === "student" ? "Workspace" : "Operations"}
          </p>
          <NavList items={items} />
        </nav>
        <div className="mt-4 rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald text-[13px] font-bold text-ink">
              {user.initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-semibold text-sidebar-foreground">{user.name}</p>
              <p className="truncate text-[12px] text-sidebar-foreground/50">{role}</p>
            </div>
          </div>
          <Link
            to="/"
            className="mt-3 flex items-center gap-2 rounded-md px-1 py-1.5 text-[13px] text-sidebar-foreground/60 hover:text-mint"
          >
            <LogOut className="size-3.5" aria-hidden /> Sign out
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur-lg sm:px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open navigation">
                  <Menu className="size-5" aria-hidden />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[268px] border-sidebar-border bg-sidebar p-4">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <Logo tone="dark" />
                <nav className="mt-6" aria-label="Main">
                  <NavList items={items} onNavigate={() => setMobileOpen(false)} />
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <div className="hidden lg:block" />
          <div className="relative min-w-0">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              placeholder="Search requests, messages, resources…"
              aria-label="Search"
              className="h-10 max-w-md pl-9"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
              <Bell className="size-5" aria-hidden />
              <span className="absolute top-2 right-2 size-2 rounded-full bg-emerald" aria-hidden />
            </Button>
            <span className="grid size-9 place-items-center rounded-full bg-ink text-[12.5px] font-bold text-mint">
              {user.initials}
            </span>
          </div>
        </header>

        <main className="flex-1 px-4 pt-6 pb-24 sm:px-6 lg:px-8 lg:pb-10">{children}</main>

        <nav
          aria-label="Quick navigation"
          className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-card/95 backdrop-blur-lg lg:hidden"
        >
          {bottomItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium text-muted-foreground"
              activeProps={{ className: "text-emerald" }}
              activeOptions={{ exact: item.to === "/app" || item.to === "/admin" }}
            >
              <item.icon className="size-5" aria-hidden />
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

export function PageTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 grid grid-cols-[minmax(0,1fr)] gap-4 sm:flex sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-[30px]">{title}</h1>
        {description && <p className="mt-1.5 text-[14.5px] text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export const shellIcons = { Wrench };
