import client from './client';

export interface AddressPayload {
  label?: string;
  address: string;
  country?: string;
  latitude: number;
  longitude: number;
  placeId?: string;
  isDefault?: boolean;
}

export const getMyAddresses = (params?: { page?: number; limit?: number }) =>
  client.get('/addresses', { params });

export const getAddressById = (id: number) =>
  client.get(`/addresses/${id}`);

export const createAddress = (data: AddressPayload) =>
  client.post('/addresses', data);

export const updateAddress = (id: number, data: Partial<AddressPayload>) =>
  client.put(`/addresses/${id}`, data);

export const deleteAddress = (id: number) =>
  client.delete(`/addresses/${id}`);

export const setDefaultAddress = (id: number) =>
  client.patch(`/addresses/${id}/default`);