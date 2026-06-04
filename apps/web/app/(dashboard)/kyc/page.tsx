'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getKycDocuments, reviewKycDocument } from '@/features/kyc/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function KycPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['kyc-documents'],
    queryFn: getKycDocuments,
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      documentId,
      status,
      rejectionReason,
    }: {
      documentId: string;
      status: 'APPROVED' | 'REJECTED';
      rejectionReason?: string;
    }) =>
      reviewKycDocument(documentId, {
        status,
        rejectionReason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-documents'] });
    },
  });

  const handleReject = (documentId: string) => {
    const reason = window.prompt('Enter rejection reason');

    if (!reason) return;

    reviewMutation.mutate({
      documentId,
      status: 'REJECTED',
      rejectionReason: reason,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">KYC Review</h1>
        <p className="text-muted-foreground">
          Review and approve client verification documents.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>KYC Documents</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left">Client</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">File</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="px-4 py-6" colSpan={6}>
                      Loading KYC documents...
                    </td>
                  </tr>
                ) : data?.length ? (
                  data.map((doc: any) => (
                    <tr key={doc.id} className="border-t">
                      <td className="px-4 py-3">
                        {doc.client.user.firstName} {doc.client.user.lastName}
                      </td>

                      <td className="px-4 py-3">
                        {doc.client.user.email}
                      </td>

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

                      <td className="space-x-2 px-4 py-3 text-right">
                        <Button
                          size="sm"
                          disabled={doc.status === 'APPROVED'}
                          onClick={() =>
                            reviewMutation.mutate({
                              documentId: doc.id,
                              status: 'APPROVED',
                            })
                          }
                        >
                          Approve
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={doc.status === 'REJECTED'}
                          onClick={() => handleReject(doc.id)}
                        >
                          Reject
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-4 py-6 text-muted-foreground"
                      colSpan={6}
                    >
                      No KYC documents found.
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