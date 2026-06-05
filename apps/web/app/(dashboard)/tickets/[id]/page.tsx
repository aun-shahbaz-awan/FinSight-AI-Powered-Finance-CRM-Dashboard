'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addTicketMessage,
  getTicketById,
  updateTicket,
} from '@/features/tickets/api';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/features/auth/auth-store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = params.id as string;

  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => getTicketById(ticketId),
    enabled: Boolean(ticketId),
  });

  useEffect(() => {
    if (!ticketId || !user?.id) return;

    const socket = getSocket(user.id);

    socket.emit('join-ticket', { ticketId });

    socket.on('ticket:message', () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
    });

    socket.on('ticket:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
    });

    return () => {
      socket.emit('leave-ticket', { ticketId });
      socket.off('ticket:message');
      socket.off('ticket:updated');
    };
  }, [ticketId, user?.id, queryClient]);

  const sendMessageMutation = useMutation({
    mutationFn: () =>
      addTicketMessage(ticketId, {
        message,
        isInternal,
      }),
    onSuccess: () => {
      setMessage('');
      setIsInternal(false);
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) =>
      updateTicket(ticketId, {
        status,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });

  if (isLoading) {
    return <div>Loading ticket...</div>;
  }

  if (!ticket) {
    return <div>Ticket not found.</div>;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">{ticket.subject}</h1>
          <p className="text-muted-foreground">
            Client: {ticket.client.user.firstName} {ticket.client.user.lastName}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-3">
              {ticket.messages?.map((item: any) => (
                <div
                  key={item.id}
                  className={`rounded-lg border p-4 ${
                    item.isInternal ? 'bg-yellow-50' : 'bg-background'
                  }`}
                >
                  <div className="mb-2 flex justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">
                        {item.sender.firstName} {item.sender.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.sender.role}
                      </p>
                    </div>

                    <div className="text-right">
                      {item.isInternal ? (
                        <Badge variant="outline">Internal</Badge>
                      ) : null}

                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm">{item.message}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t pt-4">
              <Textarea
                placeholder="Write a reply..."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(event) => setIsInternal(event.target.checked)}
                />
                Internal note
              </label>

              <Button
                disabled={!message || sendMessageMutation.isPending}
                onClick={() => sendMessageMutation.mutate()}
              >
                {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Ticket Details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge>{ticket.status}</Badge>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Priority</span>
              <Badge variant="outline">{ticket.priority}</Badge>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Assigned To</span>
              <span>
                {ticket.assignedTo
                  ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}`
                  : '-'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Created By</span>
              <span>
                {ticket.createdBy.firstName} {ticket.createdBy.lastName}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update Status</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-2">
            {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => (
              <Button
                key={status}
                variant={ticket.status === status ? 'default' : 'outline'}
                disabled={
                  ticket.status === status || updateStatusMutation.isPending
                }
                onClick={() => updateStatusMutation.mutate(status)}
              >
                {status.replace('_', ' ')}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}