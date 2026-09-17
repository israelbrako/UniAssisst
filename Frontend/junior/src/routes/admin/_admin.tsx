import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/admin/_admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <AppShell
      variant="admin"
      user={{ name: "Ops Manager", initials: "OM" }}
      role="Administrator"
    >
      <Outlet />
    </AppShell>
  );
}
