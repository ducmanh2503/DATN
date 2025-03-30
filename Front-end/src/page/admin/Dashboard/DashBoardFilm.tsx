import { Button, DatePicker, Skeleton, Space, Table, Tag } from "antd";
import ChartsFilm from "./ChartsFilm";
import {
    useDashboard,
    useExcelExport,
} from "../../../services/adminServices/dashboardManage.service";
import { useState } from "react";
import clsx from "clsx";
import styles from "./DashBoard.module.css";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const DashBoardFilm = () => {
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const { mutate: exportExcel } = useExcelExport(); // hàm suất excel

    // lấy data khi dùng datapicker
    const changeDate = (dates: any, dateStrings: [string, string]) => {
        console.log("Ngày bắt đầu:", dateStrings[0]);
        console.log("Ngày kết thúc:", dateStrings[1]);
        setStartDate(dateStrings[0]);
        setEndDate(dateStrings[1]);
    };

    // xuất file excel khi ấn xuất
    const handleExport = () => {
        exportExcel(
            {
                start_date: startDate,
                end_date: endDate,
            },
            {
                onSuccess: (blob) => {
                    const url = window.URL.createObjectURL(new Blob([blob]));
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute("download", "statistics.xlsx");
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                },
                onError: (error) => {
                    console.error("Xuất file thất bại:", error);
                },
            }
        );
    };

    const { data: dashboardData, isLoading } = useDashboard();

    const columns = [
        {
            title: "Tên phim",
            dataIndex: "movie_title",
            key: "movie_title",
            render: (value: any, record: any) => (
                <span className={clsx(styles.titleFilm)}>
                    {record.movie_title}
                </span>
            ),
        },
        {
            title: "Thời gian kinh doanh",
            key: "month_year",
            render: (value: any, record: any) => {
                return (
                    <span>
                        <Tag color="geekblue">{record.show_date}</Tag>~{" "}
                        <Tag color="magenta">{record.end_date}</Tag>
                    </span>
                );
            },
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

    return (
        <>
            <div className={clsx(styles.btnAction)}>
                <RangePicker onChange={changeDate} />
                <Button color="cyan" variant="solid" onClick={handleExport}>
                    Xuất thống kê
                </Button>
            </div>
            <ChartsFilm
                dashboardData={dashboardData}
                isLoading={isLoading}
            ></ChartsFilm>
            <h2 className={clsx(styles.titleTable)}>
                Doanh thu phim đang chiếu
            </h2>

            <Skeleton loading={isLoading} active>
                <Table
                    columns={columns}
                    dataSource={dashboardData?.movie_stats
                        .filter(
                            (item: any) => item.movie_status === "now_showing"
                        )
                        .map((item: any, index: number) => ({
                            ...item,
                            key: item.movie_id || index,
                        }))}
                />
            </Skeleton>
            <h2 className={clsx(styles.titleTable)}>
                Doanh thu phim sắp chiếu
            </h2>
            <Skeleton loading={isLoading} active>
                <Table
                    columns={columns}
                    dataSource={dashboardData?.movie_stats
                        .filter(
                            (item: any) => item.movie_status === "coming_soon"
                        )
                        .map((item: any, index: number) => ({
                            ...item,
                            key: item.movie_id || index,
                        }))}
                />
            </Skeleton>
        </>
    );
};

export default DashBoardFilm;
