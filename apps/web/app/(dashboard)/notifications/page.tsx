'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/features/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

async function publishPublicNotification(payload: {
  title: string;
  message: string;
}) {
  const response = await apiClient.post('/notifications/public', {
    title: payload.title,
    message: payload.message,
    metadata: {
      scope: 'all_users',
    },
  });

  return response.data;
}

export default function NotificationsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const mutation = useMutation({
    mutationFn: publishPublicNotification,
    onSuccess: () => {
      setTitle('');
      setMessage('');
    },
  });

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Notifications</h1>
        <p className="text-muted-foreground">
          Publish system-wide announcements to all users.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Publish Public Notification</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            placeholder="Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <Textarea
            placeholder="Message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={5}
          />

          {mutation.isSuccess ? (
            <p className="text-sm text-green-600">
              Notification published successfully.
            </p>
          ) : null}

          {mutation.error ? (
            <p className="text-sm text-red-500">
              Failed to publish notification.
            </p>
          ) : null}

          <Button
            disabled={!title || !message || mutation.isPending}
            onClick={() =>
              mutation.mutate({
                title,
                message,
              })
            }
          >
            {mutation.isPending ? 'Publishing...' : 'Publish Notification'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}