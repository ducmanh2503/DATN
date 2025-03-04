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
  expires_at?: string;
}

interface AuthError {
  error: string | object;
  message?: string;
  status?: number;
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

const handleAuthError = (error: unknown): AuthError => {
  if (axios.isAxiosError(error) && error.response) {
    const { data, status } = error.response;
    console.error('API Error:', data, 'Status:', status);
    return {
      error: data.error || 'An error occurred',
      message: data.message,
      status,
    };
  }
  return {
    error: 'Unexpected error occurred',
    message: String(error),
  };
};

const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      console.log('Register request:', data);
      const response = await api.post<AuthResponse>('/register', data);
      console.log('Register response:', response.data);
      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  async resendVerificationEmail(email: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/resend-verification', { email });
      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  async verifyCode(data: VerifyCodeRequest): Promise<AuthResponse> {
    try {
      console.log('Verify code request:', data);
      const response = await api.post<AuthResponse>('/verify-code', data);
      console.log('Verify code response:', response.data);
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
      console.log('Login request:', data);
      const response = await api.post<AuthResponse>('/login', data);
      console.log('Login response:', response.data);
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/forgot-password', data);
      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  async resetPassword(data: ResetPasswordRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/reset-password', data);
      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  async logout(): Promise<AuthResponse> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No token found');

      const response = await api.post<AuthResponse>('/logout', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem('auth_token');
      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  isAuthenticated(): boolean {
    const isAuth = !!localStorage.getItem('auth_token');
    console.log('Is authenticated:', isAuth);
    return isAuth;
  },

  getToken(): string | null {
    const token = localStorage.getItem('auth_token');
    console.log('Current token:', token);
    return token;
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
      const response = await this.register(defaultAdminData);
      return {
        ...response,
        message: `${response.message} Vui lòng nhập OTP từ email để hoàn tất.`,
      };
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
      const response = await this.verifyCode(verifyData);
      return response;
    } catch (error) {
      throw handleAuthError(error);
    }
  },
};

export default authService;