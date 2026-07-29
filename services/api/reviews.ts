import client from './client';

export const createReview = (
  bookingId: number,
  data: { rating: number; comment?: string; images?: string[] }
) => client.post(`/reviews/booking/${bookingId}`, data);

export const getMyReviews = () => client.get('/reviews/my');

export const getWorkerReviews = (workerId: number, params?: { page?: number; limit?: number }) =>
  client.get(`/reviews/worker/${workerId}`, { params });

export const updateReview = (id: number, data: { rating?: number; comment?: string }) =>
  client.put(`/reviews/${id}`, data);

export const deleteReview = (id: number) => client.delete(`/reviews/${id}`);