import { Service } from './service';
import { User } from './user';

export interface Booking {
  id: number;
  userId: number;
  serviceId: number;
  service?: Service;
  details?: Record<string, any>; // service-specific fields (train number, weight, etc.)
  address: string;
  latitude?: number;
  longitude?: number;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:MM
  estimatedArrival?: string; // ISO datetime
  totalAmount: number;
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'payment-pending' | 'cancelled' | 'postponed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  specialInstructions?: string;
  groupId?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Job {
  id: number;
  bookingId: number;
  booking?: Booking;
  workerId: number;
  worker?: Worker;
  status: 'assigned' | 'arrived' | 'in-progress' | 'completed' | 'cancelled';
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
  confirmationOtp?: string;
  otpExpiry?: string;
  workerLatitude?: number;
  workerLongitude?: number;
  beforePhotos?: string[];
  afterPhotos?: string[];
  notes?: string;
  rating?: number;
  feedback?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Worker {
  id: number;
  userId: number;
  user?: User;
  profession: string;
  experience?: number;
  description?: string;
  isVerified: boolean;
  isAvailable: boolean;
  rating: number;
  totalJobs: number;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Document {
  id: number;
  workerId: number;
  documentType: 'license' | 'certificate' | 'aadhaar' | 'pan' | 'photo' | 'other';
  fileName: string;
  filePath: string;
  mimeType?: string;
  isVerified: boolean;
  uploadedAt: string;
}

export interface BankDetail {
  id: number;
  workerId: number;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName?: string;
  upiId?: string;
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  id: number;
  bookingId: number;
  amount: number;
  currency: string;
  paymentMethod: 'cash' | 'card' | 'upi' | 'wallet' | 'razorpay';
  status: 'pending' | 'success' | 'failed' | 'refunded';
  transactionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  id: number;
  bookingId: number;
  userId: number;
  workerId: number;
  rating: number;
  comment?: string;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}