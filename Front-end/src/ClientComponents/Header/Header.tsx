import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { faFilm as faSolidFilm } from "@fortawesome/free-solid-svg-icons";

import "./header.css";
import { AudioOutlined } from "@ant-design/icons";
import { Input } from "antd";
import type { GetProps } from "antd";
import { Link } from "react-router-dom";

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

const Header = () => {
    return (
        <div>
            <header>
                <div className="flex row">
                    <p className="slogan">
                        Phim đỉnh cao, vé siêu nhanh - chỉ một cú chạm!
                    </p>
                    <div>
                        <div className="flex">
                            <div className="network">
                                <FontAwesomeIcon
                                    className="icon-network"
                                    icon={faFacebookF}
                                />
                                <FontAwesomeIcon
                                    className="icon-network"
                                    icon={faInstagram}
                                />
                                <FontAwesomeIcon
                                    className="icon-network"
                                    icon={faSolidFilm}
                                />
                            </div>
                            <div className="flex btn-link">
                                <Link className="signUp" to={"......"}>
                                    Đăng nhập
                                </Link>
                                <Link className="signIn" to={"....."}>
                                    Đăng ký
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="logo-search flex">
                    <Link className="logo" to={"/"}>
                        Logo
                    </Link>
                    <div className="sreach">
                        <Search
                            placeholder="Tìm kiếm phim"
                            allowClear
                            onSearch={onSearch}
                            style={{
                                width: 380,
                                marginRight: "20px",
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
