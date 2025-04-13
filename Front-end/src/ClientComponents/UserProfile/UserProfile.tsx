import { useState, useEffect } from "react";
import axios from "axios";
import { Card, Avatar, Tabs } from "antd";
import { UserOutlined, InfoCircleOutlined } from "@ant-design/icons";
import Header from "../../ClientComponents/Header/Header";
import AppFooter from "../../ClientComponents/Footer/footer";
import styles from "./UserProfile.module.css";
import UserInfo from "./UserInfor";
import OrderHistory from "./OrderHistory";
import Promotions from "./Promotions";
import { GET_USER } from "../../config/ApiConfig";
import clsx from "clsx";

// Hàm lấy token từ localStorage
const getAuthToken = (): string | null => localStorage.getItem("auth_token");

// Hàm giải mã token
const decodeToken = (token: string): { exp?: number } | null => {
  if (!token || typeof token !== "string") {
    console.error("Invalid token: Token is null or not a string");
    return null;
  }
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error("Invalid token: Token does not have 3 parts");
      return null;
    }
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

// Hàm tính rank dựa trên số tiền chi tiêu
const getRankFromSpent = (
  spent: number
): { rank: string; color: string; icon: string } => {
  if (!spent || spent <= 500000) {
    return { rank: "Thành viên", color: "#4a4a4a", icon: "👤" };
  } else if (spent <= 2000000) {
    return { rank: "Bạc", color: "#90a4ae", icon: "🐰" };
  } else if (spent <= 5000000) {
    return { rank: "Vàng", color: "#ffca28", icon: "🏆" };
  } else {
    return { rank: "Kim cương", color: "#b388ff", icon: "💎" };
  }
};

// Define User type
interface User {
  name: string;
  email: string;
  phone: string | null;
  birthdate: string | null;
  totalSpent: number;
  role: string;
  points: number;
  avatarUrl?: string;
}

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        console.warn("No token found in localStorage");
        window.location.href = "/login";
        return;
      }

      const decoded = decodeToken(token);
      if (decoded && decoded.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp < currentTime) {
          console.warn("Token has expired");
          localStorage.removeItem("auth_token");
          window.location.href = "/login";
          return;
        }
      }

      const response = await axios.get(GET_USER, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData: User = {
        name: response.data.name,
        email: response.data.email,
        phone: response.data.phone || null,
        birthdate: response.data.birthdate || null,
        totalSpent: parseFloat(response.data.total_spent) || 0,
        role: response.data.role,
        points: parseInt(response.data.points) || 0,
        avatarUrl: response.data.avatar_url || undefined,
      };

      setUser(userData);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu người dùng:", error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("auth_token");
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;

  const { rank, color, icon } = getRankFromSpent(user?.totalSpent || 0);
  const MAX_SPENT = 4000000;
  const progressPercent = user?.totalSpent
    ? Math.min((user.totalSpent / MAX_SPENT) * 100, 100)
    : 0;
  const totalSpent = user?.totalSpent || 0;
  const milestones = [
    { amount: 0, left: "5%", icon: "👤", color: "#4a4a4a" },
    { amount: 2000000, left: "50%", icon: "🐰", color: "#90a4ae" },
    { amount: 3000000, left: "75%", icon: "🏆", color: "#ffca28" },
    { amount: 4000000, left: "95%", icon: "💎", color: "#b388ff" },
  ];

  const tabItems = [
    {
      key: "1",
      label: "Thông Tin Cá Nhân",
      children: <UserInfo user={user} fetchUserData={fetchUserData} />,
    },
    {
      key: "2",
      label: "Lịch Sử Giao Dịch",
      children: <OrderHistory />,
    },
    {
      key: "4",
      label: "Khuyến Mãi Chưa Sử Dụng",
      children: <Promotions />,
    },
    {
      key: "3",
      label: "Thông báo",
      // children: <Promotions />,
    },
  ];

  return (
    <div className={clsx(styles.profileContainer, "main-base")}>
      <Card>
        <div className={clsx(styles.boxAvatar)}>
          <Avatar
            size={120}
            icon={<UserOutlined />}
            className={styles.profileAvatar}
            src={user?.avatarUrl}
          />
        </div>
        <h2 className={styles.profileName}>{user?.name || "N/A"}</h2>
        <p className={styles.profileRank}>
          {user?.role === "admin" ? "Quản trị viên" : `Bậc hiện tại: ${rank}`}
        </p>
        <p className={styles.profilePoints}>
          Điểm tích lũy: {user?.points || 0}
        </p>
        <div className={styles.expenseSection}>
          <div className={styles.expenseHeader}>
            <p className={styles.profileExpenseTitle}>
              Tổng chi tiêu 2025{" "}
              <InfoCircleOutlined className={styles.infoIcon} />
            </p>
            <p className={styles.profileExpenseText}>
              {user?.totalSpent
                ? `${user.totalSpent.toLocaleString()} đ`
                : "0 đ"}
            </p>
          </div>
          <div className={styles.progressWrapper}>
            <div className={styles.progressLine}>
              <div
                className={styles.progressFill}
                style={{ width: `${progressPercent}%` }}
              />
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={styles.milestoneItem}
                  style={{ left: milestone.left }}
                  title={`${milestone.amount.toLocaleString()} đ`}
                >
                  <div
                    className={`${styles.milestoneCircle} ${
                      totalSpent >= milestone.amount
                        ? styles.milestoneCircleActive
                        : ""
                    }`}
                  >
                    <span className={styles.milestoneIcon}>
                      {milestone.icon}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.contactInfo}>
          <p>
            <a href="tel:0989721167">0989721167</a> (08:00 - 22:30)
          </p>

          <p>
            <a href="mailto: movie.forest.host@gmail.com">
              movie.forest.host@gmail.com
            </a>
          </p>

          <p> Cơ Hữu Thông Tin Giúp Đỡ</p>
        </div>
      </Card>

      <Card className={styles.profileContent}>
        <Tabs
          defaultActiveKey="1"
          className={styles.customTabs}
          items={tabItems}
        />
      </Card>
    </div>
  );
};

export default UserProfile;
