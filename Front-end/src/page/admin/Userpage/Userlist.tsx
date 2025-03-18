import { useState, useEffect } from 'react';
import { Button, Input, Table, message, Modal } from 'antd';
import { Search, Plus, Edit, Delete } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './UserList.module.css';
import { User } from '../../../types/user.type';
import { getUsers, searchUsers, deleteUser } from '../../../services/user.service';

const UserList = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [keyword, setKeyword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchField, setSearchField] = useState<'name' | 'email'>('name');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const userList = await getUsers();
      console.log('Danh sách người dùng nhận được:', userList); // Debug
      if (Array.isArray(userList)) {
        setUsers(userList);
        if (userList.length > 0) {
          message.success('Tải danh sách người dùng thành công!');
        } else {
          message.info('Hiện tại không có người dùng nào trong hệ thống.');
        }
      } else {
        setUsers([]);
        message.error('Dữ liệu từ server không đúng định dạng (không phải mảng).');
      }
    } catch (error: any) {
      console.error('Lỗi khi lấy dữ liệu:', error);
      setUsers([]);
      if (error.code === 'ERR_NETWORK') {
        message.error('Không thể kết nối đến server. Vui lòng kiểm tra lại mạng hoặc server.');
      } else if (error.response?.status === 404) {
        message.error('Không tìm thấy endpoint API. Vui lòng kiểm tra backend.');
      } else {
        message.error('Tải danh sách thất bại: ' + (error.message || 'Lỗi không xác định'));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openSearchModal = (field: 'name' | 'email') => {
    setSearchField(field);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setKeyword('');
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const filteredUsers = await searchUsers(searchField, keyword);
      console.log('Danh sách tìm kiếm nhận được:', filteredUsers); // Debug
      if (Array.isArray(filteredUsers)) {
        setUsers(filteredUsers);
        if (filteredUsers.length > 0) {
          message.success('Tìm kiếm người dùng thành công!');
        } else {
          message.info(`Không tìm thấy người dùng nào với ${searchField === 'name' ? 'tên' : 'email'} "${keyword}".`);
        }
      } else {
        setUsers([]);
        message.error('Dữ liệu tìm kiếm từ server không đúng định dạng.');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Lỗi khi tìm kiếm:', error);
      setUsers([]);
      if (error.code === 'ERR_NETWORK') {
        message.error('Không thể kết nối đến server. Vui lòng kiểm tra lại mạng hoặc server.');
      } else if (error.response?.status === 404) {
        message.error('Không tìm thấy endpoint API. Vui lòng kiểm tra backend.');
      } else {
        message.error('Tìm kiếm thất bại: ' + (error.message || 'Lỗi không xác định'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (email: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa người dùng này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteUser(email);
          setUsers(users.filter(user => user.email !== email));
          message.success('Xóa người dùng thành công!');
        } catch (error: any) {
          console.error('Lỗi khi xóa:', error);
          message.error('Xóa thất bại: ' + (error.message || 'Lỗi không xác định'));
        }
      },
    });
  };

  const columns = [
    {
      title: (
        <div>
          Tên
          <Search size={16} onClick={() => openSearchModal('name')} className={styles.searchIcon} />
        </div>
      ),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: (
        <div>
          Email
          <Search size={16} onClick={() => openSearchModal('email')} className={styles.searchIcon} />
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
      title: 'Xác minh',
      dataIndex: 'is_verified',
      key: 'is_verified',
      render: (is_verified: number | boolean) => (is_verified ? 'Đã xác minh' : 'Chưa xác minh'),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: User) => (
        <div>
          <Link to={`/admin/userpage/edit/${record.email}`}>
            <Button type="link" icon={<Edit size={16} />} style={{ marginRight: 8 }}>
              Sửa
            </Button>
          </Link>
          <Button
            type="link"
            danger
            icon={<Delete size={16} />}
            onClick={() => handleDelete(record.email)}
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.userListContainer}>
      <div className={styles.containerInner}>
        <h2 className={styles.title}>Danh sách người dùng</h2>
        <p className={styles.subtitle}>Quản lý thông tin người dùng</p>

        <Link to="/admin/userpage/useradd">
          <Button type="primary" icon={<Plus />} style={{ marginBottom: 16 }}>
            Tạo người dùng
          </Button>
        </Link>

        <Table
          columns={columns}
          dataSource={Array.isArray(users) ? users : []}
          rowKey="email"
          loading={loading}
          className={styles.orderTable}
          locale={{ emptyText: 'Hiện tại không có người dùng nào trong hệ thống' }}
          pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
        />

        <Modal
          title={`Tìm kiếm theo ${searchField === 'name' ? 'Tên' : 'Email'}`}
          open={isModalOpen}
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
            placeholder={`Nhập ${searchField === 'name' ? 'tên' : 'email'}`}
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