import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faFilm as faSolidFilm } from '@fortawesome/free-solid-svg-icons';
import { AudioOutlined, DownOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Dropdown, Input, Menu, message } from 'antd';
import type { GetProps } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/auth.service'; // Import authService để kiểm tra đăng nhập và đăng xuất
import './header.css';

type SearchProps = GetProps<typeof Input.Search>;

const { Search } = Input;

const suffix = (
  <AudioOutlined
    style={{
      fontSize: 16,
      color: '#1677ff',
    }}
  />
);

const onSearch: SearchProps['onSearch'] = (value, _e, info) =>
  console.log(info?.source, value);

const Header: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated(); // Kiểm tra trạng thái đăng nhập

  // Lấy tên người dùng từ localStorage hoặc mặc định nếu không có
  const userName = localStorage.getItem('user_name') || 'User';
  const firstLetter = userName.charAt(0).toUpperCase();

  // Hàm xử lý đăng xuất
  const handleLogout = async () => {
    try {
      const response = await authService.logout();
      message.success(response.message || 'Đăng xuất thành công!');
      navigate('/auth/login');
    } catch (error: any) {
      console.error('[Header] Logout Error:', error);
      message.error(error.message || 'Đăng xuất thất bại.');
    }
  };

  // Hàm xử lý chuyển hướng đến profile
  const handleProfile = () => {
    navigate('/profile'); // Chuyển hướng đến trang profile của user
  };

  // Menu cho dropdown khi đã đăng nhập
  const menu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={handleProfile}>
        Profile
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <div>
      <header className="header-client">
        <div className="flex row">
          <p className="slogan">
            Phim đỉnh cao, vé siêu nhanh - chỉ một cú chạm!
          </p>
          <div>
            <div className="flex">
              <div className="network">
                <FontAwesomeIcon className="icon-network" icon={faFacebookF} />
                <FontAwesomeIcon className="icon-network" icon={faInstagram} />
                <FontAwesomeIcon className="icon-network" icon={faSolidFilm} />
              </div>
              <div className="flex btn-link">
                {isAuthenticated ? (
                  <Dropdown overlay={menu} trigger={['click']}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        gap: '8px',
                      }}
                    >
                      <Avatar
                        style={{
                          backgroundColor: 'var(--primary-color)',
                          color: 'var(--backgroud-product)',
                        }}
                      >
                        {firstLetter}
                      </Avatar>
                      <DownOutlined style={{ color: '#fff' }} />
                    </div>
                  </Dropdown>
                ) : (
                  <>
                    <Link className="signUp" to="/auth/login">
                      Đăng nhập
                    </Link>
                    <Link className="signIn" to="/auth/register">
                      Đăng ký
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="logo-search flex">
          <Link className="logo" to="/">
            Logo
          </Link>
          <div className="sreach">
            <Search
              placeholder="Tìm kiếm phim"
              allowClear
              onSearch={onSearch}
              style={{
                width: 380,
                marginRight: '20px',
              }}
              className="custom-search"
            />
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;