import { useState, useEffect } from "react";
import axios from "axios";
import {
  GET_USER,
  UPDATE_USER_CLIENT,
  CHANGE_PASSWORD,
  Orders_Recent,
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

// Hàm tính rank dựa trên số tiền chi tiêu (totalSpent)
const getRankFromSpent = (spent) => {
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

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    password: "",
    password_confirmation: "",
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchRecentOrders();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await axios.get(GET_USER, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
      setEditedUser(response.data);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu người dùng:", error);
      message.error("Không thể tải thông tin người dùng!");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      setOrdersLoading(true);
      const token = getAuthToken();
      const response = await axios.get(Orders_Recent, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Đảm bảo dữ liệu trả về là mảng
      setRecentOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách giao dịch:", error);
      message.error("Không thể tải lịch sử giao dịch!");
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleEditClick = () => setIsEditing(true);

  const handleSaveClick = async () => {
    try {
      const token = getAuthToken();
      await axios.put(UPDATE_USER_CLIENT, editedUser, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setIsEditing(false);
      await fetchUserData();
      message.success("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Lỗi cập nhật thông tin:", error);
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
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi đổi mật khẩu!";
      message.error(errorMessage);
      console.error("Lỗi đổi mật khẩu:", error);
    }
  };

  const handleUserChange = (field, value) => {
    setEditedUser((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;

  const { rank, color, icon } = getRankFromSpent(user?.totalSpent);

  // Định nghĩa mức tối đa cho thanh progress (5 triệu VND để khớp với rank Kim cương)
  const MAX_SPENT = 5000000;

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
            <h2 className={styles.profileName}>{user?.name}</h2>
            <p className={styles.profileRank}>
              {icon} {user?.role === "admin" ? "Quản trị viên" : rank}
            </p>
            <p className={styles.profileRole}>
              <UserOutlined /> Thành viên
            </p>

            <div className={styles.expenseSection}>
              <p className={styles.profileExpenseTitle}>Tổng chi tiêu 2025</p>
              <p className={styles.profileExpenseText}>
                {user?.totalSpent
                  ? `${user.totalSpent.toLocaleString()} VND`
                  : "Chưa có chi tiêu"}
              </p>

              {/* Thanh progress dựa trên totalSpent */}
              <Progress
                percent={
                  user?.totalSpent ? (user.totalSpent / MAX_SPENT) * 100 : 0
                }
                strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }}
                trailColor="#e6f7ff"
                strokeWidth={12}
                className={styles.customProgress}
                format={() =>
                  `${
                    user?.totalSpent ? user.totalSpent.toLocaleString() : 0
                  } VND`
                }
              />

              <p className={styles.rankDisplay} style={{ color }}>
                Hạng hiện tại: {rank}
              </p>
            </div>

            <div className={styles.contactInfo}>
              <p>
                📞 <a href="tel:19002224">19002224</a>
              </p>
              <p>
                📧{" "}
                <a href="mailto:hotro@galaxystudio.vn">hotro@galaxystudio.vn</a>
              </p>
            </div>
          </Card>

          <Card className={styles.profileContent}>
            <Tabs defaultActiveKey="1" className={styles.customTabs}>
              <Tabs.TabPane tab="Lịch Sử Giao Dịch" key="1">
                {ordersLoading ? (
                  <div className={styles.loading}>
                    Đang tải lịch sử giao dịch...
                  </div>
                ) : recentOrders.length > 0 ? (
                  <div className={styles.ordersTable}>
                    <table className={styles.transactionTable}>
                      <thead>
                        <tr>
                          <th>Mã đơn hàng</th>
                          <th>Ngày đặt</th>
                          <th>Tổng tiền</th>
                          <th>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => (
                          <tr key={order.id}>
                            <td>{order.order_code || order.id}</td>
                            <td>
                              {dayjs(order.created_at).format(
                                "DD/MM/YYYY HH:mm"
                              )}
                            </td>
                            <td>{order.total_price?.toLocaleString()} VND</td>
                            <td>
                              <span
                                className={`${styles.statusBadge} ${
                                  order.status === "confirmed"
                                    ? styles.confirmed
                                    : styles.pending
                                }`}
                              >
                                {order.status === "confirmed"
                                  ? "Đã xác nhận"
                                  : "Đang xử lý"}
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
                  </div>
                )}
              </Tabs.TabPane>
              <Tabs.TabPane tab="Thông Tin Cá Nhân" key="2">
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
                      value={
                        editedUser?.birthdate
                          ? dayjs(editedUser.birthdate)
                          : null
                      }
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
                      onChange={(e) =>
                        handleUserChange("phone", e.target.value)
                      }
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
              </Tabs.TabPane>
              {user?.role !== "admin" && (
                <Tabs.TabPane tab="Đổi Mật Khẩu" key="3">
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
                </Tabs.TabPane>
              )}
            </Tabs>
          </Card>
        </div>
      </div>
      <AppFooter />
    </div>
  );
};

export default UserProfile;
