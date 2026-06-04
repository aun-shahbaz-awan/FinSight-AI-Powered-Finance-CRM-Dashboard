'use client';

import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelTransaction,
  completeTransaction,
  getTransactionById,
  reviewTransaction,
} from '@/features/transactions/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function TransactionDetailPage() {
  const params = useParams();
  const transactionId = params.id as string;

  const queryClient = useQueryClient();

  const { data: transaction, isLoading } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => getTransactionById(transactionId),
    enabled: Boolean(transactionId),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: ['transaction', transactionId],
    });
    queryClient.invalidateQueries({
      queryKey: ['transactions'],
    });
  };

  const approveMutation = useMutation({
    mutationFn: () =>
      reviewTransaction(transactionId, {
        status: 'APPROVED',
        note: 'Approved from dashboard',
      }),
    onSuccess: invalidate,
  });

  const rejectMutation = useMutation({
    mutationFn: (reason: string) =>
      reviewTransaction(transactionId, {
        status: 'REJECTED',
        rejectionReason: reason,
        note: reason,
      }),
    onSuccess: invalidate,
  });

  const completeMutation = useMutation({
    mutationFn: () =>
      completeTransaction(transactionId, {
        note: 'Marked completed from dashboard',
      }),
    onSuccess: invalidate,
  });

  const cancelMutation = useMutation({
    mutationFn: () =>
      cancelTransaction(transactionId, {
        note: 'Cancelled from dashboard',
      }),
    onSuccess: invalidate,
  });

  const handleReject = () => {
    const reason = window.prompt('Enter rejection reason');
    if (!reason) return;
    rejectMutation.mutate(reason);
  };

  if (isLoading) {
    return <div>Loading transaction...</div>;
  }

  if (!transaction) {
    return <div>Transaction not found.</div>;
  }

  const isPending = transaction.status === 'PENDING';
  const isApproved = transaction.status === 'APPROVED';

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-semibold">Transaction Detail</h1>
          <p className="text-muted-foreground">
            {transaction.reference || transaction.id}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            disabled={!isPending || approveMutation.isPending}
            onClick={() => approveMutation.mutate()}
          >
            Approve
          </Button>

          <Button
            variant="destructive"
            disabled={!isPending || rejectMutation.isPending}
            onClick={handleReject}
          >
            Reject
          </Button>

          <Button
            variant="outline"
            disabled={!isApproved || completeMutation.isPending}
            onClick={() => completeMutation.mutate()}
          >
            Complete
          </Button>

          <Button
            variant="secondary"
            disabled={!isPending || cancelMutation.isPending}
            onClick={() => cancelMutation.mutate()}
          >
            Cancel
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Info</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant="outline">{transaction.status}</Badge>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span>{transaction.type}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span>
                {transaction.currency} {transaction.amount}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Reference</span>
              <span>{transaction.reference || '-'}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Description</span>
              <span>{transaction.description || '-'}</span>
            </div>

            {transaction.rejectionReason ? (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Rejection Reason</span>
                <span className="text-right">{transaction.rejectionReason}</span>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span>
                {transaction.client.user.firstName}{' '}
                {transaction.client.user.lastName}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{transaction.client.user.email}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Client Status</span>
              <span>{transaction.client.status}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">KYC Status</span>
              <span>{transaction.client.kycStatus}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit Timeline</CardTitle>
        </CardHeader>

        <CardContent>
          {transaction.auditLogs?.length ? (
            <div className="space-y-4">
              {transaction.auditLogs.map((log: any) => (
                <div key={log.id} className="rounded-lg border p-4">
                  <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                    <div>
                      <p className="font-medium">{log.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {log.fromStatus || '-'} → {log.toStatus || '-'}
                      </p>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {log.note ? (
                    <p className="mt-3 text-sm text-muted-foreground">
                      {log.note}
                    </p>
                  ) : null}

                  <p className="mt-2 text-xs text-muted-foreground">
                    By {log.actor.firstName} {log.actor.lastName}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No audit logs available.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}