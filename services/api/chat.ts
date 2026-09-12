import client from './client';

export const getMessages = (bookingId: number) =>
  client.get(`/chats/${bookingId}/messages`);

export const sendMessage = (bookingId: number, message: string) =>
  client.post(`/chats/${bookingId}/messages`, { message });