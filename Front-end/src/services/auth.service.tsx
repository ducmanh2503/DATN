import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';

// Định nghĩa enum cho type xác thực
enum VerifyType {
  REGISTRATION = 'registration',
  PASSWORD_RESET = 'password_reset',
}

// Interface cho yêu cầu đăng ký
interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
  role?: 'admin' | 'customer';
}

// Interface cho yêu cầu xác thực mã OTP (không còn cần thiết riêng, tích hợp vào ResetPasswordRequest)
interface VerifyCodeRequest {
  email: string;
  code: string;
  type?: VerifyType;
}

// Interface cho yêu cầu đăng nhập
interface LoginRequest {
  email: string;
  password: string;
}

// Interface cho yêu cầu quên mật khẩu
interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordFormData {
  email: string;
  otp: string;
  new_password?: string; // Tùy chọn để hỗ trợ cả xác thực OTP và đặt mật khẩu
  new_password_confirmation?: string; // Tùy chọn
}

// Interface cho phản hồi từ API xác thực
interface AuthResponse {
  message: string;
  token?: string;
  redirect_url?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
    [key: string]: any;
  };
}

// Interface cho phản hồi từ API Google Auth
interface GoogleAuthResponse {
  url: string;
}

// Interface cho lỗi xác thực
interface AuthError {
  error: string | object;
  message?: string;
  status?: number;
}

// Tạo instance của Axios
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Interceptor để gắn token vào mỗi request
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

// Interceptor để xử lý lỗi phản hồi (ví dụ: 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.error('[Auth Service] Unauthorized (api instance) - Redirecting to login');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_role');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Hàm xử lý lỗi từ API
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

// Hàm lưu dữ liệu xác thực vào localStorage
const saveAuthData = (response: AuthResponse): void => {
  console.log('[saveAuthData] Nhận response:', response);
  if (response.token) {
    localStorage.setItem('auth_token', response.token);
    console.log('[saveAuthData] Đã lưu auth_token:', response.token);
    if (response.user?.role) {
      localStorage.setItem('user_role', response.user.role);
      console.log('[saveAuthData] Đã lưu user_role:', response.user.role);
    } else if (response.redirect_url) {
      const role = response.redirect_url === '/admin' ? 'admin' : 'customer';
      localStorage.setItem('user_role', role);
      console.log('[saveAuthData] Đã lưu user_role từ redirect_url:', role);
    }
    console.log('[Auth Service] Auth data saved:', {
      hasToken: !!response.token,
      role: response.user?.role || localStorage.getItem('user_role'),
    });
  } else {
    console.warn('[Auth Service] No token in response to save');
  }
};

// Hàm lấy URL chuyển hướng dựa trên vai trò người dùng
const getRedirectUrlByRole = (): string => {
  const userRole = localStorage.getItem('user_role');
  console.log('[getRedirectUrlByRole] User role từ localStorage:', userRole);
  const redirectUrl = userRole === 'admin' ? '/admin' : '/';
  console.log('[getRedirectUrlByRole] Trả về redirectUrl:', redirectUrl);
  return redirectUrl;
};

// Dịch vụ xác thực
const authService = {
  // Đăng ký người dùng
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      console.log('[Auth Service] Register Request:', { endpoint: `${BASE_URL}/register`, data });
      const response = await api.post<AuthResponse>('/register', data);
      console.log('[Auth Service] Register Response:', { status: response.status, data: response.data });
      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  // Gửi lại email xác thực
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

  // Xác thực mã OTP (sử dụng resetPassword để xử lý)
  async verifyCode(data: VerifyCodeRequest): Promise<AuthResponse> {
    try {
      console.log('[Auth Service] Verify Code Request:', data);
      const params = new URLSearchParams({
        email: data.email,
        code: data.code,
        type: data.type || VerifyType.PASSWORD_RESET,
      }).toString();
      const response = await api.post<AuthResponse>(`/reset-password?${params}`);
      console.log('[Auth Service] Verify Code Response:', response.data);
      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  // Đăng nhập
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('[Auth Service] Login Request:', data);
      const response = await api.post<AuthResponse>('/login', data);
      console.log('[Auth Service] Login Response:', response.data);
      saveAuthData(response.data);
      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  // Quên mật khẩu
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

  // Đặt lại mật khẩu (bao gồm xác thực OTP)
  async resetPassword(data: ResetPasswordFormData): Promise<AuthResponse> {
    try {
      console.log('[Auth Service] Reset Password Request:', {
        email: data.email,
        otp: data.otp,
        hasPassword: !!data.new_password
      });
  
      // Xây dựng query string từ dữ liệu nhập vào
      const queryParams = new URLSearchParams();
      queryParams.append('email', data.email);
      queryParams.append('otp', data.otp);
      
      // Thêm mật khẩu mới nếu được cung cấp
      if (data.new_password) {
        queryParams.append('new_password', data.new_password);
      }
      
      if (data.new_password_confirmation) {
        queryParams.append('new_password_confirmation', data.new_password_confirmation);
      }
  
      const queryString = queryParams.toString();
      console.log('[Auth Service] Reset Password URL:', `/reset-password?${queryString}`);
      
      const response = await api.post<AuthResponse>(`/reset-password?${queryString}`);
      console.log('[Auth Service] Reset Password Response:', response.data);
      
      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  // Đăng xuất
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
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_role');
      throw handleAuthError(error);
    }
  },

  // Lấy URL xác thực Google
  async getGoogleAuthUrl(): Promise<string> {
    try {
      console.log('[Auth Service] Getting Google Auth URL');
      const response = await api.get<GoogleAuthResponse>('/auth/google');
      console.log('[Auth Service] Google Auth URL Response:', response.data);
      return response.data.url;
    } catch (error) {
      console.error('[Auth Service] Error getting Google Auth URL:', error);
      throw handleAuthError(error);
    }
  },

  // Xử lý callback từ Google Auth
  async handleGoogleCallback(code: string): Promise<AuthResponse> {
    try {
      console.log('[Auth Service] Handling Google Callback with code:', code);
      const response = await axios.get<AuthResponse>(`${BASE_URL}/auth/google/callback?code=${code}`);
      console.log('[Auth Service] Google Callback Response:', response.data);
      saveAuthData(response.data);
      return response.data;
    } catch (error) {
      console.error('[Auth Service] Error handling Google callback:', error);
      throw handleAuthError(error);
    }
  },

  // Kiểm tra callback từ Google
  checkForGoogleCallback(): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const source = urlParams.get('source');
    if (code && source === 'google-auth') {
      console.log('[Auth Service] Google auth callback detected with code:', code);
      return true;
    }
    console.log('[Auth Service] Không phát hiện Google callback');
    return false;
  },

  // Xử lý callback từ Google và chuyển hướng
  async processGoogleCallback(): Promise<string> {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    console.log('[Auth Service] processGoogleCallback - Code từ URL:', code);

    if (!code) {
      console.error('[Auth Service] processGoogleCallback - Không tìm thấy code trong URL');
      throw new Error('No authentication code found in URL');
    }

    try {
      const response = await this.handleGoogleCallback(code);
      console.log('[Auth Service] processGoogleCallback - Successfully authenticated with Google:', response);
      saveAuthData(response);
      const redirectUrl = getRedirectUrlByRole();
      console.log('[Auth Service] processGoogleCallback - Redirecting to:', redirectUrl);
      return redirectUrl;
    } catch (error) {
      console.error('[Auth Service] processGoogleCallback - Failed to process Google auth:', error);
      throw handleAuthError(error);
    }
  },

  // Kiểm tra trạng thái xác thực
  isAuthenticated(): boolean {
    const isAuth = !!localStorage.getItem('auth_token');
    console.log('[Auth Service] Is Authenticated:', isAuth);
    return isAuth;
  },

  // Lấy token từ localStorage
  getToken(): string | null {
    const token = localStorage.getItem('auth_token');
    console.log('[Auth Service] Get Token:', token ? 'Token exists' : 'No token');
    return token;
  },

  // Lấy vai trò người dùng từ localStorage
  getRole(): string | null {
    const role = localStorage.getItem('user_role');
    console.log('[Auth Service] Get Role:', role);
    return role;
  },

  // Lấy URL chuyển hướng
  getRedirectUrl(): string {
    return getRedirectUrlByRole();
  },

  // Tạo admin mặc định
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

  // Xác thực admin mặc định
  async verifyDefaultAdmin(otp: string): Promise<AuthResponse> {
    const verifyData: VerifyCodeRequest = {
      email: 'admin@example.com',
      code: otp,
      type: VerifyType.REGISTRATION,
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
export { api, VerifyType };