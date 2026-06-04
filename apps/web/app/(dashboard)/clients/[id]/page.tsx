'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ClientNote, getClientById } from '@/features/clients/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getClientKycDocuments } from '@/features/kyc/api';
import { KycUploadForm } from '@/features/kyc/components/kyc-upload-form';

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.id as string;

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => getClientById(clientId),
    enabled: Boolean(clientId),
  });

  const { data: documents, isLoading: documentsLoading } = useQuery({
    queryKey: ['client-kyc-documents', clientId],
    queryFn: () => getClientKycDocuments(clientId),
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

        <Card>
          <CardHeader>
            <CardTitle>KYC Documents</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <KycUploadForm clientId={clientId} />

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">File</th>
                    <th className="px-4 py-3 text-left">Reason</th>
                  </tr>
                </thead>

                <tbody>
                  {documentsLoading ? (
                    <tr>
                      <td className="px-4 py-6" colSpan={4}>
                        Loading documents...
                      </td>
                    </tr>
                  ) : documents?.length ? (
                    documents.map((doc: any) => (
                      <tr key={doc.id} className="border-t">
                        <td className="px-4 py-3">{doc.type}</td>

                        <td className="px-4 py-3">
                          <Badge variant="outline">{doc.status}</Badge>
                        </td>

                        <td className="px-4 py-3">
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_BASE_URL}${doc.fileUrl}`}
                            target="_blank"
                            className="font-medium text-primary"
                          >
                            View File
                          </a>
                        </td>

                        <td className="px-4 py-3">
                          {doc.rejectionReason || '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="px-4 py-6 text-muted-foreground"
                        colSpan={4}
                      >
                        No KYC documents uploaded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
