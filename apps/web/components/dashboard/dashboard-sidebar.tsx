import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  CreditCard,
  Ticket,
  Bot,
  Bell
} from 'lucide-react';

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Clients',
    href: '/clients',
    icon: Users,
  },
  {
    label: 'KYC',
    href: '/kyc',
    icon: ShieldCheck,
  },
  {
    label: 'Transactions',
    href: '/transactions',
    icon: CreditCard,
  },
  {
    label: 'Tickets',
    href: '/tickets',
    icon: Ticket,
  },
  {
    label: 'Notifications',
    href: '/notifications',
    icon: Bell,
  },
  {
    label: 'AI Assistant',
    href: '/ai-assistant',
    icon: Bot,
  },
];

export function DashboardSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-background lg:block">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-lg font-semibold">FinSight AI</h1>
      </div>

      <nav className="space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}