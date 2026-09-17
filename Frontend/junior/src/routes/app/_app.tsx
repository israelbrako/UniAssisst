import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { student } from "@/services/mock-data";

export const Route = createFileRoute("/app/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <AppShell
      variant="student"
      user={{ name: student.fullName, initials: student.initials }}
      role="Student"
    >
      <Outlet />
    </AppShell>
  );
}
