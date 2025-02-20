import { Avatar } from "antd";
import React from "react";

const HeaderAdmin = () => {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                padding: "0 15px",
                background: "var(--border-color)",
                height: "50px",
                width: "100%",
            }}
        >
            <Avatar
                style={{
                    backgroundColor: "var(--primary-color)",
                    color: "var(--backgroud-product)",
                }}
            >
                U
            </Avatar>
        </div>
    );
};

export default HeaderAdmin;
