import { Link, useNavigate } from "react-router-dom";
import { Button, Divider, message } from "antd";
import { Facebook, Mail, Lock, LogIn } from "lucide-react";
import { useState } from "react";
import authService from "../../services/auth.service";
import axios from "axios";
import { AuthResponse } from "../../types/interface";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      message.warning("Vui lòng nhập email và mật khẩu!");
      setLoading(false);
      return;
    }

    try {
      console.log("Đang đăng nhập với:", { email, password });

      // Gửi request đăng nhập
      const response: AuthResponse = await authService.login({
        email,
        password,
      });

      console.log("📡 Phản hồi từ API:", response);

      if (!response?.token) {
        throw new Error("API không trả về token. Vui lòng thử lại!");
      }

      // Lưu token & role vào localStorage
      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("user_role", response.role || "customer");

      // Cấu hình axios để gửi token tự động
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.token}`;

      message.success("Đăng nhập thành công!");

      // Chuyển hướng dựa trên quyền
      response.role === "admin" ? navigate("/admin/film") : navigate("/");
    } catch (error: any) {
      console.error("Lỗi đăng nhập:", error);
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_role");

      message.error(
        error.response?.data?.message ||
          "Đăng nhập thất bại. Vui lòng kiểm tra lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Đăng nhập</h2>

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Email
          </label>
          <div className="input-container">
            <Mail className="input-icon" size={20} />
            <input
              className="form-input"
              type="email"
              id="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <div className="password-header">
            <label className="form-label" htmlFor="password">
              Mật khẩu
            </label>
            <Link to="/forgot-password" className="forgot-password">
              Quên mật khẩu?
            </Link>
          </div>
          <div className="input-container">
            <Lock className="input-icon" size={20} />
            <input
              className="form-input"
              type="password"
              id="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <Button
          className="login-button"
          type="primary"
          htmlType="submit"
          loading={loading}
          size="large"
        >
          <LogIn size={20} className="button-icon" />
          Đăng nhập
        </Button>
      </form>

      <Divider className="auth-divider" plain>
        Hoặc đăng nhập với email
      </Divider>

      <div className="social-login-section">
        <Button
          className="social-button google-button"
          type="default"
          size="large"
        >
          <div className="button-content">
            <svg
              className="google-icon"
              viewBox="0 0 24 24"
              width="24"
              height="24"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.60 3.30-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>Đăng nhập với Google</span>
          </div>
        </Button>

        <Button
          className="social-button facebook-button"
          type="primary"
          size="large"
        >
          <div className="button-content">
            <Facebook size={24} />
            <span>Đăng nhập với Facebook</span>
          </div>
        </Button>
      </div>

      <p className="register-link-container">
        Chưa có tài khoản?{" "}
        <Link to="/auth/register" className="register-link">
          Đăng ký
        </Link>
      </p>
    </div>
  );
};

export default Login;
