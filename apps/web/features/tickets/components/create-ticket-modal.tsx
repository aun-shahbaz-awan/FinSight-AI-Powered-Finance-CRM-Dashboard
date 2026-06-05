'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTicket } from '@/features/tickets/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function CreateTicketModal() {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  const mutation = useMutation({
    mutationFn: () =>
      createTicket({
        clientId,
        subject,
        message,
        priority,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setOpen(false);
      setClientId('');
      setSubject('');
      setMessage('');
      setPriority('MEDIUM');
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Ticket</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Support Ticket</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Client ID"
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
          />

          <Input
            placeholder="Subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          />

          <select
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          <Textarea
            placeholder="Message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />

          <Button
            className="w-full"
            disabled={!clientId || !subject || !message || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? 'Creating...' : 'Create Ticket'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}