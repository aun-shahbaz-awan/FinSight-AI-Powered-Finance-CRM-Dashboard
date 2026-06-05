'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ClientNote, getClientById } from '@/features/clients/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getClientKycDocuments } from '@/features/kyc/api';
import { KycUploadForm } from '@/features/kyc/components/kyc-upload-form';
import { getTransactions } from '@/features/transactions/api';
import { summarizeClientRisk } from '@/features/ai/api';
import { Button } from '@/components/ui/button';
import { AiResponse } from '@/components/ai-response';

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.id as string;

  const [riskSummary, setRiskSummary] = useState('');

  const riskSummaryMutation = useMutation({
    mutationFn: () => summarizeClientRisk(clientId),
    onSuccess: (data) => {
      setRiskSummary(data.riskSummary);
    },
  });

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

  const { data: clientTransactions, isLoading: clientTransactionsLoading } =
    useQuery({
      queryKey: ['client-transactions', clientId],
      queryFn: () =>
        getTransactions({
          clientId,
          page: 1,
          limit: 5,
        }),
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
            <CardTitle>AI Risk Summary</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button
              disabled={riskSummaryMutation.isPending}
              onClick={() => riskSummaryMutation.mutate()}
            >
              {riskSummaryMutation.isPending ? 'Analyzing...' : 'Generate Risk Summary'}
            </Button>

            {riskSummary ? (
              <AiResponse content={riskSummary} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Generate an AI summary based on client KYC, transactions, and ticket history.
              </p>
            )}
          </CardContent>
        </Card>

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

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {clientTransactionsLoading ? (
                    <tr>
                      <td className="px-4 py-6" colSpan={4}>
                        Loading transactions...
                      </td>
                    </tr>
                  ) : clientTransactions?.items?.length ? (
                    clientTransactions.items.map((transaction: any) => (
                      <tr key={transaction.id} className="border-t">
                        <td className="px-4 py-3">{transaction.type}</td>

                        <td className="px-4 py-3">
                          {transaction.currency} {transaction.amount}
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
                        colSpan={4}
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
    </div>
  );
}
