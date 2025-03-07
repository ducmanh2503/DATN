import axios from "axios";

const BASE_URL = "http://localhost:8000/api";

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
  role?: "admin" | "customer";
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
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
    [key: string]: any;
  };
}

interface GoogleAuthResponse {
  url: string;
}

interface AuthError {
  error: string | object;
  message?: string;
  status?: number;
}

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Bật gửi cookie theo request
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      const isValid = await authService.isAuthenticated();
      if (!isValid) {
        console.warn("[Auth Service] Token hết hạn, chặn request.");
        return Promise.reject({ message: "Token expired" });
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.error(
        "[Auth Service] Unauthorized (api instance) - Redirecting to login"
      );
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_role");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

const handleAuthError = (error: unknown): AuthError => {
  if (axios.isAxiosError(error) && error.response) {
    const { data, status } = error.response;
    console.error("[Auth Service] API Error:", {
      status,
      responseData: data,
      errorMessage: data.message || "No message provided",
      errorDetails: data.error || "No error details",
    });
    return {
      error: data.error || data.message || "An error occurred",
      message: data.message,
      status,
    };
  }
  console.error("[Auth Service] Unexpected Error:", {
    errorMessage: String(error),
    errorStack: error instanceof Error ? error.stack : "No stack trace",
  });
  return {
    error: "Unexpected error occurred",
    message: String(error),
  };
};

const saveAuthData = (response: AuthResponse): void => {
  console.log("[saveAuthData] Nhận response:", response);
  if (response.token) {
    localStorage.setItem("auth_token", response.token);
    console.log("[saveAuthData] Đã lưu auth_token:", response.token);
    if (response.user?.role) {
      localStorage.setItem("user_role", response.user.role);
      console.log("[saveAuthData] Đã lưu user_role:", response.user.role);
    } else if (response.redirect_url) {
      const role = response.redirect_url === "/admin" ? "admin" : "customer";
      localStorage.setItem("user_role", role);
      console.log("[saveAuthData] Đã lưu user_role từ redirect_url:", role);
    }
    console.log("[Auth Service] Auth data saved:", {
      hasToken: !!response.token,
      role: response.user?.role || localStorage.getItem("user_role"),
    });
  } else {
    console.warn("[Auth Service] No token in response to save");
  }
};

const getRedirectUrlByRole = (): string => {
  const userRole = localStorage.getItem("user_role");
  console.log("[getRedirectUrlByRole] User role từ localStorage:", userRole);
  const redirectUrl = userRole === "admin" ? "/admin" : "/";
  console.log("[getRedirectUrlByRole] Trả về redirectUrl:", redirectUrl);
  return redirectUrl;
};

const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      console.log("[Auth Service] Register Request:", {
        endpoint: `${BASE_URL}/register`,
        data,
      });
      const response = await api.post<AuthResponse>("/register", data);
      console.log("[Auth Service] Register Response:", {
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
      console.log("[Auth Service] Resend Verification Request:", { email });
      const response = await api.post<AuthResponse>("/resend-verification", {
        email,
      });
      console.log(
        "[Auth Service] Resend Verification Response:",
        response.data
      );
      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  async verifyCode(data: VerifyCodeRequest): Promise<AuthResponse> {
    try {
      console.log("[Auth Service] Verify Code Request:", data);
      const response = await api.post<AuthResponse>("/verify-code", data);
      console.log("[Auth Service] Verify Code Response:", response.data);
      saveAuthData(response.data);
      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      console.log("[Auth Service] Login Request:", data);
      const response = await api.post<AuthResponse>("/login", data);
      console.log("[Auth Service] Login Response:", response.data);
      saveAuthData(response.data);
      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<AuthResponse> {
    try {
      console.log("[Auth Service] Forgot Password Request:", data);
      const response = await api.post<AuthResponse>("/forgot-password", data);
      console.log("[Auth Service] Forgot Password Response:", response.data);
      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  async resetPassword(data: ResetPasswordRequest): Promise<AuthResponse> {
    try {
      console.log("[Auth Service] Reset Password Request:", data);
      const response = await api.post<AuthResponse>("/reset-password", data);
      console.log("[Auth Service] Reset Password Response:", response.data);
      return response.data;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  async logout(): Promise<AuthResponse> {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("No token found");
      console.log("[Auth Service] Logout Request:", { token });
      const response = await api.post<AuthResponse>("/logout", {});
      console.log("[Auth Service] Logout Response:", response.data);
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_role");
      return response.data;
    } catch (error) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_role");
      throw handleAuthError(error);
    }
  },

  async getGoogleAuthUrl(): Promise<string> {
    try {
      console.log("[Auth Service] Getting Google Auth URL");
      const response = await api.get<GoogleAuthResponse>("/auth/google");
      console.log("[Auth Service] Google Auth URL Response:", response.data);
      return response.data.url;
    } catch (error) {
      console.error("[Auth Service] Error getting Google Auth URL:", error);
      throw handleAuthError(error);
    }
  },

  async handleGoogleCallback(code: string): Promise<AuthResponse> {
    try {
      console.log("[Auth Service] Handling Google Callback with code:", code);
      const response = await axios.get<AuthResponse>(
        `${BASE_URL}/auth/google/callback?code=${code}`
      );
      console.log("[Auth Service] Google Callback Response:", response.data);
      saveAuthData(response.data);
      return response.data;
    } catch (error) {
      console.error("[Auth Service] Error handling Google callback:", error);
      throw handleAuthError(error);
    }
  },

  checkForGoogleCallback(): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const source = urlParams.get("source");
    if (code && source === "google-auth") {
      console.log(
        "[Auth Service] Google auth callback detected with code:",
        code
      );
      return true;
    }
    console.log("[Auth Service] Không phát hiện Google callback");
    return false;
  },

  async processGoogleCallback(): Promise<string> {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    console.log("[Auth Service] processGoogleCallback - Code từ URL:", code);

    if (!code) {
      console.error(
        "[Auth Service] processGoogleCallback - Không tìm thấy code trong URL"
      );
      throw new Error("No authentication code found in URL");
    }

    try {
      const response = await this.handleGoogleCallback(code);
      console.log(
        "[Auth Service] processGoogleCallback - Successfully authenticated with Google:",
        response
      );
      saveAuthData(response); // Gọi lại để chắc chắn token được lưu
      const redirectUrl = getRedirectUrlByRole();
      console.log(
        "[Auth Service] processGoogleCallback - Redirecting to:",
        redirectUrl
      );
      return redirectUrl;
    } catch (error) {
      console.error(
        "[Auth Service] processGoogleCallback - Failed to process Google auth:",
        error
      );
      throw handleAuthError(error);
    }
  },

  isAuthenticated(): boolean {
    const isAuth = !!localStorage.getItem("auth_token");
    console.log("[Auth Service] Is Authenticated:", isAuth);
    return isAuth;
  },

  getToken(): string | null {
    const token = localStorage.getItem("auth_token");
    console.log(
      "[Auth Service] Get Token:",
      token ? "Token exists" : "No token"
    );
    return token;
  },

  getRole(): string | null {
    const role = localStorage.getItem("user_role");
    console.log("[Auth Service] Get Role:", role);
    return role;
  },

  getRedirectUrl(): string {
    return getRedirectUrlByRole();
  },

  async createDefaultAdmin(): Promise<AuthResponse> {
    const defaultAdminData: RegisterRequest = {
      name: "Admin",
      email: "admin@example.com",
      password: "admin123",
      password_confirmation: "admin123",
      phone: "1234567890",
      role: "admin",
    };
    try {
      console.log(
        "[Auth Service] Create Default Admin Request:",
        defaultAdminData
      );
      const response = await this.register(defaultAdminData);
      console.log("[Auth Service] Create Default Admin Response:", response);
      return response;
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  async verifyDefaultAdmin(otp: string): Promise<AuthResponse> {
    const verifyData: VerifyCodeRequest = {
      email: "admin@example.com",
      code: otp,
    };
    try {
      console.log("[Auth Service] Verify Default Admin Request:", verifyData);
      const response = await this.verifyCode(verifyData);
      console.log("[Auth Service] Verify Default Admin Response:", response);
      return response;
    } catch (error) {
      throw handleAuthError(error);
    }
  },
};

export default authService;
export { api };
