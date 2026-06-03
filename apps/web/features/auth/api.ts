import { apiClient } from '@/features/lib/api-client';
import type { AuthSession } from './types';

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};

export const login = async (payload: LoginPayload) => {
  const response = await apiClient.post('/auth/login', payload);
  return response.data as AuthSession;
};

export const register = async (payload: RegisterPayload) => {
  const response = await apiClient.post('/auth/register', payload);
  return response.data;
};

export const logout = async () => {
  const response = await apiClient.post('/auth/logout');
  return response.data;
};

export const refreshSession = async () => {
  const response = await apiClient.post('/auth/refresh');
  return response.data as AuthSession;
};

export const getMe = async () => {
  const response = await apiClient.get('/users/me');
  return response.data;
};
