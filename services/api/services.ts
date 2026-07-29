import { ServiceSchema } from '../../types/service';
import client from './client';

export const getServices = (params?: { categoryId?: number; isActive?: boolean }) =>
  client.get('/services', { params });

export const getServicesByCategory = (categoryId: number) =>
  client.get(`/services/category/${categoryId}`);

export const getServiceById = (id: number) => client.get(`/services/${id}`);

export const getServiceSchema = (id: number): Promise<ServiceSchema> =>
  client.get(`/services/${id}/schema`);

export const checkServiceAvailability = (
  id: number,
  date: string,
  time: string,
  workers?: boolean
) => client.get(`/services/${id}/availability`, { params: { date, time, workers } });

/**
 * Get top N services by completed booking count
 */
export const getTopServices = (limit: number = 10): Promise<{
  success: boolean;
  data: Array<{
    service: {
      id: number;
      name: string;
      slug: string;
      image: string;
      description: string;
      basePrice: number;
      duration: number;
      Category?: { id: number; name: string; slug: string };
    };
    bookingCount: number;
  }>;
}> =>
  client.get('/services/top', { params: { limit } });