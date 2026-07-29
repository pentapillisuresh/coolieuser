import { User } from '../../types/user';
import client from './client';

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export const sendOTP = (mobile: string,role:string): Promise<{ success: boolean; userId?: number }> =>
  client.post('/auth/send-otp', { mobile,role });

export const verifyOTP = (mobile: string, otp: string,role:string): Promise<AuthResponse> =>
  client.post('/auth/verify-otp', { mobile, otp,role });

export const loginWithPassword = (mobile: string, password: string): Promise<AuthResponse> =>
  client.post('/auth/login', { mobile, password });

export const register = (data: {
  mobile: string;
  name: string;
  password: string;
  role?: string;
  profession?: string;
}): Promise<AuthResponse> => client.post('/auth/register', data);

export const getProfile = (): Promise<{ success: boolean; data: User }> =>
  client.get('/auth/profile');

export const registerDeviceToken = (deviceToken: string, deviceType?: string): Promise<{ success: boolean; message: string }> =>
  client.post('/auth/device-token', { deviceToken, deviceType });

export const logout = (): Promise<{ success: boolean; message: string }> =>
  client.post('/auth/logout');