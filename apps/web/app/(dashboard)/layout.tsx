import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { ProtectedRoute } from '@/components/dashboard/protected-route';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <DashboardShell>{children}</DashboardShell>
    </ProtectedRoute>
  );
}
