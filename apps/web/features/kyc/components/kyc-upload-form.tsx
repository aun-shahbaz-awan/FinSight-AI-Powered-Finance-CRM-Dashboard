'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadKycDocument } from '@/features/kyc/api';
import { Button } from '@/components/ui/button';

const documentTypes = [
  'PASSPORT',
  'NATIONAL_ID',
  'DRIVING_LICENSE',
  'PROOF_OF_ADDRESS',
];

export function KycUploadForm({ clientId }: { clientId: string }) {
  const queryClient = useQueryClient();

  const [type, setType] = useState('PASSPORT');
  const [file, setFile] = useState<File | null>(null);

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!file) {
        throw new Error('File is required');
      }

      return uploadKycDocument(clientId, type, file);
    },
    onSuccess: () => {
      setFile(null);
      queryClient.invalidateQueries({
        queryKey: ['client-kyc-documents', clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ['client', clientId],
      });
    },
  });

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <select
          className="rounded-md border bg-background px-3 py-2 text-sm"
          value={type}
          onChange={(event) => setType(event.target.value)}
        >
          {documentTypes.map((item) => (
            <option key={item} value={item}>
              {item.replaceAll('_', ' ')}
            </option>
          ))}
        </select>

        <input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          className="rounded-md border bg-background px-3 py-2 text-sm"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
        />
      </div>

      {uploadMutation.error ? (
        <p className="text-sm text-red-500">
          {(uploadMutation.error as Error).message}
        </p>
      ) : null}

      <Button
        disabled={!file || uploadMutation.isPending}
        onClick={() => uploadMutation.mutate()}
      >
        {uploadMutation.isPending ? 'Uploading...' : 'Upload Document'}
      </Button>
    </div>
  );
}