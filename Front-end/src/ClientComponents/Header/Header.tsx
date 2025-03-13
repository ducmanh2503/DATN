import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { faFilm as faSolidFilm } from "@fortawesome/free-solid-svg-icons";
import {
    AudioOutlined,
    DownOutlined,
    LogoutOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Dropdown, Input, Menu, message } from "antd";
import type { GetProps } from "antd";
import { Link, useNavigate } from "react-router-dom";
import clsx from "clsx";
import authService from "../../services/auth.service"; // Import authService để kiểm tra đăng nhập và đăng xuất
import styles from "./header.module.css";

type SearchProps = GetProps<typeof Input.Search>;

const { Search } = Input;

const suffix = (
    <AudioOutlined
        style={{
            fontSize: 16,
            color: "#1677ff",
        }}
    />
);

const onSearch: SearchProps["onSearch"] = (value, _e, info) =>
    console.log(info?.source, value);

const Header: React.FC = () => {
    const navigate = useNavigate();
    const isAuthenticated = authService.isAuthenticated(); // Kiểm tra trạng thái đăng nhập

    // Lấy tên người dùng từ localStorage hoặc mặc định nếu không có
    const userName = localStorage.getItem("user_name") || "User";
    const firstLetter = userName.charAt(0).toUpperCase();

    // Hàm xử lý đăng xuất
    const handleLogout = async () => {
        try {
            const response = await authService.logout();
            message.success(response.message || "Đăng xuất thành công!");
            navigate("/auth/login");
        } catch (error: any) {
            console.error("[Header] Logout Error:", error);
            message.error(error.message || "Đăng xuất thất bại.");
        }
    };

    // Hàm xử lý chuyển hướng đến profile
    const handleProfile = () => {
        navigate("/profile"); // Chuyển hướng đến trang profile của user
    };

    // Menu cho dropdown khi đã đăng nhập
    const menu = {
        items: [
            {
                key: "profile",
                icon: <UserOutlined />,
                label: "Profile",
                onClick: handleProfile,
            },
            {
                key: "logout",
                icon: <LogoutOutlined />,
                label: "Đăng xuất",
                onClick: handleLogout,
            },
        ],
    };

    return (
        <div>
            <header className={clsx(styles.headerClient)}>
                <div className={clsx(styles.flex, styles.row)}>
                    <p className={clsx(styles.slogan)}>
                        Phim đỉnh cao, vé siêu nhanh - chỉ một cú chạm!
                    </p>
                    <div>
                        <div className={clsx(styles.flex)}>
                            <div className={clsx(styles.network)}>
                                <FontAwesomeIcon
                                    className={clsx(styles.iconNetwork)}
                                    icon={faFacebookF}
                                />
                                <FontAwesomeIcon
                                    className={clsx(styles.iconNetwork)}
                                    icon={faInstagram}
                                />
                                <FontAwesomeIcon
                                    className={clsx(styles.iconNetwork)}
                                    icon={faSolidFilm}
                                />
                            </div>
                            <div className={clsx(styles.flex)}>
                                {isAuthenticated ? (
                                    <Dropdown menu={menu} trigger={["click"]}>
                                        <div
                                            className={clsx(styles.boxProfile)}
                                        >
                                            <Avatar
                                                className={clsx(styles.avatar)}
                                            >
                                                {firstLetter}
                                            </Avatar>
                                        </div>
                                    </Dropdown>
                                ) : (
                                    <>
                                        <Link
                                            className="signUp"
                                            to="/auth/login"
                                        >
                                            Đăng nhập
                                        </Link>
                                        <Link
                                            className="signIn"
                                            to="/auth/register"
                                        >
                                            Đăng ký
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={clsx(styles.logoSearch, styles.flex)}>
                    <Link className={clsx(styles.logo)} to="/">
                        Logo
                    </Link>
                    <div>
                        <Search
                            className={clsx(styles.sreach)}
                            placeholder="Tìm kiếm phim"
                            allowClear
                            onSearch={onSearch}
                        />
                    </div>
                </div>
            </header>
        </div>
    );
};

export default Header;
