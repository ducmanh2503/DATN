import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const GoogleCallbackHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMounted = useRef(true); // Kiểm tra component có bị unmount không

  useEffect(() => {
    console.log("📌 [Google Callback] Component Mounted");

    const controller = new AbortController(); // Tạo signal để hủy request nếu cần
    const signal = controller.signal;

    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    console.log("🔹 Google Code:", code);

    if (!code) {
      console.error("❌ Không tìm thấy mã xác thực từ Google");
      navigate("/auth/login");
      return;
    }

    axios
      .get(`http://localhost:8000/api/auth/google/callback?code=${code}`, {
        withCredentials: true,
        signal, // Truyền signal để có thể hủy request nếu cần
      })
      .then((response) => {
        if (!response.data || typeof response.data !== "object") {
          throw new Error("❌ Dữ liệu phản hồi không hợp lệ");
        }

        const { auth_token, user } = response.data;
        if (!auth_token) throw new Error("❌ Không nhận được token");

        // Lưu token vào localStorage
        localStorage.setItem("auth_token", auth_token);
        localStorage.setItem("user_role", user?.role || "user");

        console.log("🔐 Token đã lưu:", localStorage.getItem("auth_token"));

        // Dùng setTimeout để tránh lỗi điều hướng sớm
        setTimeout(() => {
          if (isMounted.current) {
            console.log("🚀 Điều hướng tới trang chủ...");
            navigate("/");
          }
        }, 100);
      })
      .catch((error) => {
        if (axios.isCancel(error)) {
          console.log("⚠️ Request bị hủy do component unmount");
        } else {
          console.error(
            "❌ Lỗi khi xử lý callback:",
            error?.response?.data || error.message
          );
          navigate("/auth/login");
        }
      });

    return () => {
      isMounted.current = false;
      controller.abort(); // Hủy request khi component unmount
    };
  }, [location, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <p>🔄 Đang xử lý đăng nhập...</p>
      <div className="spinner"></div> {/* Hiển thị hiệu ứng loading */}
    </div>
  );
};

export default GoogleCallbackHandler;
