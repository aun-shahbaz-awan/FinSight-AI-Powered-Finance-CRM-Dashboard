import { apiClient } from '@/features/lib/api-client';

export const getTransactions = async (params?: {
  clientId?: string;
  type?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await apiClient.get('/transactions', { params });
  return response.data;
};

export const getTransactionById = async (id: string) => {
  const response = await apiClient.get(`/transactions/${id}`);
  return response.data;
};

export const createTransaction = async (payload: {
  clientId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'ADJUSTMENT';
  amount: string;
  currency: string;
  reference?: string;
  description?: string;
}) => {
  const response = await apiClient.post('/transactions', payload);
  return response.data;
};

export const reviewTransaction = async (
  id: string,
  payload: {
    status: 'APPROVED' | 'REJECTED';
    rejectionReason?: string;
    note?: string;
  },
) => {
  const response = await apiClient.patch(`/transactions/${id}/review`, payload);
  return response.data;
};

export const completeTransaction = async (
  id: string,
  payload?: {
    note?: string;
  },
) => {
  const response = await apiClient.patch(`/transactions/${id}/complete`, payload);
  return response.data;
};

export const cancelTransaction = async (
  id: string,
  payload?: {
    note?: string;
  },
) => {
  const response = await apiClient.patch(`/transactions/${id}/cancel`, payload);
  return response.data;
};