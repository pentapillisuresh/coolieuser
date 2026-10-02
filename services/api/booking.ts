import client from './client';
import { Booking, Job, Payment } from '../../types/work';
import { User } from '../../types/user';

// ─── Response Types ──────────────────────────────────────────────

export interface BookingResponse {
  success: boolean;
  data: Booking;
}

export interface BookingsListResponse {
  success: boolean;
  data: {
    totalItems: number;
    items: Booking[];
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
}

export interface TimelineEvent {
  event: string;
  timestamp: string;
  status?: string;
}

export interface TimelineResponse {
  success: boolean;
  data: TimelineEvent[];
}

export interface AssignJobResponse {
  success: boolean;
  data: Job;
}

export interface ReassignJobResponse {
  success: boolean;
  data: {
    booking: Booking;
    job: Job;
  };
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

// ─── Booking Endpoints ───────────────────────────────────────────

/**
 * Create a new booking (authenticated user)
 */
export const createBooking = (data: {
  serviceId: number;
  details?: Record<string, any>;
  address: string;
  latitude?: number;
  longitude?: number;
  addressId?: number;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:MM
  estimatedArrival?: string;
  specialInstructions?: string;
  totalAmount?: number;
  groupId?: string;
}): Promise<BookingResponse> =>
  client.post('/bookings', data);

export const checkAvailability = (data: {
  serviceId: number;
  address: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:MM
}): Promise<BookingResponse> =>
  client.get('/bookings/checkAvailability', {
    params: data,
  });

/**
 * Get all bookings for the authenticated user (with pagination and status filter)
 */
export const getMyBookings = (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<BookingsListResponse> =>
  client.get('/bookings/my', { params });

/**
 * Get a single booking by ID (full details)
 */
export const getBookingById = (id: number): Promise<BookingResponse> =>
  client.get(`/bookings/${id}`);

/**
 * Update a booking (only pending or postponed)
 * Only certain fields can be updated.
 */
export const updateBooking = (
  id: number,
  data: {
    address?: string;
    scheduledDate?: string;
    scheduledTime?: string;
    specialInstructions?: string;
    details?: Record<string, any>;
    // status is not allowed via this endpoint
  }
): Promise<BookingResponse> =>
  client.put(`/bookings/${id}`, data);

/**
 * Cancel a booking with reason (authenticated user)
 */
export const cancelBooking = (
  id: number,
  reason?: string
): Promise<BookingResponse> =>
  client.put(`/bookings/${id}/cancel`, { reason });

/**
 * Update group for a booking (authenticated user)
 */
export const updateBookingGroup = (id: number, groupId: string): Promise<BookingResponse> =>
  client.put(`/bookings/${id}/group`, { groupId });

/**
 * Get booking timeline (status history)
 */
export const getBookingTimeline = (id: number): Promise<TimelineResponse> =>
  client.get(`/bookings/${id}/timeline`);

// ─── Admin Only ──────────────────────────────────────────────────

/**
 * Admin: Get all bookings with filters and pagination
 */
export const getAllBookings = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  userId?: number;
  serviceId?: number;
  fromDate?: string;
  toDate?: string;
}): Promise<BookingsListResponse> =>
  client.get('/bookings', { params });

/**
 * Admin: Assign a worker to a booking (creates a job)
 */
export const assignWorker = (bookingId: number, workerId: number): Promise<AssignJobResponse> =>
  client.post(`/bookings/${bookingId}/assign`, { workerId });

/**
 * Admin: Reassign a worker for a booking
 */
export const reassignWorker = (bookingId: number, workerId: number): Promise<ReassignJobResponse> =>
  client.put(`/bookings/${bookingId}/reassign`, { workerId });