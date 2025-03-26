import React, { useEffect, useState } from "react";
import { Row, Skeleton, Table } from "antd";
import clsx from "clsx";
import styles from "./DashBoard.module.css";
import Charts from "./Charts";
import CardsTitle from "./CardsTitle";
import { useDashboard } from "../../../services/adminServices/dashboardManage.service";

const Dashboard: React.FC = () => {
    const [dailyRevenueDate, setDailyRevenueDate] = useState<string>(""); // ngày của doanh thu theo ngày
    const [dailyRevenueValue, setDailyRevenueValue] = useState<number>(0); // tổng tiền doanh thu theo ngày
    const [monthlyRevenueDate, setMonthlyRevenueDate] = useState<string>(""); // tháng của doanh thu theo tháng
    const [monthlyRevenueValue, setMonthlyRevenueValue] = useState<number>(0); // tổng tiền của doanh thu theo tháng
    const [newCustomers, setNewCustomers] = useState<number>(0); // số lượng khách hàng mới
    const [totalTicketSold, setTotalTicketSold] = useState<number>(0); // số lượng vé sold

    const columns = [
        {
            title: "Tên phim",
            dataIndex: "movie_title",
            key: "movie_title",
        },
        {
            title: "Thời gian kinh doanh",
            dataIndex: "month_year",
            key: "month_year",
        },
        {
            title: "Tổng vé bán ra",
            dataIndex: "total_tickets",
            key: "total_tickets",
        },
        {
            title: "Tổng doanh thu",
            dataIndex: "total_revenue",
            key: "total_revenue",
            render: (value: any, record: any) => (
                <span>{record.total_revenue.toLocaleString("vi-VN")} VNĐ</span>
            ),
        },
    ];

    const { data: dashboardData, isLoading } = useDashboard();
    useEffect(() => {
        setDailyRevenueDate(dashboardData?.overview?.daily_revenue?.date);
        setDailyRevenueValue(dashboardData?.overview?.daily_revenue?.value);
        setMonthlyRevenueDate(
            dashboardData?.overview?.monthly_revenue?.month_year
        );
        setMonthlyRevenueValue(dashboardData?.overview?.monthly_revenue?.value);
        setNewCustomers(dashboardData?.overview?.new_customers);
        setTotalTicketSold(dashboardData?.overview?.total_tickets_sold);
    }, [dashboardData]);
    return (
        <>
            <Row gutter={[16, 16]}>
                <CardsTitle
                    dailyRevenueDate={dailyRevenueDate}
                    dailyRevenueValue={dailyRevenueValue}
                    monthlyRevenueDate={monthlyRevenueDate}
                    monthlyRevenueValue={monthlyRevenueValue}
                    newCustomers={newCustomers}
                    totalTicketSold={totalTicketSold}
                ></CardsTitle>
                <Charts></Charts>
            </Row>
            <h2 className={clsx(styles.titleTable)}>Doanh thu theo phim</h2>
            <Skeleton loading={isLoading} active>
                <Table
                    columns={columns}
                    dataSource={dashboardData?.movie_stats?.map(
                        (item: any, index: number) => ({
                            ...item,
                            key: item.movie_id || index,
                        })
                    )}
                />
            </Skeleton>
        </>
    );
};

export default Dashboard;
