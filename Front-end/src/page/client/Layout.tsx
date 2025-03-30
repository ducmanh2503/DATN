import React, { useEffect, useRef } from "react";
import Header from "../../ClientComponents/Header/Header";
import Navigate from "../../ClientComponents/Navigate/Navigate";
import AppFooter from "../../ClientComponents/Footer/footer";
import { FloatButton } from "antd";
import { useLocation } from "react-router-dom";
import { useStepsContext } from "../../ClientComponents/UseContext/StepsContext";
const ClientLayout = ({ children }: any) => {
    const location = useLocation();
    const { setPathName } = useStepsContext();
    return (
        <div style={{ background: "var(--mainBase-color)" }}>
            <Header></Header>
            <Navigate></Navigate>
            {children}
            <FloatButton.BackTop />
            <AppFooter />
        </div>
    );
};

export default ClientLayout;
