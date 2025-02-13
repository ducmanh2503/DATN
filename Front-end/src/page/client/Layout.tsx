import React from "react";
import Header from "../../ClientComponents/Header/Header";
import Navigate from "../../ClientComponents/Navigate/Navigate";
import { FloatButton } from "antd";

const Layout = ({ children }: any) => {
    return (
        <div style={{ background: "var(--mainBase-color)" }}>
            <Header></Header>
            <Navigate></Navigate>
            {children}
            <FloatButton.BackTop />
            {/* footer */}
        </div>
    );
};

export default Layout;
