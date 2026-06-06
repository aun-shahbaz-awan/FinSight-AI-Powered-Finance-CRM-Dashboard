import { apiClient } from '@/features/lib/api-client';

export const getMyNotifications = async () => {
  const response = await apiClient.get('/notifications/me');
  return response.data;
};

export const markNotificationAsRead = async (id: string) => {
  const response = await apiClient.patch(`/notifications/${id}/read`);
  return response.data;
};

export const publishPublicNotification = async (payload: {
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}) => {
  const response = await apiClient.post('/notifications/public', payload);
  return response.data;
};