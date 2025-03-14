import { Descriptions, Table, Typography } from 'antd';
import { Link } from 'react-router-dom';
import styles from './OrderDetail.module.css';

// Định nghĩa type cho dữ liệu chi tiết đơn hàng
type OrderDetailType = {
  id: string;
  movieName: string;
  showTime: string;
  room: string;
  status: string;
  total: number;
  bookingDate: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  seats: string[];
  services: {
    name: string;
    quantity: number;
    price: number;
  }[];
  ticketPrice: number; // Giá vé mỗi ghế
};

// Dữ liệu giả cho chi tiết đơn hàng
const mockOrderDetail: OrderDetailType = {
  id: "ORDER001",
  movieName: "Avengers: Endgame",
  showTime: "14:00 - 16:30",
  room: "Phòng 1",
  status: "Đã thanh toán",
  total: 150000,
  bookingDate: "2025-03-14",
  customer: {
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0123456789",
  },
  seats: ["A1", "A2", "A3"],
  services: [
    { name: "Popcorn", quantity: 1, price: 20000 },
    { name: "Coca", quantity: 1, price: 10000 },
  ],
  ticketPrice: 40000, // Giá vé mỗi ghế là 40,000 VNĐ
};

const OrderDetail = () => {
  const order = mockOrderDetail;
  const { Title } = Typography;

  // Tính toán tổng tiền vé và dịch vụ
  const ticketTotal = order.seats.length * order.ticketPrice;
  const servicesTotal = order.services.reduce((sum, service) => sum + service.quantity * service.price, 0);
  const grandTotal = ticketTotal + servicesTotal;

  // Cấu hình cột cho bảng dịch vụ
  const servicesColumns = [
    {
      title: 'Tên dịch vụ',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      render: (value: number) => `${value.toLocaleString()} VNĐ`,
    },
    {
      title: 'Thành tiền',
      key: 'subtotal',
      render: (_: string, record: { quantity: number; price: number }) =>
        `${(record.quantity * record.price).toLocaleString()} VNĐ`,
    },
  ];

  return (
    <div className={styles.orderDetailContainer}>
      <Title level={2}>Chi tiết đơn hàng</Title>

      {/* Thông tin đơn hàng */}
      <Descriptions title="Thông tin đơn hàng" bordered>
        <Descriptions.Item label="Mã đơn">{order.id}</Descriptions.Item>
        <Descriptions.Item label="Tên phim">{order.movieName}</Descriptions.Item>
        <Descriptions.Item label="Xuất chiếu">{order.showTime}</Descriptions.Item>
        <Descriptions.Item label="Phòng chiếu">{order.room}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">{order.status}</Descriptions.Item>
        <Descriptions.Item label="Tổng tiền">{order.total.toLocaleString()} VNĐ</Descriptions.Item>
        <Descriptions.Item label="Ngày đặt">{order.bookingDate}</Descriptions.Item>
      </Descriptions>

      {/* Thông tin khách hàng */}
      <Descriptions title="Thông tin khách hàng" bordered>
        <Descriptions.Item label="Tên khách hàng">{order.customer.name}</Descriptions.Item>
        <Descriptions.Item label="Email">{order.customer.email}</Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">{order.customer.phone}</Descriptions.Item>
      </Descriptions>

      {/* Danh sách ghế */}
      <Title level={4}>Danh sách ghế</Title>
      <p>{order.seats.join(', ')}</p>

      {/* Dịch vụ */}
      <Title level={4}>Dịch vụ</Title>
      <Table
        columns={servicesColumns}
        dataSource={order.services}
        rowKey="name"
        pagination={false}
      />

      {/* Tóm tắt */}
      <Title level={4}>Tóm tắt</Title>
      <p>
        Tổng tiền vé: {ticketTotal.toLocaleString()} VNĐ ({order.seats.length} ghế x{' '}
        {order.ticketPrice.toLocaleString()} VNĐ)
      </p>
      <p>Tổng tiền dịch vụ: {servicesTotal.toLocaleString()} VNĐ</p>
      <p>Tổng cộng: {grandTotal.toLocaleString()} VNĐ</p>

      {/* Liên kết quay lại */}
      <p className={styles.backLink}>
        Quay lại{' '}
        <Link to="/orders" className={styles.orderListLink}>
          Danh sách đơn hàng
        </Link>
      </p>
    </div>
  );
};

export default OrderDetail;