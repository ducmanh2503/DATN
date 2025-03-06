import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
  role?: 'admin' | 'customer';
}

interface VerifyCodeRequest {
  email: string;
  code: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  email: string;
  otp: string;
  new_password: string;
  new_password_confirmation: string;
}

interface AuthResponse {
  message: string;
  token?: string;
  redirect_url?: string;
}

interface AuthError {
  error: string | object;
  message?: string;
  status?: number;
}

// Create a custom Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor for the custom api instance (optional, can be removed if relying solely on router.tsx)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[Auth Service] Attaching token to api request:', token);
    } else {
      console.log('[Auth Service] No token found for api request');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for the custom api instance
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.error('[Auth Service] Unauthorized (api instance) - Redirecting to login');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_role');
      window.location.href = '/auth/login'; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

const handleAuthError = (error: unknown): AuthError => {
  if (axios.isAxiosError(error) && error.response) {
    const { data, status } = error.response;
    console.error('[Auth Service] API Error:', {
      status,
      responseData: data,
      errorMessage: data.message || 'No message provided',
      errorDetails: data.error || 'No error details',
    });
    return {
      error: data.error || data.message || 'An error occurred',
      message: data.message,
      status,
    };
  }
  console.error('[Auth Service] Unexpected Error:', {
    errorMessage: String(error),
    errorStack: error instanceof Error ? error.stack : 'No stack trace',
  });
  return {
    error: 'Unexpected error occurred',
    message: String(error),
  };
};

const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      console.log('[Auth Service] Register Request:', {
        endpoint: `${BASE_URL}/register`,
        data,
      });
      const response = await api.post<AuthResponse>('/register', data);
      console.log('[Auth Service] Register Response:', {
        status: response.status,
        data: response.data,
      });
      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  async resendVerificationEmail(email: string): Promise<AuthResponse> {
    try {
      console.log('[Auth Service] Resend Verification Request:', { email });
      const response = await api.post<AuthResponse>('/resend-verification', { email });
      console.log('[Auth Service] Resend Verification Response:', response.data);
      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  async verifyCode(data: VerifyCodeRequest): Promise<AuthResponse> {
    try {
      console.log('[Auth Service] Verify Code Request:', data);
      const response = await api.post<AuthResponse>('/verify-code', data);
      console.log('[Auth Service] Verify Code Response:', response.data);
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('[Auth Service] Login Request:', data);
      const response = await api.post<AuthResponse>('/login', data);
      console.log('[Auth Service] Login Response:', response.data);
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user_role', response.data.redirect_url === '/admin' ? 'admin' : 'customer');
      }
      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<AuthResponse> {
    try {
      console.log('[Auth Service] Forgot Password Request:', data);
      const response = await api.post<AuthResponse>('/forgot-password', data);
      console.log('[Auth Service] Forgot Password Response:', response.data);
      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  async resetPassword(data: ResetPasswordRequest): Promise<AuthResponse> {
    try {
      console.log('[Auth Service] Reset Password Request:', data);
      const response = await api.post<AuthResponse>('/reset-password', data);
      console.log('[Auth Service] Reset Password Response:', response.data);
      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  async logout(): Promise<AuthResponse> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No token found');
      console.log('[Auth Service] Logout Request:', { token });
      const response = await api.post<AuthResponse>('/logout', {});
      console.log('[Auth Service] Logout Response:', response.data);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_role');
      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  isAuthenticated(): boolean {
    const isAuth = !!localStorage.getItem('auth_token');
    console.log('[Auth Service] Is Authenticated:', isAuth);
    return isAuth;
  },

  getToken(): string | null {
    const token = localStorage.getItem('auth_token');
    console.log('[Auth Service] Get Token:', token);
    return token;
  },

  getRole(): string | null {
    const role = localStorage.getItem('user_role');
    console.log('[Auth Service] Get Role:', role);
    return role;
  },

  async createDefaultAdmin(): Promise<AuthResponse> {
    const defaultAdminData: RegisterRequest = {
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin123',
      password_confirmation: 'admin123',
      phone: '1234567890',
      role: 'admin',
    };
    try {
      console.log('[Auth Service] Create Default Admin Request:', defaultAdminData);
      const response = await this.register(defaultAdminData);
      console.log('[Auth Service] Create Default Admin Response:', response);
      return response;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  async verifyDefaultAdmin(otp: string): Promise<AuthResponse> {
    const verifyData: VerifyCodeRequest = {
      email: 'admin@example.com',
      code: otp,
    };
    try {
      console.log('[Auth Service] Verify Default Admin Request:', verifyData);
      const response = await this.verifyCode(verifyData);
      console.log('[Auth Service] Verify Default Admin Response:', response);
      return response;
    } catch (error) {
      throw handleAuthError(error);
    }
  },
};

export default authService;
export { api }; // Export the configured Axios instance for optional use