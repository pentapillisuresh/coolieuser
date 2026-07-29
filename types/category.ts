import { Service } from './service';

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  sortOrder?: number;
  isActive: boolean;
  image?: string;
  serviceCount?: number;
  createdAt?: string;
  updatedAt?: string;
  Services?: Service[]; // Add this line
}