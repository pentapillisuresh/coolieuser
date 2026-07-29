import { User } from '../../types/user';
import client from './client';

// ─── Response types ──────────────────────────────────────────────

export interface UserResponse {
  success: boolean;
  data: User;
}

export interface UsersListResponse {
  success: boolean;
  data: {
    totalItems: number;
    items: User[];
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

// ─── Self-profile (authenticated user) ──────────────────────────

/** Get the current user's profile */
export const getProfile = (): Promise<UserResponse> =>
  client.get('/users/profile');

/** Update the current user's profile (name, mobile) */
export type UpdatableUserFields = Partial<Pick<User, 'name' | 'mobile' | 'profileImage' | 'email' >>;

export const updateProfile = (data: UpdatableUserFields): Promise<UserResponse> =>
  client.put('/users/profile', data);
/** Change password */
export const changePassword = (data: { oldPassword: string; newPassword: string }): Promise<MessageResponse> =>
  client.put('/users/change-password', data);

// // ─── Admin CRUD operations ──────────────────────────────────────

// /** Get all users (admin only) with pagination and role filter */
// export const getAllUsers = (params?: {
//   page?: number;
//   limit?: number;
//   role?: string;
// }): Promise<UsersListResponse> =>
//   client.get('/users', { params });

// /** Get a specific user by ID (admin only) */
// export const getUserById = (id: number): Promise<UserResponse> =>
//   client.get(`/users/${id}`);

// /** Update a user by ID (admin only) */
// export const updateUser = (
//   id: number,
//   data: { name?: string; mobile?: string; role?: string; isVerified?: boolean }
// ): Promise<UserResponse> =>
//   client.put(`/users/${id}`, data);

// /** Delete a user by ID (admin only) */
// export const deleteUser = (id: number): Promise<MessageResponse> =>
//   client.delete(`/users/${id}`);