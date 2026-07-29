import client from './client';

export const createBooking = (data: any) => client.post('/bookings', data);

export const getMyBookings = (params?: { status?: string; page?: number; limit?: number }) =>
  client.get('/bookings/my', { params });

export const getAcceptedWorks = () =>
  client.get('/bookings/my', { params: { status: 'accepted' } });

export const getBookingById = (id: number) => client.get(`/bookings/${id}`);

export const updateBooking = (id: number, data: any) =>
  client.put(`/bookings/${id}`, data);

export const cancelBooking = (id: number, reason?: string, details?: string) =>
  client.put(`/bookings/${id}/cancel`, { reason, details });

export const getBookingTimeline = (id: number) =>
  client.get(`/bookings/${id}/timeline`);

// Job endpoints (for worker-specific actions if needed by user)
export const getJobById = (id: number) => client.get(`/jobs/${id}`);