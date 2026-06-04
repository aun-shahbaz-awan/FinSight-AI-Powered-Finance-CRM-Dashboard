'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getTransactions } from '@/features/transactions/api';
import { CreateTransactionModal } from '@/features/transactions/components/create-transaction-modal';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', search, type, status],
    queryFn: () =>
      getTransactions({
        search,
        type: type || undefined,
        status: status || undefined,
        page: 1,
        limit: 10,
      }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-semibold">Transactions</h1>
          <p className="text-muted-foreground">
            Manage deposits, withdrawals, approvals, and audit logs.
          </p>
        </div>

        <CreateTransactionModal />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction List</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              placeholder="Search reference, description, client..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              <option value="">All Types</option>
              <option value="DEPOSIT">Deposit</option>
              <option value="WITHDRAWAL">Withdrawal</option>
              <option value="TRANSFER">Transfer</option>
              <option value="ADJUSTMENT">Adjustment</option>
            </select>

            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left">Client</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Reference</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="px-4 py-6" colSpan={6}>
                      Loading transactions...
                    </td>
                  </tr>
                ) : data?.items?.length ? (
                  data.items.map((transaction: any) => (
                    <tr key={transaction.id} className="border-t">
                      <td className="px-4 py-3">
                        {transaction.client.user.firstName}{' '}
                        {transaction.client.user.lastName}
                      </td>

                      <td className="px-4 py-3">{transaction.type}</td>

                      <td className="px-4 py-3">
                        {transaction.currency} {transaction.amount}
                      </td>

                      <td className="px-4 py-3">
                        {transaction.reference || '-'}
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant="outline">{transaction.status}</Badge>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/transactions/${transaction.id}`}
                          className="font-medium text-primary"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-4 py-6 text-muted-foreground"
                      colSpan={6}
                    >
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}