import { useState, useEffect } from "react";
import axios from "axios";
import {
  GET_USER,
  UPDATE_USER_CLIENT,
  CHANGE_PASSWORD,
  Orders_Recent,
  Orders_Confirmed,
  Orders_Search,
  Orders_Details_Client,
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
  message,
  Space,
  Modal,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  InfoCircleOutlined,
  StarFilled,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

// Hàm tính rank dựa trên số tiền chi tiêu
const getRankFromSpent = (
  spent: number
): { rank: string; color: string; icon: string } => {
  if (!spent || spent < 500000) {
    return { rank: "Thành viên", color: "#4a4a4a", icon: "👤" };
  } else if (spent < 2000000) {
    return { rank: "Bạc", color: "#90a4ae", icon: "🐰" };
  } else if (spent < 5000000) {
    return { rank: "Vàng", color: "#ffca28", icon: "🏆" };
  } else {
    return { rank: "Kim cương", color: "#b388ff", icon: "💎" };
  }
};

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

// Hàm xử lý trạng thái
const getStatusLabelAndStyle = (
  status: string
): { label: string; style: string } => {
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

// Hàm để định dạng ngày an toàn
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "N/A";
  const date = dayjs(dateString);
  return date.isValid() ? date.format("DD/MM/YYYY HH:mm") : "N/A";
};

// Define types for user and order data
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

interface Seat {
  booking_detail_id: number;
  seat_name: string;
  price: number;
}

interface Order {
  id: number;
  total_price: number;
  status: string;
  created_at: string;
  show_date?: string;
  movie_title: string;
  movie_poster: string;
  room_name: string;
  seats: Seat[];
  payment_method: string;
  total_ticket_price?: number;
  total_combo_price?: number;
}

interface OrderDetail extends Order {
  combos?: { combo_name: string; quantity: number; price: number }[];
  cinema_name?: string;
}

const UserProfile: React.FC = () => {
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchRecentOrders();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        console.warn("No token found in localStorage");
        message.error("Bạn cần đăng nhập để xem thông tin cá nhân!");
        window.location.href = "/login";
        return;
      }

      console.log("Token:", token);
      const decoded = decodeToken(token);
      console.log("Decoded token:", decoded);

      if (decoded && decoded.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp < currentTime) {
          console.warn("Token has expired");
          message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("auth_token");
          window.location.href = "/login";
          return;
        }
      } else {
        console.warn(
          "Token is invalid or missing exp claim, proceeding with API call"
        );
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
      setEditedUser(userData);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu người dùng:", error);
      if (error.response && error.response.status === 401) {
        message.error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
        localStorage.removeItem("auth_token");
        window.location.href = "/login";
      } else {
        message.error("Không thể tải thông tin người dùng!");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      setOrdersLoading(true);
      const token = getAuthToken();
      if (!token) {
        console.warn("No token found in localStorage");
        message.error("Bạn cần đăng nhập để xem lịch sử giao dịch!");
        window.location.href = "/login";
        return;
      }

      console.log("Token:", token);
      const decoded = decodeToken(token);
      console.log("Decoded token:", decoded);

      if (decoded && decoded.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp < currentTime) {
          console.warn("Token has expired");
          message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("auth_token");
          window.location.href = "/login";
          return;
        }
      } else {
        console.warn(
          "Token is invalid or missing exp claim, proceeding with API call"
        );
      }

      const response = await axios.get(Orders_Recent, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const orders = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      setRecentOrders(orders);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách giao dịch:", error);
      if (error.response && error.response.status === 401) {
        message.error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
        localStorage.removeItem("auth_token");
        window.location.href = "/login";
      } else {
        message.error("Không thể tải lịch sử giao dịch!");
      }
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchConfirmedOrders = async () => {
    try {
      setOrdersLoading(true);
      const token = getAuthToken();
      if (!token) {
        console.warn("No token found in localStorage");
        message.error("Bạn cần đăng nhập để xem lịch sử giao dịch!");
        window.location.href = "/login";
        return;
      }

      console.log("Token:", token);
      const decoded = decodeToken(token);
      console.log("Decoded token:", decoded);

      if (decoded && decoded.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp < currentTime) {
          console.warn("Token has expired");
          message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("auth_token");
          window.location.href = "/login";
          return;
        }
      } else {
        console.warn(
          "Token is invalid or missing exp claim, proceeding with API call"
        );
      }

      const response = await axios.get(Orders_Confirmed, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const orders = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      setRecentOrders(orders);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách giao dịch đã xác nhận:", error);
      if (error.response && error.response.status === 401) {
        message.error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
        localStorage.removeItem("auth_token");
        window.location.href = "/login";
      } else {
        message.error("Không thể tải lịch sử giao dịch đã xác nhận!");
      }
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchSearchOrders = async (query: string) => {
    try {
      setOrdersLoading(true);
      const token = getAuthToken();
      if (!token) {
        console.warn("No token found in localStorage");
        message.error("Bạn cần đăng nhập để tìm kiếm lịch sử giao dịch!");
        window.location.href = "/login";
        return;
      }

      console.log("Token:", token);
      const decoded = decodeToken(token);
      console.log("Decoded token:", decoded);

      if (decoded && decoded.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp < currentTime) {
          console.warn("Token has expired");
          message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("auth_token");
          window.location.href = "/login";
          return;
        }
      } else {
        console.warn(
          "Token is invalid or missing exp claim, proceeding with API call"
        );
      }

      const response = await axios.get(Orders_Search, {
        headers: { Authorization: `Bearer ${token}` },
        params: { query },
      });

      const orders = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      setRecentOrders(orders);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm lịch sử giao dịch:", error);
      if (error.response && error.response.status === 401) {
        message.error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
        localStorage.removeItem("auth_token");
        window.location.href = "/login";
      } else {
        message.error("Không thể tìm kiếm lịch sử giao dịch!");
      }
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId: number) => {
    try {
      setOrdersLoading(true);
      const token = getAuthToken();
      if (!token) {
        message.error("Bạn cần đăng nhập để xem chi tiết giao dịch!");
        window.location.href = "/login";
        return;
      }

      const response = await axios.get(`Orders_Details_Client/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSelectedOrder(response.data.data);
      setIsModalVisible(true);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết giao dịch:", error);
      if (error.response && error.response.status === 401) {
        message.error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
        localStorage.removeItem("auth_token");
        window.location.href = "/login";
      } else {
        message.error("Không thể tải chi tiết giao dịch!");
      }
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

      if (!editedUser) {
        message.error("Không có dữ liệu để cập nhật!");
        return;
      }

      await axios.put(UPDATE_USER_CLIENT, editedUser, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsEditing(false);
      await fetchUserData();
      message.success("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Lỗi cập nhật thông tin:", error);
      if (error.response && error.response.status === 401) {
        message.error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
        localStorage.removeItem("auth_token");
        window.location.href = "/login";
      } else {
        message.error("Lỗi cập nhật thông tin!");
      }
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

    try {
      await axios.post(
        CHANGE_PASSWORD,
        {
          oldPassword: passwordData.oldPassword,
          password: passwordData.password,
          password_confirmation: passwordData.password_confirmation,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success("Đổi mật khẩu thành công!");
      setPasswordData({
        oldPassword: "",
        password: "",
        password_confirmation: "",
      });
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      if (error.response && error.response.status === 401) {
        message.error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
        localStorage.removeItem("auth_token");
        window.location.href = "/login";
      } else {
        message.error("Có lỗi xảy ra khi đổi mật khẩu!");
      }
    }
  };

  const handleUserChange = (field: keyof User, value: any) => {
    setEditedUser((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleShowDetails = (orderId: number) => {
    fetchOrderDetails(orderId);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedOrder(null);
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
      label: "Lịch Sử Giao Dịch",
      children: (
        <>
          <div className={styles.searchSection}>
            <Space>
              <Input
                placeholder="Tìm kiếm giao dịch (mã ID, tên phim...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
                prefix={<SearchOutlined />}
                allowClear
              />
              <Button
                type="primary"
                onClick={() => fetchSearchOrders(searchQuery)}
                disabled={!searchQuery.trim()}
                loading={ordersLoading}
                className={styles.customButton}
              >
                Tìm kiếm
              </Button>
            </Space>
          </div>
          <div className={styles.buttonGroup}>
            <Space>
              <Button
                type="primary"
                onClick={fetchRecentOrders}
                loading={ordersLoading}
                className={styles.customButton}
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
            </Space>
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
                    <th>Ngày chiếu</th>
                    <th>Phim</th>
                    <th>Phòng chiếu</th>
                    <th>Ghế</th>
                    <th>Tổng tiền</th>
                    <th>Phương thức thanh toán</th>
                    <th>Trạng thái</th>
                    <th>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className={styles.transactionRow}>
                      <td>{order.id}</td>
                      <td>{formatDate(order.created_at)}</td>
                      <td>{formatDate(order.show_date)}</td>
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
                          ? order.seats.map((seat) => seat.seat_name).join(", ")
                          : "N/A"}
                      </td>
                      <td>{order.total_price?.toLocaleString() || "0"}đ</td>
                      <td>{order.payment_method || "N/A"}</td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            getStatusLabelAndStyle(order.status).style
                          }`}
                        >
                          {getStatusLabelAndStyle(order.status).label}
                        </span>
                      </td>
                      <td>
                        <Button
                          type="link"
                          onClick={() => handleShowDetails(order.id)}
                        >
                          Xem chi tiết
                        </Button>
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
          <Modal
            title={`Chi tiết giao dịch #${selectedOrder?.id || ""}`}
            visible={isModalVisible}
            onCancel={handleModalClose}
            footer={[
              <Button key="close" onClick={handleModalClose}>
                Đóng
              </Button>,
            ]}
            width={700}
          >
            {selectedOrder ? (
              <div className={styles.orderDetails}>
                <p>
                  <strong>Mã giao dịch:</strong> {selectedOrder.id}
                </p>
                <p>
                  <strong>Ngày đặt:</strong>{" "}
                  {formatDate(selectedOrder.created_at)}
                </p>
                <p>
                  <strong>Ngày chiếu:</strong>{" "}
                  {formatDate(selectedOrder.show_date)}
                </p>
                <p>
                  <strong>Rạp:</strong> {selectedOrder.cinema_name || "N/A"}
                </p>
                <p>
                  <strong>Phòng chiếu:</strong>{" "}
                  {selectedOrder.room_name || "N/A"}
                </p>
                <p>
                  <strong>Phim:</strong> {selectedOrder.movie_title || "N/A"}
                </p>
                <p>
                  <strong>Ghế:</strong>{" "}
                  {selectedOrder.seats?.length > 0
                    ? selectedOrder.seats
                        .map((seat) => seat.seat_name)
                        .join(", ")
                    : "N/A"}
                </p>
                {selectedOrder.combos && selectedOrder.combos.length > 0 && (
                  <div>
                    <strong>Combo:</strong>
                    <ul>
                      {selectedOrder.combos.map((combo, index) => (
                        <li key={index}>
                          {combo.combo_name} x {combo.quantity} -{" "}
                          {(combo.price * combo.quantity).toLocaleString()}đ
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <p>
                  <strong>Tổng tiền vé:</strong>{" "}
                  {selectedOrder.total_ticket_price?.toLocaleString() || "0"}đ
                </p>
                <p>
                  <strong>Tổng tiền combo:</strong>{" "}
                  {selectedOrder.total_combo_price?.toLocaleString() || "0"}đ
                </p>
                <p>
                  <strong>Tổng tiền:</strong>{" "}
                  {selectedOrder.total_price?.toLocaleString() || "0"}đ
                </p>
                <p>
                  <strong>Phương thức thanh toán:</strong>{" "}
                  {selectedOrder.payment_method || "N/A"}
                </p>
                <p>
                  <strong>Trạng thái:</strong>{" "}
                  <span
                    className={`${styles.statusBadge} ${
                      getStatusLabelAndStyle(selectedOrder.status).style
                    }`}
                  >
                    {getStatusLabelAndStyle(selectedOrder.status).label}
                  </span>
                </p>
              </div>
            ) : (
              <p>Đang tải chi tiết...</p>
            )}
          </Modal>
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
              disabled
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
                handleUserChange("birthdate", dateString)
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
              <Space>
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
              </Space>
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
            <p className={styles.profilePoints}>
              <StarFilled /> Điểm: {user?.points || 0}
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
                <div className={styles.milestoneLabels}>
                  {milestones.map((milestone, index) => (
                    <div
                      key={index}
                      className={styles.milestoneLabelWrapper}
                      style={{ left: milestone.left }}
                    >
                      <span className={styles.milestoneLabel}>
                        {milestone.amount.toLocaleString()} đ
                      </span>
                    </div>
                  ))}
                </div>
              </div>
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
