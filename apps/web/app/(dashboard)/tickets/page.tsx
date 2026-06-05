'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getTickets } from '@/features/tickets/api';
import { CreateTicketModal } from '@/features/tickets/components/create-ticket-modal';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function TicketsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['tickets', search, status, priority],
    queryFn: () =>
      getTickets({
        search,
        status: status || undefined,
        priority: priority || undefined,
        page: 1,
        limit: 10,
      }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-semibold">Support Tickets</h1>
          <p className="text-muted-foreground">
            Manage client support requests and internal notes.
          </p>
        </div>

        <CreateTicketModal />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ticket List</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              placeholder="Search tickets..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left">Subject</th>
                  <th className="px-4 py-3 text-left">Client</th>
                  <th className="px-4 py-3 text-left">Priority</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="px-4 py-6" colSpan={5}>
                      Loading tickets...
                    </td>
                  </tr>
                ) : data?.items?.length ? (
                  data.items.map((ticket: any) => (
                    <tr key={ticket.id} className="border-t">
                      <td className="px-4 py-3 font-medium">
                        {ticket.subject}
                      </td>

                      <td className="px-4 py-3">
                        {ticket.client.user.firstName}{' '}
                        {ticket.client.user.lastName}
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant="outline">{ticket.priority}</Badge>
                      </td>

                      <td className="px-4 py-3">
                        <Badge>{ticket.status}</Badge>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/tickets/${ticket.id}`}
                          className="font-medium text-primary"
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-4 py-6 text-muted-foreground"
                      colSpan={5}
                    >
                      No tickets found.
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