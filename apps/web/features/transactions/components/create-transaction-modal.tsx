'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTransaction } from '@/features/transactions/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function CreateTransactionModal() {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState('');
  const [type, setType] = useState<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [reference, setReference] = useState('');
  const [description, setDescription] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      createTransaction({
        clientId,
        type,
        amount,
        currency,
        reference,
        description,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setOpen(false);
      setClientId('');
      setAmount('');
      setReference('');
      setDescription('');
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Transaction</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Transaction</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Client ID"
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
          />

          <select
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={type}
            onChange={(event) =>
              setType(event.target.value as 'DEPOSIT' | 'WITHDRAWAL')
            }
          >
            <option value="DEPOSIT">Deposit</option>
            <option value="WITHDRAWAL">Withdrawal</option>
          </select>

          <Input
            placeholder="Amount"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />

          <Input
            placeholder="Currency"
            value={currency}
            onChange={(event) => setCurrency(event.target.value.toUpperCase())}
          />

          <Input
            placeholder="Reference"
            value={reference}
            onChange={(event) => setReference(event.target.value)}
          />

          <Input
            placeholder="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />

          {mutation.error ? (
            <p className="text-sm text-red-500">
              {(mutation.error as Error).message}
            </p>
          ) : null}

          <Button
            className="w-full"
            disabled={!clientId || !amount || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}