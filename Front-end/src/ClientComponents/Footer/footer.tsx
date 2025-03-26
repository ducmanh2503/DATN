import React from "react";
import { Layout, Row, Col, Typography, Space, Divider, Image } from "antd";
import {
  FacebookOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

const { Footer } = Layout;
const { Text, Title, Link } = Typography;

const AppFooter: React.FC = () => {
  return (
    <Footer
      style={{ background: "#0B2F63", color: "#fff", padding: "40px 20px" }}
    >
      <Row justify="space-between" gutter={[32, 32]}>
        {/* Cột 1 - Logo & Giới thiệu */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Image
            src="/logo.png" // Thay bằng đường dẫn logo của bạn
            preview={false}
            width={150}
            alt="Logo Cinema"
          />
          <Text style={{ color: "#D1E4F2", display: "block", marginTop: 10 }}>
            Trải nghiệm rạp phim chất lượng cao với những bộ phim hấp dẫn nhất.
          </Text>
        </Col>

        {/* Cột 2 - Liên hệ */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Title level={4} style={{ color: "#fff" }}>
            Liên Hệ
          </Title>
          <Space direction="vertical" style={{ color: "#D1E4F2" }}>
            <Text>
              <MailOutlined /> support@cinema.vn
            </Text>
            <Text>
              <PhoneOutlined /> 1900 2224
            </Text>
            <Text>
              <EnvironmentOutlined /> 123 Đường ABC, TP. HCM
            </Text>
          </Space>
        </Col>

        {/* Cột 3 - Hỗ trợ */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Title level={4} style={{ color: "#fff" }}>
            Hỗ Trợ
          </Title>
          <Space direction="vertical">
            <Link href="/faq" style={{ color: "#D1E4F2" }}>
              Câu hỏi thường gặp
            </Link>
            <Link href="/terms" style={{ color: "#D1E4F2" }}>
              Điều khoản sử dụng
            </Link>
            <Link href="/privacy" style={{ color: "#D1E4F2" }}>
              Chính sách bảo mật
            </Link>
          </Space>
        </Col>

        {/* Cột 4 - Mạng xã hội */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Title level={4} style={{ color: "#fff" }}>
            Kết Nối Với Chúng Tôi
          </Title>
          <Space size="middle">
            <Link
              href="https://facebook.com"
              target="_blank"
              style={{ fontSize: 24, color: "#D1E4F2" }}
            >
              <FacebookOutlined />
            </Link>
            <Link
              href="https://instagram.com"
              target="_blank"
              style={{ fontSize: 24, color: "#D1E4F2" }}
            >
              <InstagramOutlined />
            </Link>
            <Link
              href="https://youtube.com"
              target="_blank"
              style={{ fontSize: 24, color: "#D1E4F2" }}
            >
              <YoutubeOutlined />
            </Link>
          </Space>
        </Col>
      </Row>

      <Divider style={{ borderColor: "#D1E4F2" }} />

      {/* Bản quyền */}
      <Row justify="center">
        <Text style={{ color: "#D1E4F2" }}>
          © {new Date().getFullYear()} Cinema. All rights reserved.
        </Text>
      </Row>
    </Footer>
  );
};

export default AppFooter;
