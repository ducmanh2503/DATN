import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { message } from 'antd';

const GoogleCallbackHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');

    if (code) {
      // Gửi yêu cầu đến endpoint API của server
      axios
        .get(`http://localhost:8000/api/auth/google/callback?code=${code}`, {
          withCredentials: true, // Nếu server yêu cầu cookie hoặc thông tin xác thực
        })
        .then((response) => {
          const { token, user } = response.data;
          // Lưu thông tin vào localStorage
          localStorage.setItem('auth_token', token);
          localStorage.setItem('user_role', user.role);
          message.success('Đăng nhập với Google thành công!');
          // Chuyển hướng dựa trên vai trò người dùng
          const redirectUrl = user.role === 'admin' ? '/admin' : '/';
          navigate(redirectUrl, { replace: true });
        })
        .catch((error) => {
          console.error('Lỗi khi xử lý callback Google:', error);
          message.error('Đăng nhập với Google thất bại. Vui lòng thử lại.');
          navigate('/auth/login', { replace: true });
        });
    } else {
      message.error('Không tìm thấy mã xác thực.');
      navigate('/auth/login', { replace: true });
    }
  }, [location, navigate]);

  return (
    <div>
      <p>Đang xử lý đăng nhập Google...</p>
    </div>
  );
};

export default GoogleCallbackHandler;