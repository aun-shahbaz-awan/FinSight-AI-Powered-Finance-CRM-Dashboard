'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ClientNote, getClientById } from '@/features/clients/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.id as string;

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => getClientById(clientId),
    enabled: Boolean(clientId),
  });

  if (isLoading) {
    return <div>Loading client...</div>;
  }

  if (!client) {
    return <div>Client not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">
          {client.user.firstName} {client.user.lastName}
        </h1>
        <p className="text-muted-foreground">{client.user.email}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge>{client.status}</Badge>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">KYC</span>
              <Badge variant="outline">{client.kycStatus}</Badge>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span>{client.phone || '-'}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Country</span>
              <span>{client.country || '-'}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">City</span>
              <span>{client.city || '-'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Internal Notes</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {client.notes?.length ? (
              client.notes.map((note: ClientNote) => (
                <div key={note.id} className="rounded-lg border p-3 text-sm">
                  <p>{note.content}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    By {note.author.firstName} {note.author.lastName}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No notes yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
