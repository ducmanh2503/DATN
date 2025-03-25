import React from "react";
import { Card, Col, Row, Statistic, Progress } from "antd";
import {
  UserOutlined,
  VideoCameraOutlined,
  ScheduleOutlined,
  DollarOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { Area, Column } from "@ant-design/plots";

const Dashboard: React.FC = () => {
  // Data for the area chart
  const revenueData = [
    { date: "T2", revenue: 12500000 },
    { date: "T3", revenue: 18900000 },
    { date: "T4", revenue: 15600000 },
    { date: "T5", revenue: 22400000 },
    { date: "T6", revenue: 19800000 },
    { date: "T7", revenue: 24500000 },
    { date: "CN", revenue: 28900000 },
  ];

  // Configuration for the area chart
  const areaConfig = {
    data: revenueData,
    xField: "date",
    yField: "revenue",
    xAxis: {
      range: [0, 1],
      label: {
        style: {
          fill: "#666",
          fontSize: 12,
        },
      },
    },
    yAxis: {
      label: {
        formatter: (v: string) => `${Number(v) / 1000000}M`,
        style: {
          fill: "#666",
          fontSize: 12,
        },
      },
    },
    smooth: true,
    areaStyle: () => ({
      fill: "l(270) 0:#fff 0.5:#7ec2f3 1:#1890ff",
    }),
    line: {
      color: "#1890ff",
    },
    tooltip: {
      formatter: (data: any) => {
        return {
          name: "Doanh thu",
          value: data.revenue.toLocaleString("vi-VN") + " VND",
        };
      },
    },
  };

  // Configuration for the column chart
  const columnConfig = {
    data: revenueData,
    xField: "date",
    yField: "revenue",
    seriesField: "category",
    columnWidthRatio: 0.6,
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    yAxis: {
      label: {
        formatter: (v: string) => `${Number(v) / 1000000}M`,
      },
    },
    color: ({ category }: { category: string }) => {
      return category === "Doanh thu" ? "#1890ff" : "#f5222d";
    },
    columnStyle: {
      radius: [20, 20, 0, 0],
    },
    tooltip: {
      formatter: (data: any) => {
        return {
          name: data.category,
          value: data.revenue.toLocaleString("vi-VN") + " VND",
        };
      },
    },
    meta: {
      revenue: {
        alias: "Doanh thu",
      },
    },
  };

  return (
    <div style={{ padding: "24px" }}>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số người dùng"
              value={1128}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Phim đang chiếu"
              value={15}
              prefix={<VideoCameraOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Lịch chiếu hôm nay"
              value={42}
              prefix={<ScheduleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Doanh thu tháng"
              value={234500000}
              prefix={<DollarOutlined />}
              suffix="VND"
            />
          </Card>
        </Col>

        {/* New statistics */}
        <Col span={8}>
          <Card title="Tỉ lệ đặt vé trực tuyến">
            <Progress type="circle" percent={75} />
            <div style={{ marginTop: 16 }}>
              <Statistic
                title="Tổng số vé đã bán"
                value={542}
                prefix={<ShoppingCartOutlined />}
              />
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Thành viên mới">
            <Progress type="circle" percent={88} strokeColor="#52c41a" />
            <div style={{ marginTop: 16 }}>
              <Statistic
                title="Thành viên mới tháng này"
                value={128}
                prefix={<TeamOutlined />}
              />
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Tỉ lệ ghế đã đặt hôm nay">
            <Progress type="circle" percent={65} strokeColor="#1677ff" />
            <div style={{ marginTop: 16 }}>
              <Statistic title="Số ghế còn trống" value={234} suffix="ghế" />
            </div>
          </Card>
        </Col>

        {/* New Revenue Area Chart */}
        <Col span={24}>
          <Card title="Thống kê doanh thu 7 ngày gần nhất">
            <div style={{ height: "400px", padding: "20px 0" }}>
              <Area {...areaConfig} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
