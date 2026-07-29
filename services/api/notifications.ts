import client from './client';

export const getNotifications = (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
  client.get('/notifications', { params });

export const markNotificationRead = (id: number) =>
  client.put(`/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  client.put('/notifications/read-all');

export const deleteNotification = (id: number) =>
  client.delete(`/notifications/${id}`);