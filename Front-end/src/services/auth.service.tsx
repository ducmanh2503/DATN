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

// Interface cho yêu cầu xác thực mã OTP
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

// Interface cho yêu cầu đặt lại mật khẩu
interface ResetPasswordFormData {
  email: string;
  otp: string;
  new_password?: string;
  new_password_confirmation?: string;
}

// Interface cho phản hồi từ API xác thực
interface AuthResponse {
  message: string;
  token?: string;
  redirect_url?: string;
  role?: string;
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
      console.log('[Auth Service] Đã đính kèm token vào yêu cầu:', token);
    } else {
      console.log('[Auth Service] Không tìm thấy token cho yêu cầu');
    }
    return config;
  },
  (error) => {
    console.error('[Auth Service] Lỗi trong interceptor request:', error);
    return Promise.reject(error);
  }
);

// Interceptor để xử lý lỗi phản hồi (ví dụ: 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.error('[Auth Service] Unauthorized - Chuyển hướng đến trang đăng nhập');
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
    console.error('[Auth Service] Lỗi từ API:', {
      status,
      responseData: data,
      errorMessage: data.message || 'Không có thông báo lỗi',
      errorDetails: data.error || 'Không có chi tiết lỗi',
    });
    return {
      error: data.error || data.message || 'Đã xảy ra lỗi',
      message: data.message,
      status,
    };
  }
  console.error('[Auth Service] Lỗi không mong muốn:', {
    errorMessage: String(error),
    errorStack: error instanceof Error ? error.stack : 'Không có stack trace',
  });
  return {
    error: 'Đã xảy ra lỗi không mong muốn',
    message: String(error),
  };
};

// Hàm lưu dữ liệu xác thực vào localStorage
const saveAuthData = (response: AuthResponse): void => {
  console.log('[saveAuthData] Nhận response:', response);
  if (response.token) {
    localStorage.setItem('auth_token', response.token);
    console.log('[saveAuthData] Đã lưu auth_token:', response.token);
    
    // Lưu role từ user hoặc từ response trực tiếp hoặc từ redirect_url
    if (response.user?.role) {
      localStorage.setItem('user_role', response.user.role);
      console.log('[saveAuthData] Đã lưu user_role từ user:', response.user.role);
    } else if (response.role) {
      localStorage.setItem('user_role', response.role);
      console.log('[saveAuthData] Đã lưu user_role từ response:', response.role);
    } else if (response.redirect_url) {
      const role = response.redirect_url.includes('/admin') ? 'admin' : 'customer';
      localStorage.setItem('user_role', role);
      console.log('[saveAuthData] Đã lưu user_role từ redirect_url:', role);
    }
    
    console.log('[Auth Service] Dữ liệu xác thực đã được lưu:', {
      hasToken: !!response.token,
      role: response.user?.role || response.role || localStorage.getItem('user_role'),
    });
  } else {
    console.warn('[Auth Service] Không có token trong response để lưu');
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
      console.log('[Auth Service] Yêu cầu đăng ký:', { endpoint: `${BASE_URL}/register`, data });
      const response = await api.post<AuthResponse>('/register', data);
      console.log('[Auth Service] Phản hồi đăng ký:', { status: response.status, data: response.data });
      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  // Gửi lại email xác thực
  async resendVerificationEmail(email: string): Promise<AuthResponse> {
    try {
      console.log('[Auth Service] Yêu cầu gửi lại email xác thực:', { email });
      const response = await api.post<AuthResponse>('/resend-verification', { email });
      console.log('[Auth Service] Phản hồi gửi lại email xác thực:', response.data);
      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  // Xác thực mã OTP
  async verifyCode(data: VerifyCodeRequest): Promise<AuthResponse> {
    try {
      console.log('[Auth Service] Yêu cầu xác thực mã OTP:', data);
      const params = new URLSearchParams({
        email: data.email,
        code: data.code,
        type: data.type || VerifyType.PASSWORD_RESET,
      }).toString();
      const response = await api.post<AuthResponse>(`/reset-password?${params}`);
      console.log('[Auth Service] Phản hồi xác thực mã OTP:', response.data);
      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  // Đăng nhập
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('[Auth Service] Yêu cầu đăng nhập:', data);
      const response = await api.post<AuthResponse>('/login', data);
      console.log('[Auth Service] Phản hồi đăng nhập:', response.data);
      saveAuthData(response.data);
      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  // Quên mật khẩu
  async forgotPassword(data: ForgotPasswordRequest): Promise<AuthResponse> {
    try {
      console.log('[Auth Service] Yêu cầu quên mật khẩu:', data);
      const response = await api.post<AuthResponse>('/forgot-password', data);
      console.log('[Auth Service] Phản hồi quên mật khẩu:', response.data);
      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  // Đặt lại mật khẩu (bao gồm xác thực OTP)
  async resetPassword(data: ResetPasswordFormData): Promise<AuthResponse> {
    try {
      console.log('[Auth Service] Yêu cầu đặt lại mật khẩu:', {
        email: data.email,
        otp: data.otp,
        hasPassword: !!data.new_password,
      });

      const queryParams = new URLSearchParams();
      queryParams.append('email', data.email);
      queryParams.append('otp', data.otp);

      if (data.new_password) {
        queryParams.append('new_password', data.new_password);
      }

      if (data.new_password_confirmation) {
        queryParams.append('new_password_confirmation', data.new_password_confirmation);
      }

      const queryString = queryParams.toString();
      console.log('[Auth Service] URL đặt lại mật khẩu:', `/reset-password?${queryString}`);

      const response = await api.post<AuthResponse>(`/reset-password?${queryString}`);
      console.log('[Auth Service] Phản hồi đặt lại mật khẩu:', response.data);

      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  // Đăng xuất
  async logout(): Promise<AuthResponse> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Không tìm thấy token');
      console.log('[Auth Service] Yêu cầu đăng xuất:', { token });
      const response = await api.post<AuthResponse>('/logout', {});
      console.log('[Auth Service] Phản hồi đăng xuất:', response.data);
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
      console.log('[Auth Service] Đang lấy URL xác thực Google');
      const response = await api.get<GoogleAuthResponse>('/auth/google');
      console.log('[Auth Service] Phản hồi URL xác thực Google:', response.data);
      return response.data.url;
    } catch (error) {
      console.error('[Auth Service] Lỗi khi lấy URL xác thực Google:', error);
      throw handleAuthError(error);
    }
  },

  // Xử lý callback từ Google Auth
  async handleGoogleCallback(code: string): Promise<AuthResponse> {
    try {
      console.log('[Auth Service] Đang xử lý callback từ Google với code:', code);
      const response = await axios.get<AuthResponse>(`${BASE_URL}/auth/google/callback?code=${code}`);
      console.log('[Auth Service] Phản hồi callback từ Google:', response.data);
      saveAuthData(response.data);
      return response.data;
    } catch (error) {
      console.error('[Auth Service] Lỗi khi xử lý callback từ Google:', error);
      throw handleAuthError(error);
    }
  },

  // Kiểm tra callback từ Google
  checkForGoogleCallback(): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const source = urlParams.get('source');
    if (code && source === 'google-auth') {
      console.log('[Auth Service] Phát hiện callback từ Google với code:', code);
      return true;
    }
    console.log('[Auth Service] Không phát hiện callback từ Google');
    return false;
  },

  // Xử lý callback từ Google và chuyển hướng
  async processGoogleCallback(): Promise<string> {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    console.log('[Auth Service] processGoogleCallback - Code từ URL:', code);

    if (!code) {
      console.error('[Auth Service] processGoogleCallback - Không tìm thấy code trong URL');
      throw new Error('Không tìm thấy mã xác thực trong URL');
    }

    try {
      const response = await this.handleGoogleCallback(code);
      console.log('[Auth Service] processGoogleCallback - Xác thực thành công với Google:', response);
      saveAuthData(response);
      const redirectUrl = getRedirectUrlByRole();
      console.log('[Auth Service] processGoogleCallback - Chuyển hướng đến:', redirectUrl);
      return redirectUrl;
    } catch (error) {
      console.error('[Auth Service] processGoogleCallback - Xử lý xác thực Google thất bại:', error);
      throw handleAuthError(error);
    }
  },

  // Kiểm tra trạng thái xác thực
  isAuthenticated(): boolean {
    const isAuth = !!localStorage.getItem('auth_token');
    console.log('[Auth Service] Kiểm tra xác thực:', isAuth);
    return isAuth;
  },

  // Lấy token từ localStorage
  getToken(): string | null {
    const token = localStorage.getItem('auth_token');
    console.log('[Auth Service] Lấy token:', token ? 'Có token' : 'Không có token');
    return token;
  },

  // Lấy vai trò người dùng từ localStorage
  getRole(): string | null {
    const role = localStorage.getItem('user_role');
    console.log('[Auth Service] Lấy vai trò:', role);
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
      console.log('[Auth Service] Yêu cầu tạo admin mặc định:', defaultAdminData);
      const response = await this.register(defaultAdminData);
      console.log('[Auth Service] Phản hồi tạo admin mặc định:', response);
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
      console.log('[Auth Service] Yêu cầu xác thực admin mặc định:', verifyData);
      const response = await this.verifyCode(verifyData);
      console.log('[Auth Service] Phản hồi xác thực admin mặc định:', response);
      return response;
    } catch (error) {
      throw handleAuthError(error);
    }
  },
};

export default authService;
export { api, VerifyType };