import { Content } from "antd/es/layout/layout";
import { Breadcrumb, theme } from "antd";
import { Outlet } from "react-router-dom";

const BreadcrumbAdmin = () => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    return (
        <>
            <Content style={{ margin: "0 16px" }}>
                <Breadcrumb
                    items={[
                        { title: "Đường dẫn động" },
                        { title: "Phát triển sau" },
                    ]}
                />
                <div
                    style={{
                        padding: 24,
                        minHeight: 360,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <Outlet></Outlet>
                </div>
            </Content>
        </>
    );
};

export default BreadcrumbAdmin;
