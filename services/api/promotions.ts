import client from './client';

export const getActivePromotions = (params?: { page?: number; limit?: number }) =>
  client.get('/promotions', { params });

export const getPromotionById = (id: number) =>
  client.get(`/promotions/${id}`);

// Admin only
export const getAllPromotions = (params?: { page?: number; limit?: number; isActive?: boolean }) =>
  client.get('/promotions/admin/all', { params });

export const createPromotion = (data: any) =>
  client.post('/promotions', data);

export const updatePromotion = (id: number, data: any) =>
  client.put(`/promotions/${id}`, data);

export const deletePromotion = (id: number) =>
  client.delete(`/promotions/${id}`);