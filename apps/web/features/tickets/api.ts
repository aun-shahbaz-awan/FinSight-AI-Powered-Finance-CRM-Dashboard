import { apiClient } from '@/features/lib/api-client';

export const getTickets = async (params?: {
  clientId?: string;
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await apiClient.get('/tickets', { params });
  return response.data;
};

export const getTicketById = async (id: string) => {
  const response = await apiClient.get(`/tickets/${id}`);
  return response.data;
};

export const createTicket = async (payload: {
  clientId: string;
  subject: string;
  message: string;
  priority?: string;
  assignedToId?: string;
}) => {
  const response = await apiClient.post('/tickets', payload);
  return response.data;
};

export const updateTicket = async (
  id: string,
  payload: {
    status?: string;
    priority?: string;
    assignedToId?: string;
  },
) => {
  const response = await apiClient.patch(`/tickets/${id}`, payload);
  return response.data;
};

export const addTicketMessage = async (
  id: string,
  payload: {
    message: string;
    isInternal?: boolean;
  },
) => {
  const response = await apiClient.post(`/tickets/${id}/messages`, payload);
  return response.data;
};