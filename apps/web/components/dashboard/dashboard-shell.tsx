import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { DashboardTopbar } from '@/components/dashboard/dashboard-topbar';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardSidebar />

      <div className="lg:pl-64">
        <DashboardTopbar />

        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}