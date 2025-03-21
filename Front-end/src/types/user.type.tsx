export type User = {
  id?: number; // Added id to match the service file usage
  name: string;
  email: string;
  password: string;
  phone: string;
  is_verified: boolean;
  role: string;
  is_deleted?: boolean; // Added to match the service file usage
};

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  users?: T;
  error?: string;
}