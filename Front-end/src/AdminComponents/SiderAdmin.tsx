import React, { useState } from "react";
import {
    BarChartOutlined,
    BuildOutlined,
    CalendarOutlined,
    DesktopOutlined,
    TeamOutlined,
    VideoCameraAddOutlined,
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
    const [collapsed, setCollapsed] = useState(false);
    const items: MenuItem[] = [
        getItem(
            <Link to="film">Phim</Link>,
            "sub1",
            <VideoCameraAddOutlined />
        ),
        getItem(
            <Link to="showtimes">Lịch chiếu</Link>,
            "sub2",
            <CalendarOutlined />
        ),
        getItem("Phòng chiếu", "sub3", <DesktopOutlined />, [
            getItem("Tự tạo", "sub3-1"),
            getItem("Tự tạo", "sub3-2"),
            getItem("Tự tạo", "sub3-3"),
        ]),
        getItem("Ghế ngồi", "sub4", <BuildOutlined />, [
            getItem("Tự tạo", "sub4-1"),
            getItem("Tự tạo", "sub4-2"),
        ]),
        getItem("Người dùng", "sub5", <TeamOutlined />, [
            getItem("Tự tạo", "sub5-1"),
        ]),
        getItem("Thống kê", "sub6", <BarChartOutlined />, [
            getItem("Tự tạo", "sub6-1"),
        ]),
    ];
    return (
        <div>
            <Sider
                style={{ height: "100%" }}
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
        </div>
    );
};

export default SiderAdmin;
