import { useState, useEffect } from 'react';
import { Button, Input, Table, message, Modal, Avatar } from 'antd';
import { Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './UserList.module.css';

// Định nghĩa type cho dữ liệu người dùng
type User = {
  id: string;
  avatar: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
};

const UserList = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [keyword, setKeyword] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchField, setSearchField] = useState<'fullName' | 'email'>('fullName');

  // Dữ liệu giả
  const mockUsers: User[] = [
    {
      id: "USER001",
      avatar: "https://example.com/avatars/user1.jpg",
      fullName: "Nguyễn Văn An",
      email: "nguyenvanan@example.com",
      phone: "0987654321",
      role: "Admin",
      status: "Hoạt động",
      createdAt: "2025-01-15",
    },
    {
      id: "USER002",
      avatar: "https://example.com/avatars/user2.jpg",
      fullName: "Trần Thị Bình",
      email: "tranthibinh@example.com",
      phone: "0912345678",
      role: "Người dùng",
      status: "Hoạt động",
      createdAt: "2025-02-20",
    },
    {
      id: "USER003",
      avatar: "https://example.com/avatars/user3.jpg",
      fullName: "Lê Minh Châu",
      email: "leminhchau@example.com",
      phone: "0934567890",
      role: "Quản lý",
      status: "Khóa",
      createdAt: "2025-03-01",
    },
    {
      id: "USER004",
      avatar: "https://example.com/avatars/user4.jpg",
      fullName: "Phạm Quốc Đạt",
      email: "phamquocdat@example.com",
      phone: "0971234567",
      role: "Người dùng",
      status: "Hoạt động",
      createdAt: "2025-03-10",
    },
    {
      id: "USER005",
      avatar: "https://example.com/avatars/user5.jpg",
      fullName: "Hoàng Thị E",
      email: "hoangthie@example.com",
      phone: "0945678901",
      role: "Người dùng",
      status: "Khóa",
      createdAt: "2025-03-12",
    },
  ];

  // Load dữ liệu ban đầu khi component mount
  useEffect(() => {
    setUsers(mockUsers);
  }, []);

  // Hàm mở modal tìm kiếm
  const openSearchModal = (field: 'fullName' | 'email') => {
    setSearchField(field);
    setIsModalVisible(true);
  };

  // Hàm đóng modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setKeyword('');
  };

  // Xử lý tìm kiếm người dùng
  const handleSearch = () => {
    setLoading(true);
    try {
      const filteredUsers = mockUsers.filter(user =>
        user[searchField].toLowerCase().includes(keyword.toLowerCase())
      );
      setUsers(filteredUsers);
      message.success('Tìm kiếm người dùng thành công!');
      setIsModalVisible(false);
    } catch (error: any) {
      console.error('Error during search:', error);
      message.error(error.message || 'Tìm kiếm thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Cấu hình cột cho bảng
  const columns = [
    {
      title: 'Avatar',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (avatar: string) => <Avatar src={avatar} size={40} />,
    },
    {
      title: (
        <div>
          Họ tên
          <Search
            size={16}
            onClick={() => openSearchModal('fullName')}
            className={styles.searchIcon}
          />
        </div>
      ),
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text: string, record: User) => (
        <Link to={`/users/${record.id}`} className={styles.orderLink}>
          {text}
        </Link>
      ),
    },
    {
      title: (
        <div>
          Email
          <Search
            size={16}
            onClick={() => openSearchModal('email')}
            className={styles.searchIcon}
          />
        </div>
      ),
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Quyền',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
  ];

  return (
    <div className={styles.userListContainer}>
      <div className={styles.containerInner}>
        <h2 className={styles.title}>Danh sách người dùng</h2>
        <p className={styles.subtitle}>Quản lý thông tin người dùng</p>

        {/* Nút tạo user (liên kết đến trang UserAdd) */}
        <Link to="/admin/userpage/useradd">
          <Button
            type="primary"
            icon={<Plus />}
            style={{ marginBottom: 16 }}
          >
            Tạo user
          </Button>
        </Link>

        {/* Bảng danh sách người dùng */}
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          className={styles.orderTable}
          locale={{
            emptyText: 'Không có người dùng nào được tìm thấy',
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
        />

        {/* Modal tìm kiếm */}
        <Modal
          title={`Tìm kiếm theo ${searchField === 'fullName' ? 'Họ tên' : 'Email'}`}
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
            placeholder={`Nhập ${searchField === 'fullName' ? 'họ tên' : 'email'}`}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            className={styles.searchInput}
          />
        </Modal>

        <p className={styles.backLink}>
          Quay lại{' '}
          <Link to="/" className={styles.homeLink}>
            Trang chủ
          </Link>
        </p>
      </div>
    </div>
  );
};

export default UserList;