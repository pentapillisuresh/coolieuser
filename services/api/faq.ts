import client from './client';

export const getFAQs = (params?: { category?: string; page?: number; limit?: number }) =>
  client.get('/faq', { params });