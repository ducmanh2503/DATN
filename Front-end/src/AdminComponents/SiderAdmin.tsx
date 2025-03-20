import React, { useState } from "react";
import {
    BarChartOutlined,
    BuildOutlined,
    CalendarOutlined,
    DesktopOutlined,
    SnippetsOutlined,
    TeamOutlined,
    VideoCameraAddOutlined,
    ShoppingOutlined,
} from "@ant-design/icons";
import { Menu, type MenuProps } from "antd";
import Sider from "antd/es/layout/Sider";
import { Link } from "react-router-dom";

type MenuItem = Required<MenuProps>["items"][number];
function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[]
): MenuItem {
    return {
        key,
        icon,
        children,
        label,
    } as MenuItem;
}

const SiderAdmin = () => {
<<<<<<< HEAD
    const [collapsed, setCollapsed] = useState(false);
    const items: MenuItem[] = [
        getItem("Quản lý phim", "sub1", <VideoCameraAddOutlined />, [
            getItem(<Link to="film">Danh sách phim</Link>, "sub1-1"),
            getItem(<Link to="addFilm">Thêm phim</Link>, "sub1-2"),
            getItem(<Link to="stoppedMovie">Phim ngừng chiếu</Link>, "sub1-3"),
        ]),
        getItem("Quản lý lịch chiếu", "sub2", <CalendarOutlined />, [
            getItem(
                <Link to="calendarShow">Danh sách lịch chiếu</Link>,
                "sub2-1"
            ),
        ]),
        getItem("Quản lý suất chiếu", "sub7", <SnippetsOutlined />, [
            getItem(<Link to="showtimes">Danh sách suất chiếu</Link>, "sub7-1"),
        ]),
        getItem("Phòng chiếu", "sub3", <DesktopOutlined />, [
            getItem(<Link to="rooms">Danh sách phòng chiếu</Link>, "sub3-1"),
        ]),
        getItem("Ghế ngồi", "sub4", <BuildOutlined />, [
            getItem(<Link to="seats">Quản lý Ghế ngồi</Link>, "sub4-1"),
        ]),
        getItem("Người dùng", "sub5", <TeamOutlined />, [
            getItem(<Link to="users">Danh sách Người dùng</Link>, "sub5-1"),
            getItem(<Link to="userpage/useradd">Tạo người dùng</Link>, "sub5-2"),
        ]),
        getItem("Thống kê", "sub6", <BarChartOutlined />, [
            getItem("Tự tạo", "sub6-1"),
        ]),
        getItem("Quản lý đạo diễn", "sub8", <BarChartOutlined />, [
            getItem(<Link to="directors">Danh sách đạo diễn</Link>, "sub8-1"),
        ]),
        getItem("Quản lý diễn viên", "sub9", <BarChartOutlined />, [
            getItem(<Link to="actors">Danh sách diễn viên</Link>, "sub9-1"),
        ]),
        getItem("Quản lý thể loại", "sub10", <BarChartOutlined />, [
            getItem(<Link to="genre">Danh sách thể loại</Link>, "sub10-1"),
        ]),
        getItem("Quản lý đơn hàng", "sub11", <ShoppingOutlined />, [
            getItem(<Link to="orders">Danh sách đơn hàng</Link>, "sub11-1"),
            getItem(<Link to="/admin/order/orderDetail">Chi tiết đơn hàng</Link>, "sub11-2"),
        ]),
        // Thêm mục Quản lý combo
        getItem("Quản lý combo", "sub12", <ShoppingOutlined />, [
            getItem(<Link to="/admin/combo">Danh sách combo</Link>, "sub12-1"),
        ]),
    ];

    return (
        <div>
            <Sider
                style={{ height: "100%", minWidth: "280px" }}
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
            >
                <div
                    style={{
                        height: "64px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "white",
                        margin: "16px",
                        marginBottom: "50px",
                    }}
                >
                    <h1
                        style={{
                            fontSize: "24px",
                            margin: 0,
                            padding: 0,
                        }}
                    >
                        Logo
                    </h1>
                </div>

                <Menu
                    theme="dark"
                    defaultSelectedKeys={["1"]}
                    mode="inline"
                    items={items}
                />
            </Sider>
=======
  const [collapsed, setCollapsed] = useState(false);
  const items: MenuItem[] = [
    getItem("Dashboard", "sub1", <BarChartOutlined />, [
      getItem("Tự tạo", "sub1-1"),
    ]),
    getItem("Quản lý phim", "sub2", <VideoCameraAddOutlined />, [
      getItem(<Link to="film">Danh sách phim</Link>, "sub2-1"),
      getItem(<Link to="addFilm">Thêm phim</Link>, "sub2-2"),
      getItem(<Link to="stoppedMovie">Phim ngừng chiếu</Link>, "sub2-3"),
    ]),
    getItem("Quản lý lịch chiếu", "sub3", <CalendarOutlined />, [
      getItem(<Link to="calendarShow">Danh sách lịch chiếu</Link>, "sub3-1"),
    ]),
    getItem("Quản lý suất chiếu", "sub4", <SnippetsOutlined />, [
      getItem(<Link to="showtimes">Danh sách suất chiếu</Link>, "sub4-1"),
    ]),

    getItem("Phòng chiếu", "sub5", <DesktopOutlined />, [
      getItem(<Link to="rooms">Danh sách phòng chiếu</Link>, "sub5-1"),
    ]),
    getItem("Quản lý giá vé", "sub6", <DesktopOutlined />, [
      getItem(<Link to="ticketsPrice">Danh sách giá vé</Link>, "sub6-1"),
    ]),
    getItem("Quản lý combo", "sub7", <ShoppingOutlined />, [
      getItem(<Link to="combo">Danh sách combo</Link>, "sub7-1"),
    ]),
    getItem("Quản lý đơn hàng", "sub8", <ShoppingOutlined />, [
      getItem(<Link to="orders">Danh sách đơn hàng</Link>, "sub8-1"),
    ]),
    getItem("Quản lý người dùng", "sub9", <TeamOutlined />, [
      getItem(<Link to="users">Danh sách người dùng</Link>, "sub9-1"),
      getItem(<Link to="userpage/useradd">Thêm người dùng</Link>, "sub9-2"),
    ]),
    getItem("Quản lý đạo diễn", "sub10", <BarChartOutlined />, [
      getItem(<Link to="directors">Danh sách đạo diễn</Link>, "sub10-1"),
    ]),
    getItem("Quản lý diễn viên", "sub11", <BarChartOutlined />, [
      getItem(<Link to="actors">Danh sách diễn viên</Link>, "sub11-1"),
    ]),
    getItem("Quản lý thể loại", "sub12", <BarChartOutlined />, [
      getItem(<Link to="genre">Danh sách thể loại</Link>, "sub12-1"),
    ]),
    getItem("Quản lý bài viết ", "sub13", <BarChartOutlined />, [
      getItem(<Link to="articlelist">Danh sách bài viết</Link>, "sub13-1"),
      getItem(<Link to="create-article">Thêm bài viết</Link>, "sub12-2"),
    ]),
    getItem("Quản lý Khuyến Mãi", "sub14", <BarChartOutlined />, [
      getItem(<Link to="discount-code">Khuyến mãi</Link>, "sub14-1"),
    ]),
  ];
  return (
    <div>
      <Sider
        style={{ height: "100%", minWidth: "280px" }}
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div
          style={{
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "white",
            margin: "16px",
            marginBottom: "50px",
          }}
        >
          <h1
            style={{
              fontSize: "24px",
              margin: 0,
              padding: 0,
            }}
          >
            Logo
          </h1>
>>>>>>> main
        </div>
    );
};

export default SiderAdmin;