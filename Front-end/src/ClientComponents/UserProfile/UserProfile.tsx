import { useState, useEffect } from "react";
import axios from "axios";
import {
  GET_USER,
  UPDATE_USER_CLIENT,
  CHANGE_PASSWORD,
  Orders_Recent,
  Orders_Confirmed,
} from "../../config/ApiConfig";
import Header from "../../ClientComponents/Header/Header";
import AppFooter from "../../ClientComponents/Footer/footer";
import styles from "./UserProfile.module.css";
import {
  Card,
  Avatar,
  Button,
  Input,
  Tabs,
  Form,
  DatePicker,
  Progress,
  message,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

// Hàm tính rank dựa trên số tiền chi tiêu (totalSpent)
const getRankFromSpent = (spent: number | undefined) => {
  if (!spent || spent < 500000) {
    return { rank: "Thành viên", color: "#78909c", icon: "👤" };
  } else if (spent < 2000000) {
    return { rank: "Bạc", color: "#90a4ae", icon: "🥈" };
  } else if (spent < 5000000) {
    return { rank: "Vàng", color: "#ffca28", icon: "🥇" };
  } else {
    return { rank: "Kim cương", color: "#b388ff", icon: "💎" };
  }
};

// Hàm lấy token từ localStorage
const getAuthToken = () => localStorage.getItem("auth_token");

// Hàm giải mã token để kiểm tra thời gian hết hạn
const decodeToken = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
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

// Hàm xử lý trạng thái
const getStatusLabelAndStyle = (status: string) => {
  switch (status) {
    case "confirmed":
      return { label: "Đã xác nhận", style: styles.confirmed };
    case "pending":
      return { label: "Đang xử lý", style: styles.pending };
    case "cancelled":
      return { label: "Đã hủy", style: styles.cancelled };
    case "failed":
      return { label: "Thất bại", style: styles.failed };
    default:
      return { label: "Không xác định", style: styles.pending };
  }
};

// Define types for user and order data
interface User {
  name: string;
  email: string;
  phone: string | null;
  birthdate: string | null;
  totalSpent: number;
  role: string;
  avatarUrl?: string;
}

interface Seat {
  booking_detail_id: number;
  seat_name: string;
  price: number;
}

interface Order {
  id: number;
  total_combo_price: number;
  total_price: number;
  status: string;
  created_at: string;
  showtime: string;
  movie_title: string;
  movie_poster: string;
  room_name: string;
  room_type: string;
  seats: Seat[];
}

const UserProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    password: "",
    password_confirmation: "",
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchRecentOrders();
  }, []);

  useEffect(() => {
    console.log("Updated recentOrders:", recentOrders);
  }, [recentOrders]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      console.log("Auth Token for GET_USER:", token);
      if (!token) {
        message.error("Bạn cần đăng nhập để xem thông tin cá nhân!");
        window.location.href = "/login";
        return;
      }

      // Kiểm tra thời gian hết hạn của token
      const decoded = decodeToken(token);
      if (decoded && decoded.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp < currentTime) {
          console.warn("Token has expired!");
          message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("auth_token");
          window.location.href = "/login";
          return;
        }
      }

      const response = await axios
        .get(GET_USER, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .catch((error) => {
          console.error(`Error calling GET_USER API:`, error);
          throw error;
        });

      // Chuyển đổi dữ liệu từ API để khớp với interface User
      const userData: User = {
        name: response.data.name,
        email: response.data.email,
        phone: response.data.phone || null,
        birthdate: response.data.birthdate || null,
        totalSpent: parseFloat(response.data.total_spent) || 0, // Chuyển total_spent từ string sang number
        role: response.data.role,
        avatarUrl: response.data.avatar_url || undefined,
      };

      console.log("Processed user data:", userData); // Kiểm tra dữ liệu đã xử lý
      setUser(userData);
      setEditedUser(userData);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu người dùng:", error);
      if (axios.isAxiosError(error)) {
        console.log("Error response:", error.response); // Kiểm tra lỗi từ API
        if (error.response?.status === 401) {
          message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("auth_token");
          window.location.href = "/login";
          return;
        } else if (error.response?.status === 500) {
          message.error("Lỗi server! Vui lòng thử lại sau.");
          return;
        }
      }
      message.error("Không thể tải thông tin người dùng!");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      setOrdersLoading(true);
      const token = getAuthToken();
      console.log("Auth Token for Orders_Recent:", token);
      if (!token) {
        message.error("Bạn cần đăng nhập để xem lịch sử giao dịch!");
        window.location.href = "/login";
        return;
      }

      const decoded = decodeToken(token);
      if (decoded && decoded.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp < currentTime) {
          console.warn("Token has expired!");
          message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("auth_token");
          window.location.href = "/login";
          return;
        }
      }

      if (!Orders_Recent || typeof Orders_Recent !== "string") {
        throw new Error("Invalid Orders_Recent URL. Please check ApiConfig.");
      }

      const response = await axios
        .get(Orders_Recent, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .catch((error) => {
          console.error(`Error calling Orders_Recent API:`, error);
          throw error;
        });

      console.log("Response Data (Orders_Recent):", response.data.data);

      let orders: Order[] = [];
      if (Array.isArray(response.data.data)) {
        orders = response.data.data;
      } else if (response.data.data && Array.isArray(response.data.orders)) {
        orders = response.data.data.orders;
      } else if (response.data.data && response.data.message) {
        console.warn(
          "API Message (Orders_Recent):",
          response.data.data.message
        );
        if (response.data.data.message === "Unauthenticated.") {
          message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("auth_token");
          window.location.href = "/login";
          return;
        }
        if (Array.isArray(response.data.data.orders)) {
          orders = response.data.data.orders;
        } else {
          orders = [];
          message.info("Hiện tại bạn chưa có giao dịch nào.");
        }
      } else {
        throw new Error(
          `Invalid response format: Expected an array of orders. Received: ${JSON.stringify(
            response.data.data
          )}`
        );
      }

      console.log("Recent orders fetched successfully:", orders);
      setRecentOrders(orders);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách giao dịch:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("auth_token");
          window.location.href = "/login";
          return;
        } else if (error.response?.status === 500) {
          message.error("Lỗi server! Vui lòng thử lại sau.");
          return;
        }
      }
      message.error(
        error instanceof Error
          ? error.message
          : "Không thể tải lịch sử giao dịch! Vui lòng thử lại sau."
      );
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchConfirmedOrders = async () => {
    try {
      setOrdersLoading(true);
      const token = getAuthToken();
      console.log("Auth Token for Orders_Confirmed:", token);
      if (!token) {
        message.error("Bạn cần đăng nhập để xem lịch sử giao dịch!");
        window.location.href = "/login";
        return;
      }

      const decoded = decodeToken(token);
      if (decoded && decoded.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp < currentTime) {
          console.warn("Token has expired!");
          message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("auth_token");
          window.location.href = "/login";
          return;
        }
      }

      if (!Orders_Confirmed || typeof Orders_Confirmed !== "string") {
        throw new Error(
          "Invalid Orders_Confirmed URL. Please check ApiConfig."
        );
      }

      const response = await axios
        .get(Orders_Confirmed, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .catch((error) => {
          console.error(`Error calling Orders_Confirmed API:`, error);
          throw error;
        });

      console.log("API Response (Orders_Confirmed):", response);
      console.log("Response Data (Orders_Confirmed):", response.data.data);

      let orders: Order[] = [];
      if (Array.isArray(response.data.data)) {
        orders = response.data.data;
      } else if (
        response.data.data &&
        Array.isArray(response.data.data.orders)
      ) {
        orders = response.data.data.orders;
      } else if (response.data.data && response.data.data.message) {
        console.warn(
          "API Message (Orders_Confirmed):",
          response.data.data.message
        );
        if (response.data.data.message === "Unauthenticated.") {
          message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("auth_token");
          window.location.href = "/login";
          return;
        }
        if (Array.isArray(response.data.data.orders)) {
          orders = response.data.data.orders;
        } else {
          orders = [];
          message.info("Hiện tại bạn chưa có giao dịch đã xác nhận nào.");
        }
      } else {
        throw new Error(
          `Invalid response format: Expected an array of orders. Received: ${JSON.stringify(
            response.data.data
          )}`
        );
      }

      console.log("Confirmed orders fetched successfully:", orders);
      setRecentOrders(orders);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách giao dịch đã xác nhận:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("auth_token");
          window.location.href = "/login";
          return;
        } else if (error.response?.status === 500) {
          message.error("Lỗi server! Vui lòng thử lại sau.");
          return;
        }
      }
      message.error(
        error instanceof Error
          ? error.message
          : "Không thể tải lịch sử giao dịch đã xác nhận! Vui lòng thử lại sau."
      );
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleEditClick = () => setIsEditing(true);

  const handleSaveClick = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        message.error("Bạn cần đăng nhập để cập nhật thông tin!");
        window.location.href = "/login";
        return;
      }

      const decoded = decodeToken(token);
      if (decoded && decoded.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp < currentTime) {
          console.warn("Token has expired!");
          message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("auth_token");
          window.location.href = "/login";
          return;
        }
      }

      await axios
        .put(UPDATE_USER_CLIENT, editedUser, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .catch((error) => {
          console.error(`Error calling UPDATE_USER_CLIENT API:`, error);
          throw error;
        });

      setIsEditing(false);
      await fetchUserData();
      message.success("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Lỗi cập nhật thông tin:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("auth_token");
          window.location.href = "/login";
          return;
        } else if (error.response?.status === 500) {
          message.error("Lỗi server! Vui lòng thử lại sau.");
          return;
        }
      }
      message.error("Lỗi cập nhật thông tin!");
    }
  };

  const handleChangePassword = async () => {
    if (
      !passwordData.oldPassword ||
      !passwordData.password ||
      !passwordData.password_confirmation
    ) {
      message.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (passwordData.password !== passwordData.password_confirmation) {
      message.error("Mật khẩu mới không khớp!");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      message.error("Bạn cần đăng nhập để đổi mật khẩu!");
      window.location.href = "/login";
      return;
    }

    const decoded = decodeToken(token);
    if (decoded && decoded.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp < currentTime) {
        console.warn("Token has expired!");
        message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("auth_token");
        window.location.href = "/login";
        return;
      }
    }

    try {
      await axios
        .post(
          CHANGE_PASSWORD,
          {
            oldPassword: passwordData.oldPassword,
            password: passwordData.password,
            password_confirmation: passwordData.password_confirmation,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .catch((error) => {
          console.error(`Error calling CHANGE_PASSWORD API:`, error);
          throw error;
        });

      message.success("Đổi mật khẩu thành công!");
      setPasswordData({
        oldPassword: "",
        password: "",
        password_confirmation: "",
      });
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("auth_token");
          window.location.href = "/login";
          return;
        } else if (error.response?.status === 500) {
          message.error("Lỗi server! Vui lòng thử lại sau.");
          return;
        }
      }
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi đổi mật khẩu!";
      message.error(errorMessage);
    }
  };

  const handleUserChange = (field: keyof User, value: string) => {
    setEditedUser((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;

  const { rank, color, icon } = getRankFromSpent(user?.totalSpent);

  const MAX_SPENT = 4000000;

  const progressMarks = {
    0: "0đ",
    50: "2,000,000đ",
    100: "4,000,000đ",
  };

  // Define tab items
  const tabItems = [
    {
      key: "1",
      label: "Lịch Sử Giao Dịch",
      children: (
        <>
          <div style={{ marginBottom: 16, textAlign: "right" }}>
            <Button
              type="primary"
              onClick={fetchRecentOrders}
              loading={ordersLoading}
              className={styles.customButton}
              style={{ marginRight: 8 }}
            >
              Giao dịch gần đây
            </Button>
            <Button
              type="primary"
              onClick={fetchConfirmedOrders}
              loading={ordersLoading}
              className={styles.customButton}
            >
              Giao dịch đã xác nhận
            </Button>
          </div>
          {ordersLoading ? (
            <div className={styles.loading}>Đang tải lịch sử giao dịch...</div>
          ) : recentOrders.length > 0 ? (
            <div className={styles.ordersTable}>
              <table className={styles.transactionTable}>
                <thead>
                  <tr>
                    <th>Mã ID</th>
                    <th>Ngày đặt</th>
                    <th>Phim</th>
                    <th>Phòng chiếu</th>
                    <th>Ghế</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className={styles.transactionRow}>
                      <td>{order.id}</td>
                      <td>
                        {order.created_at
                          ? (() => {
                              try {
                                const parsedDate = dayjs(
                                  order.created_at,
                                  "DD-MM-YYYY HH:mm:ss"
                                );
                                if (!parsedDate.isValid()) {
                                  console.error(
                                    "Invalid date format for created_at:",
                                    order.created_at
                                  );
                                  return "N/A";
                                }
                                return parsedDate.format("DD/MM/YYYY HH:mm");
                              } catch (error) {
                                console.error(
                                  "Error parsing created_at:",
                                  error
                                );
                                return "N/A";
                              }
                            })()
                          : "N/A"}
                      </td>
                      <td className={styles.movieCell}>
                        {order.movie_poster ? (
                          <img
                            src={order.movie_poster}
                            alt={order.movie_title || "Movie Poster"}
                            className={styles.moviePoster}
                          />
                        ) : (
                          <div className={styles.noPoster}>No Image</div>
                        )}
                        <span>{order.movie_title || "N/A"}</span>
                      </td>
                      <td>{order.room_name || "N/A"}</td>
                      <td>
                        {order.seats?.length > 0
                          ? [
                              ...new Set(
                                order.seats.map((seat) => seat.seat_name)
                              ),
                            ].join(", ")
                          : "N/A"}
                      </td>
                      <td>{order.total_price?.toLocaleString() || "0"}đ</td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            getStatusLabelAndStyle(order.status).style
                          }`}
                        >
                          {getStatusLabelAndStyle(order.status).label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.emptyContent}>
              <p>Chưa có dữ liệu giao dịch nào.</p>
              <Button
                type="primary"
                onClick={fetchRecentOrders}
                className={styles.customButton}
              >
                Thử lại
              </Button>
            </div>
          )}
        </>
      ),
    },
    {
      key: "2",
      label: "Thông Tin Cá Nhân",
      children: (
        <Form layout="vertical" className={styles.profileForm}>
          <Form.Item label="Họ và tên">
            <Input
              prefix={<UserOutlined />}
              value={editedUser?.name || ""}
              disabled={!isEditing}
              className={styles.customInput}
              onChange={(e) => handleUserChange("name", e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Email">
            <Input
              prefix={<MailOutlined />}
              value={editedUser?.email || ""}
              disabled={!isEditing}
              className={styles.customInput}
            />
          </Form.Item>
          <Form.Item label="Ngày sinh">
            <DatePicker
              value={editedUser?.birthdate ? dayjs(editedUser.birthdate) : null}
              disabled={!isEditing}
              format="DD/MM/YYYY"
              style={{ width: "100%" }}
              className={styles.customInput}
              onChange={(date, dateString) =>
                handleUserChange("birthdate", dateString as string)
              }
            />
          </Form.Item>
          <Form.Item label="Số điện thoại">
            <Input
              prefix={<PhoneOutlined />}
              value={editedUser?.phone || ""}
              disabled={!isEditing}
              className={styles.customInput}
              onChange={(e) => handleUserChange("phone", e.target.value)}
            />
          </Form.Item>
          <div className={styles.profileButtons}>
            {isEditing ? (
              <>
                <Button
                  type="primary"
                  onClick={handleSaveClick}
                  className={styles.customButton}
                >
                  Cập nhật
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  className={styles.customButton}
                >
                  Hủy
                </Button>
              </>
            ) : (
              <Button
                type="primary"
                onClick={handleEditClick}
                className={styles.customButton}
              >
                Chỉnh sửa
              </Button>
            )}
          </div>
        </Form>
      ),
    },
    ...(user?.role !== "admin"
      ? [
          {
            key: "3",
            label: "Đổi Mật Khẩu",
            children: (
              <Form layout="vertical" className={styles.profileForm}>
                <Form.Item label="Mật khẩu cũ">
                  <Input.Password
                    prefix={<LockOutlined />}
                    value={passwordData.oldPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        oldPassword: e.target.value,
                      }))
                    }
                    className={styles.customInput}
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                  />
                </Form.Item>
                <Form.Item label="Mật khẩu mới">
                  <Input.Password
                    prefix={<LockOutlined />}
                    value={passwordData.password}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className={styles.customInput}
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                  />
                </Form.Item>
                <Form.Item label="Xác nhận mật khẩu mới">
                  <Input.Password
                    prefix={<LockOutlined />}
                    value={passwordData.password_confirmation}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        password_confirmation: e.target.value,
                      }))
                    }
                    className={styles.customInput}
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                  />
                </Form.Item>
                <Button
                  type="primary"
                  onClick={handleChangePassword}
                  className={styles.customButton}
                >
                  Đổi mật khẩu
                </Button>
              </Form>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.profileContainer}>
        <div className={styles.profileWrapper}>
          <Card className={styles.profileSidebar}>
            <Avatar
              size={120}
              icon={<UserOutlined />}
              className={styles.profileAvatar}
              src={user?.avatarUrl}
            />
            <h2 className={styles.profileName}>{user?.name || "N/A"}</h2>
            <p className={styles.profileRank}>
              {icon} {user?.role === "admin" ? "Quản trị viên" : rank}
            </p>

            <div className={styles.expenseSection}>
              <p className={styles.profileExpenseTitle}>Tổng chi tiêu 2025</p>
              <p className={styles.profileExpenseText}>
                {user?.totalSpent
                  ? `${user.totalSpent.toLocaleString()}đ`
                  : "0đ"}
              </p>

              <Progress
                percent={
                  user?.totalSpent ? (user.totalSpent / MAX_SPENT) * 100 : 0
                }
                strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }}
                trailColor="#e6f7ff"
                size={12}
                className={styles.customProgress}
                showInfo={false}
                marks={progressMarks}
              />
            </div>

            <div className={styles.contactInfo}>
              <p>
                📞 <a href="tel:19002224">19002224</a> (800 - 22:30)
              </p>
              <p>
                📧{" "}
                <a href="mailto:hotro@galaxystudio.vn">hotro@galaxystudio.vn</a>
              </p>
              <p>🖱️ Cơ Hữu Thông Tin Giúp Đỡ</p>
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
      </div>
      <AppFooter />
    </div>
  );
};

export default UserProfile;
