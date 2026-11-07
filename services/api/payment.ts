import client from './client';

export const createRazorpayOrder = (cartId: number) =>
  client.post(`/payments/booking/${cartId}/order`);

export const verifyPayment = (
  cartId: number,
  payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }
) => client.post(`/payments/booking/${cartId}/verify`, payload);

export const getPaymentStatus = (bookingId: number) =>
  client.get(`/payments/booking/${bookingId}/status`);

export const getPaymentHistory = (params?: { page?: number; limit?: number; status?: string }) =>
  client.get('/payments/history', { params });

export const getPaymentMethods = () => client.get('/payments/methods');