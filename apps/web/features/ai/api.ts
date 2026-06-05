import { apiClient } from '@/features/lib/api-client';

export const summarizeTicket = async (ticketId: string) => {
  const response = await apiClient.post(`/ai/tickets/${ticketId}/summary`);
  return response.data;
};

export const generateSupportReply = async (
  ticketId: string,
  payload: {
    tone?: 'professional' | 'friendly' | 'firm';
    instruction?: string;
  },
) => {
  const response = await apiClient.post(`/ai/tickets/${ticketId}/reply`, payload);
  return response.data;
};

export const summarizeClientRisk = async (clientId: string) => {
  const response = await apiClient.post(`/ai/clients/${clientId}/risk-summary`);
  return response.data;
};

export const askDashboardQuestion = async (payload: { question: string }) => {
  const response = await apiClient.post('/ai/dashboard/ask', payload);
  return response.data;
};

export const getMyAiLogs = async () => {
  const response = await apiClient.get('/ai/logs/me');
  return response.data;
};
