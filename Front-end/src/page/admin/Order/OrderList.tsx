import { useState, useEffect } from "react";
import { Button, Input, Table, message, Modal } from "antd";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./OrderList.module.css";

// Định nghĩa type cho dữ liệu đơn hàng
type Order = {
  id: string;
  movieName: string;
  showTime: string;
  room: string;
  status: string;
  total: number;
  bookingDate: string;
};

const OrderList = () => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [keyword, setKeyword] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchField, setSearchField] = useState<"id" | "movieName">("id"); // Trường tìm kiếm: 'id' hoặc 'movieName'

  // Dữ liệu giả từ JSON
  const mockOrders: Order[] = [
    {
      id: "ORDER001",
      movieName: "Avengers: Endgame",
      showTime: "14:00 - 16:30",
      room: "Phòng 1",
      status: "Đã thanh toán",
      total: 150000,
      bookingDate: "2025-03-14",
    },
    {
      id: "ORDER002",
      movieName: "Oppenheimer",
      showTime: "19:00 - 21:30",
      room: "Phòng 3",
      status: "Chờ thanh toán",
      total: 180000,
      bookingDate: "2025-03-13",
    },
    {
      id: "ORDER003",
      movieName: "Inception",
      showTime: "10:00 - 12:30",
      room: "Phòng 2",
      status: "Đã hủy",
      total: 120000,
      bookingDate: "2025-03-12",
    },
  ];

  // Load dữ liệu ban đầu khi component mount
  useEffect(() => {
    setOrders(mockOrders);
  }, []);

  // Hàm mở modal tìm kiếm
  const openSearchModal = (field: "id" | "movieName") => {
    setSearchField(field);
    setIsModalVisible(true);
  };

  // Hàm đóng modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setKeyword("");
  };

  // Xử lý tìm kiếm đơn hàng
  const handleSearch = () => {
    setLoading(true);
    try {
      const filteredOrders = mockOrders.filter((order) =>
        order[searchField].toLowerCase().includes(keyword.toLowerCase())
      );
      setOrders(filteredOrders);
      message.success("Tìm kiếm đơn hàng thành công!");
      setIsModalVisible(false); // Đóng modal sau khi tìm kiếm
    } catch (error: any) {
      console.error("Error during search:", error);
      message.error(error.message || "Tìm kiếm thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Cấu hình cột cho bảng
  const columns = [
    {
      title: (
        <div>
          Mã đơn
          <Search
            size={16}
            onClick={() => openSearchModal("id")}
            style={{ cursor: "pointer", marginLeft: "8px" }}
          />
        </div>
      ),
      dataIndex: "id",
      key: "id",
      render: (text: string) => (
        <Link to={`/orders/${text}`} className={styles.orderLink}>
          {text}
        </Link>
      ),
    },
    {
      title: (
        <div>
          Tên phim
          <Search
            size={16}
            onClick={() => openSearchModal("movieName")}
            style={{ cursor: "pointer", marginLeft: "8px" }}
          />
        </div>
      ),
      dataIndex: "movieName",
      key: "movieName",
    },
    {
      title: "Xuất chiếu",
      dataIndex: "showTime",
      key: "showTime",
    },
    {
      title: "Phòng chiếu",
      dataIndex: "room",
      key: "room",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      render: (value: number) => `${value.toLocaleString()} VNĐ`,
    },
    {
      title: "Ngày đặt",
      dataIndex: "bookingDate",
      key: "bookingDate",
    },
  ];

  return (
    <div className={styles.orderListContainer}>
      <div className={styles.containerInner}>
        <h2 className={styles.title}>Danh sách đơn hàng</h2>
        <p className={styles.subtitle}>Quản lý các đơn đặt vé xem phim</p>

        {/* Bảng danh sách đơn hàng */}
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          className={styles.orderTable}
          locale={{
            emptyText: "Không có đơn hàng nào được tìm thấy",
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
          }}
        />

        {/* Modal tìm kiếm */}
        <Modal
          title={`Tìm kiếm theo ${
            searchField === "id" ? "Mã đơn" : "Tên phim"
          }`}
          visible={isModalVisible}
          onCancel={handleCancel}
          footer={[
            <Button key="cancel" onClick={handleCancel}>
              Hủy
            </Button>,
            <Button key="search" type="primary" onClick={handleSearch}>
              Tìm kiếm
            </Button>,
          ]}
        >
          <Input
            placeholder={`Nhập ${searchField === "id" ? "mã đơn" : "tên phim"}`}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
          />
        </Modal>

        <p className={styles.backLink}>
          Quay lại{" "}
          <Link to="/" className={styles.homeLink}>
            Trang chủ
          </Link>
        </p>
      </div>
    </div>
  );
};

export default OrderList;
