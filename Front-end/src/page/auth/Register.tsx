import { Link, useNavigate } from "react-router-dom";
import { Button, Divider, Modal, Input, message } from "antd";
import { Facebook, Mail, Lock, User, UserPlus } from "lucide-react";
import { useState } from "react";
import authService from "../../services/auth.service";
import "./Register.css";

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
}

interface VerifyCodeRequest {
  email: string;
  code: string;
}

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const logError = (action: string, error: any, requestData?: any) => {
    console.error(`[Register Component] ${action} Error:`, {
      message: error.message || 'Unknown error',
      status: error.status || 'N/A',
      response: error.error || error.response || 'No response data',
      requestData: requestData || 'N/A',
      stack: error.stack || 'No stack trace',
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      message.error("Mật khẩu và xác nhận mật khẩu không khớp!");
      logError("Register - Password Mismatch", {
        message: "Passwords do not match",
      });
      setLoading(false);
      return;
    }

    const registerData: RegisterRequest = {
      name,
      email,
      password,
      password_confirmation: confirmPassword,
      phone,
    };

    try {
      console.log('[Register Component] Sending Register Request:', registerData);
      const response = await authService.register(registerData);
      console.log('[Register Component] Register Success:', {
        message: response.message,
        data: response,
      });
      message.success(response.message);
      setIsOtpModalVisible(true);
    } catch (error: any) {
      logError("Register - API Call", error, registerData);

      let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';
      if (error.status === 422 && error.error) {
        const errors = Object.values(error.error).flat().join(', ');
        errorMessage = errors || 'Dữ liệu không hợp lệ.';
      } else if (error.status === 500) {
        if (error.message?.includes('Failed to authenticate on SMTP server')) {
          errorMessage = 'Không thể gửi email xác thực. Vui lòng kiểm tra cấu hình email hoặc thử lại sau.';
        } else {
          errorMessage = 'Lỗi hệ thống. Vui lòng liên hệ quản trị viên.';
        }
      }

      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      message.error('Vui lòng nhập mã OTP 6 chữ số!');
      logError('OTP Submit - Invalid OTP', { message: 'OTP must be 6 digits', otp });
      return;
    }

    try {
      console.log('[Register Component] Sending OTP Verification:', { email, otp });
      const verifyResponse = await authService.verifyCode({ email, code: otp });
      console.log('[Register Component] OTP Verification Success:', verifyResponse);

      if (verifyResponse.token) {
        localStorage.setItem('auth_token', verifyResponse.token);
        localStorage.setItem('user_role', 'customer'); // Mặc định vai trò là customer

        message.success(verifyResponse.message);
        setIsOtpModalVisible(false);

        // Tự động đăng nhập và chuyển hướng đến trang user
        console.log('Đăng ký và tự động đăng nhập thành công, chuyển hướng tới: /');
        navigate('/');
      } else {
        throw new Error('Không nhận được token từ phản hồi xác thực OTP');
      }
    } catch (error: any) {
      logError("OTP Submit - API Call", error, { email, otp });
      message.error(error.message || "Xác thực OTP thất bại.");
    }
  };

  const handleResendOtp = async () => {
    try {
      console.log('[Register Component] Sending Resend OTP Request:', { email });
      const response = await authService.resendVerificationEmail(email);
      console.log('[Register Component] Resend OTP Success:', response);
      message.success(response.message);
    } catch (error: any) {
      logError('Resend OTP - API Call', error, { email });
      message.error(error.message || 'Gửi lại OTP thất bại.');
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Đăng ký</h2>

      <div className="social-login-section">
        <Button
          className="social-button google-button"
          type="default"
          size="large"
        >
          <div className="button-content">
            <svg className="google-icon" viewBox="0 0 24 24" width="24" height="24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.60 3.30-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>Đăng ký với Google</span>
          </div>
        </Button>
        <Button
          className="social-button facebook-button"
          type="primary"
          size="large"
        >
          <div className="button-content">
            <Facebook size={24} />
            <span>Đăng ký với Facebook</span>
          </div>
        </Button>
      </div>

      <Divider className="auth-divider" plain>
        Hoặc đăng ký với email
      </Divider>

      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label className="form-label" htmlFor="name">
            Họ và tên
          </label>
          <div className="input-container">
            <User className="input-icon" size={20} />
            <input
              className="form-input"
              type="text"
              id="name"
              placeholder="Nhập họ và tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>

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
          <label className="form-label" htmlFor="password">
            Mật khẩu
          </label>
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

        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">
            Xác nhận mật khẩu
          </label>
          <div className="input-container">
            <Lock className="input-icon" size={20} />
            <input
              className="form-input"
              type="password"
              id="confirmPassword"
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="phone">
            Số điện thoại
          </label>
          <div className="input-container">
            <User className="input-icon" size={20} />
            <input
              className="form-input"
              type="text"
              id="phone"
              placeholder="Nhập số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        </div>

        <Button
          className="register-button"
          type="primary"
          htmlType="submit"
          loading={loading}
          size="large"
        >
          <UserPlus size={20} className="button-icon" />
          Đăng ký
        </Button>
      </form>

      <p className="login-link-container">
        Đã có tài khoản?{" "}
        <Link to="/auth/login" className="login-link">
          Đăng nhập
        </Link>
      </p>

      <Modal
        title="Xác thực OTP"
        open={isOtpModalVisible}
        onOk={handleOtpSubmit}
        onCancel={() => setIsOtpModalVisible(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        footer={[
          <Button key="resend" onClick={handleResendOtp}>
            Gửi lại OTP
          </Button>,
          <Button key="cancel" onClick={() => setIsOtpModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleOtpSubmit}>
            Xác nhận
          </Button>,
        ]}
      >
        <p>Vui lòng nhập mã OTP đã được gửi đến email của bạn:</p>
        <Input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Nhập mã OTP (6 chữ số)"
          maxLength={6}
        />
      </Modal>
    </div>
  );
};

export default Register;
