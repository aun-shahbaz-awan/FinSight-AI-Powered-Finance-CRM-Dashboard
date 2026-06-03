'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Client, getClients } from '@/features/clients/api';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClientsPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['clients', search],
    queryFn: () =>
      getClients({
        search,
        page: 1,
        limit: 10,
      }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Clients</h1>
        <p className="text-muted-foreground">
          Manage client accounts, KYC status, and activity.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client List</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">KYC</th>
                  <th className="px-4 py-3 text-left">Country</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="px-4 py-6" colSpan={6}>
                      Loading clients...
                    </td>
                  </tr>
                ) : data?.items?.length ? (
                  data.items.map((client: Client) => (
                    <tr key={client.id} className="border-t">
                      <td className="px-4 py-3">
                        {client.user.firstName} {client.user.lastName}
                      </td>
                      <td className="px-4 py-3">{client.user.email}</td>
                      <td className="px-4 py-3">
                        <Badge>{client.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{client.kycStatus}</Badge>
                      </td>
                      <td className="px-4 py-3">{client.country || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/clients/${client.id}`}
                          className="font-medium text-primary"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-6 text-muted-foreground" colSpan={6}>
                      No clients found.
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
