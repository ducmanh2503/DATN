import { useState, useEffect } from "react";
import axios from "axios";
import { Button, Input, Space, Modal, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "./OrderHistory.module.css";
import {
    Orders_Recent,
    Orders_Confirmed,
    Orders_Search,
} from "../../config/ApiConfig";

const getAuthToken = (): string | null => localStorage.getItem("auth_token");

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
                .map(
                    (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                )
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

const URL_IMAGE = "http://localhost:8000";
const fallbackPoster = "/path/to/fallback-poster.jpg"; // Replace with actual fallback image path

interface Seat {
    booking_detail_id: number;
    seat_name: string;
    price: number;
}

interface Combo {
    combo_name: string;
    quantity: number;
    price: number;
}

interface Order {
    id: number;
    total_price: number;
    status: string;
    created_at: string;
    show_date: string;
    showtime: string;
    movie_title: string;
    movie_poster: string;
    room_name: string;
    cinema_name?: string; // Added to Order interface
    seats: Seat[];
    combos?: Combo[]; // Added to Order interface
    payment_method: string;
    total_ticket_price?: number;
    total_combo_price?: number;
}

interface OrderDetail extends Order {
    // No additional fields needed since Order now includes everything
}

const OrderHistory: React.FC = () => {
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        fetchRecentOrders();
    }, []);

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

            const decoded = decodeToken(token);
            if (decoded && decoded.exp) {
                const currentTime = Math.floor(Date.now() / 1000);
                if (decoded.exp < currentTime) {
                    console.warn("Token has expired");
                    message.error(
                        "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
                    );
                    localStorage.removeItem("auth_token");
                    window.location.href = "/login";
                    return;
                }
            }

            const response = await axios.get(Orders_Recent, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("check-dataaaa", response);

            const orders = Array.isArray(response.data.data)
                ? response.data.data
                : [];
            setRecentOrders(orders);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách giao dịch:", error);
            if (error.response && error.response.status === 401) {
                message.error(
                    "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại."
                );
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

            const decoded = decodeToken(token);
            if (decoded && decoded.exp) {
                const currentTime = Math.floor(Date.now() / 1000);
                if (decoded.exp < currentTime) {
                    console.warn("Token has expired");
                    message.error(
                        "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
                    );
                    localStorage.removeItem("auth_token");
                    window.location.href = "/login";
                    return;
                }
            }

            const response = await axios.get(Orders_Confirmed, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const orders = Array.isArray(response.data.data)
                ? response.data.data
                : [];
            setRecentOrders(orders);
        } catch (error) {
            console.error(
                "Lỗi khi lấy danh sách giao dịch đã xác nhận:",
                error
            );
            if (error.response && error.response.status === 401) {
                message.error(
                    "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại."
                );
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
                message.error(
                    "Bạn cần đăng nhập để tìm kiếm lịch sử giao dịch!"
                );
                window.location.href = "/login";
                return;
            }

            const decoded = decodeToken(token);
            if (decoded && decoded.exp) {
                const currentTime = Math.floor(Date.now() / 1000);
                if (decoded.exp < currentTime) {
                    console.warn("Token has expired");
                    message.error(
                        "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
                    );
                    localStorage.removeItem("auth_token");
                    window.location.href = "/login";
                    return;
                }
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
                message.error(
                    "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại."
                );
                localStorage.removeItem("auth_token");
                window.location.href = "/login";
            } else {
                message.error("Không thể tìm kiếm lịch sử giao dịch!");
            }
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleShowDetails = (orderId: number) => {
        // Find the order from recentOrders
        const order = recentOrders.find((o) => o.id === orderId);
        if (order) {
            setSelectedOrder(order);
            setIsModalVisible(true);
        } else {
            message.error(`Không tìm thấy giao dịch với mã ${orderId}!`);
        }
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedOrder(null);
    };

    return (
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
                        className={styles.customButton}
                    >
                        Giao dịch gần đây
                    </Button>
                    <Button
                        type="primary"
                        onClick={fetchConfirmedOrders}
                        className={styles.customButton}
                    >
                        Giao dịch đã xác nhận
                    </Button>
                </Space>
            </div>
            {ordersLoading ? (
                <div className={styles.loading}>
                    Đang tải lịch sử giao dịch...
                </div>
            ) : recentOrders.length > 0 ? (
                <table className={styles.transactionTable}>
                    <thead className={styles.thead}>
                        <tr>
                            <th>Ngày đặt</th>
                            <th>Phim</th>
                            <th>Ngày chiếu</th>
                            <th>Tổng tiền</th>
                            <th>Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentOrders.map((order) => (
                            <tr
                                key={order.id}
                                className={styles.transactionRow}
                            >
                                <td>{order.created_at}</td>
                                <td className={styles.movieCell}>
                                    {order.movie_poster ? (
                                        <img
                                            src={`${URL_IMAGE}${order.movie_poster}`}
                                            alt={
                                                order.movie_title ||
                                                "Movie Poster"
                                            }
                                            className={styles.moviePoster}
                                            onError={(e) => {
                                                e.currentTarget.src =
                                                    fallbackPoster;
                                            }}
                                        />
                                    ) : (
                                        <div className={styles.noPoster}>
                                            No Poster
                                        </div>
                                    )}
                                    <span>{order.movie_title || "N/A"}</span>
                                </td>
                                <td>{order.show_date}</td>

                                <td>
                                    {order.total_price?.toLocaleString() || "0"}
                                    đ
                                </td>

                                <td>
                                    <button
                                        onClick={() =>
                                            handleShowDetails(order.id)
                                        }
                                        className={styles.viewDetails}
                                    >
                                        Xem chi tiết
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
                className={styles.orderDetailsModal}
            >
                {selectedOrder ? (
                    <div className={styles.orderDetails}>
                        <p>
                            <strong>Mã giao dịch:</strong> {selectedOrder.id}
                        </p>
                        <p>
                            <strong>Ngày đặt:</strong>{" "}
                            {selectedOrder.created_at}
                        </p>
                        <p>
                            <strong>Ngày chiếu:</strong>{" "}
                            {selectedOrder.show_date}
                        </p>
                        <p>
                            <strong>Phòng chiếu:</strong>{" "}
                            {selectedOrder.room_name || "N/A"}
                        </p>
                        <p>
                            <strong>Phim:</strong>{" "}
                            {selectedOrder.movie_title || "N/A"}
                        </p>
                        {selectedOrder.movie_poster && (
                            <p>
                                <strong>Poster:</strong>
                                <img
                                    src={`${URL_IMAGE}${selectedOrder.movie_poster}`}
                                    alt="Movie Poster"
                                    className={styles.moviePoster}
                                    onError={(e) => {
                                        e.currentTarget.src = fallbackPoster;
                                    }}
                                />
                            </p>
                        )}
                        <p>
                            <strong>Ghế:</strong>{" "}
                            {selectedOrder.seats?.length > 0
                                ? selectedOrder.seats
                                      .map((seat) => seat.seat_name)
                                      .join(", ")
                                : "N/A"}
                        </p>
                        {selectedOrder.combos &&
                            selectedOrder.combos.length > 0 && (
                                <div>
                                    <strong>Combo:</strong>
                                    <ul>
                                        {selectedOrder.combos.map(
                                            (combo, index) => (
                                                <li key={index}>
                                                    {combo.combo_name} x{" "}
                                                    {combo.quantity} -{" "}
                                                    {(
                                                        combo.price *
                                                        combo.quantity
                                                    ).toLocaleString()}
                                                    đ
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>
                            )}
                        <p>
                            <strong>Tổng tiền vé:</strong>{" "}
                            {selectedOrder.total_ticket_price?.toLocaleString() ||
                                "0"}
                            đ
                        </p>
                        <p>
                            <strong>Tổng tiền combo:</strong>{" "}
                            {selectedOrder.total_combo_price?.toLocaleString() ||
                                "0"}
                            đ
                        </p>
                        <p>
                            <strong>Tổng tiền:</strong>{" "}
                            {selectedOrder.total_price?.toLocaleString() || "0"}
                            đ
                        </p>
                        <p>
                            <strong>Trạng thái:</strong>{" "}
                            <span
                                className={`${styles.statusBadge} ${
                                    getStatusLabelAndStyle(selectedOrder.status)
                                        .style
                                }`}
                            >
                                {
                                    getStatusLabelAndStyle(selectedOrder.status)
                                        .label
                                }
                            </span>
                        </p>
                    </div>
                ) : (
                    <p>Không có dữ liệu chi tiết.</p>
                )}
            </Modal>
        </>
    );
};

export default OrderHistory;
