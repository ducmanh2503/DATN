import { Column, Line, Pie } from "@ant-design/plots";
import { Skeleton } from "antd";
import clsx from "clsx";
import styles from "./DashBoard.module.css";

const ChartsFilm = ({ dashboardData, isLoading }: any) => {
    // biểu đồ 7 ngày
    const dataLine = dashboardData?.revenue_last_7_days.map((item: any) => ({
        date: item.date,
        totalPriceSold: item.total_revenue,
    }));
    const configLine = {
        data: dataLine,
        xField: "date",
        yField: "totalPriceSold",
        height: 280,
        width: 650,
    };

    //biểu đồ tròn

    const dataCircle = dashboardData?.additional_stats?.peak_showtimes.map(
        (item: any) => ({
            type: item.showtime,
            value: item.total_seats_booked,
        })
    );
    const configCircle = {
        data: dataCircle,
        angleField: "value", // Giá trị để tính góc
        colorField: "type", // Giá trị để phân loại màu
        height: 280,
        width: 570,
        radius: 0.9, // Bán kính (0-1)
        label: {
            type: "outer", // Hiển thị label bên ngoài
            // content: "{name} ({percentage})", // Nội dung hiển thị
            content: (item: any) => {
                console.log("check-item", item);

                return `suất ${item.type}`;
            },
        },
        legend: {
            position: "right", // Vị trí legend
        },
    };

    // biểu đồ films
    const dataFilms = dashboardData?.movie_stats.map((item: any) => {
        if (item.movie_status === "now_showing") {
            return {
                film: item.movie_title,
                total: item.total_tickets,
            };
        }
    });
    const configFilms = {
        data: dataFilms,
        xField: "film",
        yField: "total",
        height: 280,
        width: 350,
        xAxis: {
            label: {
                rotate: 45, // Xoay nhãn 45 độ
                autoRotate: false, // Tắt tự động xoay (nếu cần)
            },
        },
    };

    // biểu đồ vé
    const dataTicket = dashboardData?.movie_stats.map((item: any) => {
        if (item.movie_status === "now_showing") {
            return {
                film: item.movie_title,
                total: item.total_revenue,
            };
        }
    });
    const configTicket = {
        data: dataTicket,
        xField: "film",
        yField: "total",
        height: 280,
        width: 350,
        color: (item: any) => (item.total > 3000000 ? "#73d13d" : "#ff4d4f"),
    };
    return (
        <>
            <Skeleton loading={isLoading} active>
                <div className={clsx(styles.columnChart)}>
                    <div className={clsx(styles.secoudRowChart)}>
                        <h3 className={clsx(styles.tileChart)}>
                            Doanh thu 7 ngày gần nhất
                        </h3>
                        <Line {...configLine} />
                    </div>
                    <div>
                        <h3 className={clsx(styles.tileChart)}>
                            Top các khung giờ có lượt đạt ghế nhiều nhất
                        </h3>
                        <Pie {...configCircle} />
                    </div>
                </div>
                <div className={clsx(styles.columnChart)}>
                    <div className={clsx(styles.chartFilm)}>
                        <h3 className={clsx(styles.tileChart)}>
                            Doanh thu phim đang chiếu
                        </h3>
                        <Column {...configTicket} />
                    </div>
                </div>
            </Skeleton>
        </>
    );
};

export default ChartsFilm;
