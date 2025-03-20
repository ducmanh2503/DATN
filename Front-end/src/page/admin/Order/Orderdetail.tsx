import { Table, Typography } from "antd";
import { Link } from "react-router-dom";
import styles from "./OrderDetail.module.css";

// Định nghĩa type cho dữ liệu chi tiết đơn hàng
type SeatType = {
  seatNumber: string;
  seatType: string;
  price: number;
};

type ServiceType = {
  name: string;
  quantity: number;
  price: number;
};

type OrderDetailType = {
  id: string;
  movieName: string;
  showTime: string;
  showDate: string;
  room: string;
  cinema: string;
  bookingDate: string;
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  status: string;
  seats: SeatType[];
  services: ServiceType[];
  discount: number;
};

const mockOrderDetail: OrderDetailType = {
  id: "98175515",
  movieName: "Monkey Man Báo Thù",
  showTime: "20:25 - 22:20",
  showDate: "06-05-2024",
  room: "IMAX",
  cinema: "Cinema Aeon Hà Đông",
  bookingDate: "06-05-2024",
  customer: {
    name: "Nguyễn Văn A",
    phone: "0123456789",
    email: "nguyenvana@example.com",
  },
  status: "Đã thanh toán",
  seats: [
    { seatNumber: "A1", seatType: "VIP", price: 50000 },
    { seatNumber: "A2", seatType: "Thường", price: 40000 },
    { seatNumber: "A3", seatType: "Thường", price: 40000 },
  ],
  services: [
    { name: "Popcorn", quantity: 1, price: 20000 },
    { name: "Coca", quantity: 1, price: 10000 },
  ],
  discount: 10000,
};

const OrderDetail = () => {
  const order = mockOrderDetail;
  const { Title } = Typography;

  // Tính toán tổng tiền vé
  const ticketTotal = order.seats.reduce((sum, seat) => sum + seat.price, 0);

  // Tính toán tổng tiền dịch vụ
  const servicesTotal = order.services.reduce(
    (sum, service) => sum + service.quantity * service.price,
    0
  );

  // Tổng tiền trước giảm giá
  const totalBeforeDiscount = ticketTotal + servicesTotal;

  // Tổng tiền sau giảm giá
  const grandTotal = totalBeforeDiscount - order.discount;

  // Cấu hình cột cho bảng ghế
  const seatsColumns = [
    {
      title: "Số ghế",
      dataIndex: "seatNumber",
      key: "seatNumber",
    },
    {
      title: "Loại ghế",
      dataIndex: "seatType",
      key: "seatType",
    },
    {
      title: "Giá tiền",
      dataIndex: "price",
      key: "price",
      render: (value: number) => `${value.toLocaleString()} VNĐ`,
    },
  ];

  // Cấu hình cột cho bảng dịch vụ
  const servicesColumns = [
    {
      title: "Tên dịch vụ",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      render: (value: number) => `${value.toLocaleString()} VNĐ`,
    },
    {
      title: "Tổng tiền",
      key: "subtotal",
      render: (_: string, record: ServiceType) =>
        `${(record.quantity * record.price).toLocaleString()} VNĐ`,
    },
  ];

  return (
    <div className={styles.orderDetailContainer}>
      {/* Tiêu đề và breadcrumb */}
      <Title level={2}>Chi tiết đơn hàng</Title>
      <div className={styles.breadcrumb}>
        Dashboard / Danh sách đơn hàng /{" "}
        <span className={styles.breadcrumbCurrent}>Đơn hàng #{order.id}</span>
      </div>
      <div className={styles.searchText}>Tìm kiếm</div>

      {/* Bố cục 3 cột */}
      <div className={styles.columnsContainer}>
        {/* Cột 1: Thông tin đơn hàng */}
        <div className={styles.column}>
          <div className={styles.columnTitle}>Thông tin đơn hàng</div>
          <div className={styles.infoList}>
            <p>
              <span className={styles.label}>Mã đơn hàng:</span> {order.id}
            </p>
            <p>
              <span className={styles.label}>Phim:</span> {order.movieName}
            </p>
            <p>
              <span className={styles.label}>Giờ chiếu:</span>{" "}
              <span className={styles.showDate}>{order.showTime}</span>
            </p>
            <p>
              <span className={styles.label}>Ngày chiếu:</span>{" "}
              <span className={styles.showDate}>{order.showDate}</span>
            </p>
            <p>
              <span className={styles.label}>Phòng chiếu:</span> {order.room}
            </p>
            <p>
              <span className={styles.label}>Rạp chiếu:</span> {order.cinema}
            </p>
            <p>
              <span className={styles.label}>Ngày đặt:</span>{" "}
              {order.bookingDate}
            </p>
          </div>
        </div>

        {/* Cột 2: Thông tin khách hàng */}
        <div className={styles.column}>
          <div className={styles.columnTitle}>Thông tin khách hàng</div>
          <div className={styles.infoList}>
            <p>
              <span className={styles.label}>Khách hàng:</span>{" "}
              {order.customer.name}
            </p>
            <p>
              <span className={styles.label}>Điện thoại:</span>{" "}
              {order.customer.phone}
            </p>
            <p>
              <span className={styles.label}>Email:</span>{" "}
              {order.customer.email}
            </p>
            <p>
              <span className={styles.label}>Trạng thái:</span> {order.status}
            </p>
            <p>
              <span className={styles.label}>Thành tiền:</span>{" "}
              {totalBeforeDiscount.toLocaleString()} VNĐ
            </p>
            <p>
              <span className={styles.label}>Giảm giá:</span>{" "}
              {order.discount.toLocaleString()} VNĐ
            </p>
            <p>
              <span className={styles.label}>Tổng tiền:</span>{" "}
              <span className={styles.totalAmount}>
                {grandTotal.toLocaleString()} VNĐ
              </span>
            </p>
          </div>
        </div>

        {/* Cột 3: Ghế & Dịch vụ */}
        <div className={styles.column}>
          <div className={styles.columnTitle}>Ghế & Dịch vụ</div>
          {/* Danh sách ghế */}
          <div>
            <Title level={4}>Danh sách ghế</Title>
            <Table
              columns={seatsColumns}
              dataSource={order.seats}
              rowKey="seatNumber"
              pagination={false}
            />
          </div>
          {/* Dịch vụ */}
          <div style={{ marginTop: "20px" }}>
            <Title level={4}>Dịch vụ</Title>
            <Table
              columns={servicesColumns}
              dataSource={order.services}
              rowKey="name"
              pagination={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
