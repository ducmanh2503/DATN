export type User = {
<<<<<<< HEAD
    name: string;
    email: string;
    password: string;
    phone: string;
    is_verified: boolean;
    role: string;
  };
  
  export interface ApiResponse<T> {
    message?: string;
    data?: T;
    users?: T;
    error?: string;
  }
=======
  name: string;
  email: string;
  password: string;
  phone: string;
  is_verified: boolean;
  role: string;
};

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  users?: T;
  error?: string;
}
>>>>>>> main
