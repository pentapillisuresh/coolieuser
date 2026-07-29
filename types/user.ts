export interface User {
  id: number;
  name: string;
  mobile: string;
  email?: string;
  role: 'user' | 'worker' | 'admin';
  isVerified: boolean;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile extends User {
  // Additional fields from backend if needed
}