'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getDashboardOverview } from '@/features/dashboard/api';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

function money(value: string | number) {
  return `$${Number(value || 0).toLocaleString()}`;
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: getDashboardOverview,
  });

  const stats = [
    {
      label: 'Total Clients',
      value: data?.stats?.totalClients ?? 0,
    },
    {
      label: 'Active Clients',
      value: data?.stats?.activeClients ?? 0,
    },
    {
      label: 'Pending KYC',
      value: data?.stats?.pendingKyc ?? 0,
    },
    {
      label: 'Open Tickets',
      value: data?.stats?.openTickets ?? 0,
    },
    {
      label: 'Pending Transactions',
      value: data?.stats?.pendingTransactions ?? 0,
    },
    {
      label: 'Total Deposits',
      value: money(data?.stats?.totalDeposits ?? 0),
    },
    {
      label: 'Total Withdrawals',
      value: money(data?.stats?.totalWithdrawals ?? 0),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">
          Live overview of clients, KYC, transactions, and support activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-3xl font-semibold">
                {isLoading ? '...' : stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Recent Clients</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {data?.recentClients?.length ? (
              data.recentClients.map((client: any) => (
                <Link
                  key={client.id}
                  href={`/clients/${client.id}`}
                  className="block rounded-lg border p-3 hover:bg-muted"
                >
                  <p className="font-medium">
                    {client.user.firstName} {client.user.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {client.user.email}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="outline">{client.status}</Badge>
                    <Badge variant="secondary">{client.kycStatus}</Badge>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No clients found.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {data?.recentTransactions?.length ? (
              data.recentTransactions.map((transaction: any) => (
                <Link
                  key={transaction.id}
                  href={`/transactions/${transaction.id}`}
                  className="block rounded-lg border p-3 hover:bg-muted"
                >
                  <div className="flex justify-between gap-3">
                    <p className="font-medium">{transaction.type}</p>
                    <Badge variant="outline">{transaction.status}</Badge>
                  </div>

                  <p className="mt-1 text-sm">
                    {transaction.currency} {transaction.amount}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {transaction.client.user.firstName}{' '}
                    {transaction.client.user.lastName}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No transactions found.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Tickets</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {data?.recentTickets?.length ? (
              data.recentTickets.map((ticket: any) => (
                <Link
                  key={ticket.id}
                  href={`/tickets/${ticket.id}`}
                  className="block rounded-lg border p-3 hover:bg-muted"
                >
                  <div className="flex justify-between gap-3">
                    <p className="font-medium">{ticket.subject}</p>
                    <Badge>{ticket.status}</Badge>
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {ticket.client.user.firstName}{' '}
                    {ticket.client.user.lastName}
                  </p>

                  <Badge className="mt-2" variant="outline">
                    {ticket.priority}
                  </Badge>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No tickets found.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}