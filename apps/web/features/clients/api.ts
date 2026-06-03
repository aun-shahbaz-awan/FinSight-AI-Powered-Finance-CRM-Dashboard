import { apiClient } from '@/features/lib/api-client';

export type ClientStatus = string;
export type ClientKycStatus = string;

export type ClientUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type ClientNote = {
  id: string;
  content: string;
  author: Pick<ClientUser, 'firstName' | 'lastName'>;
};

export type Client = {
  id: string;
  status: ClientStatus;
  kycStatus: ClientKycStatus;
  phone?: string | null;
  country?: string | null;
  city?: string | null;
  user: ClientUser;
  notes?: ClientNote[];
};

export type ClientListResponse = {
  items: Client[];
  total?: number;
  page?: number;
  limit?: number;
};

export type CreateClientPayload = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone?: string;
  country?: string;
  city?: string;
  status?: string;
  kycStatus?: string;
  assignedToId?: string;
};

export type UpdateClientPayload = Partial<
  Omit<CreateClientPayload, 'email' | 'password'> & {
    email: string;
    password: string;
  }
>;

export const createClient = async (payload: CreateClientPayload) => {
  const response = await apiClient.post('/clients', payload);
  return response.data as Client;
};

export const getClients = async (params?: {
  search?: string;
  status?: string;
  kycStatus?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await apiClient.get('/clients', { params });
  return response.data as ClientListResponse;
};

export const getClientById = async (id: string) => {
  const response = await apiClient.get(`/clients/${id}`);
  return response.data as Client;
};

export const updateClient = async (id: string, payload: UpdateClientPayload) => {
  const response = await apiClient.patch(`/clients/${id}`, payload);
  return response.data as Client;
};

export const addClientNote = async (id: string, content: string) => {
  const response = await apiClient.post(`/clients/${id}/notes`, { content });
  return response.data as ClientNote;
};
