import { apiClient } from '@/features/lib/api-client';

export const getKycDocuments = async () => {
  const response = await apiClient.get('/kyc');
  return response.data;
};

export const getClientKycDocuments = async (clientId: string) => {
  const response = await apiClient.get(`/kyc/clients/${clientId}/documents`);
  return response.data;
};

export const uploadKycDocument = async (
  clientId: string,
  type: string,
  file: File,
) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post(
    `/kyc/${clientId}/documents/${type}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data;
};

export const reviewKycDocument = async (
  documentId: string,
  payload: {
    status: 'APPROVED' | 'REJECTED';
    rejectionReason?: string;
  },
) => {
  const response = await apiClient.patch(
    `/kyc/documents/${documentId}/review`,
    payload,
  );

  return response.data;
};